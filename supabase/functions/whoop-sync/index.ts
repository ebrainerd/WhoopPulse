// Refreshes the Whoop token if needed, pulls recent recovery/cycle/sleep data,
// and upserts it into `whoop_cycles`. Invoked by the app with the user's JWT.
import { createClient } from 'jsr:@supabase/supabase-js@2';

import { corsHeaders, json } from '../_shared/cors.ts';
import {
  dateKey,
  fetchCollection,
  refreshTokens,
} from '../_shared/whoop.ts';

interface RecoveryRecord {
  cycle_id: number;
  sleep_id: number;
  score?: {
    recovery_score?: number;
    resting_heart_rate?: number;
    hrv_rmssd_milli?: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
  created_at?: string;
}

interface CycleRecord {
  id: number;
  start?: string;
  end?: string;
  score?: { strain?: number; kilojoule?: number };
}

interface SleepRecord {
  id: number;
  score?: {
    sleep_performance_percentage?: number;
    sleep_efficiency_percentage?: number;
    sleep_consistency_percentage?: number;
    respiratory_rate?: number;
    stage_summary?: {
      total_in_bed_time_milli?: number;
      total_awake_time_milli?: number;
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const { days = 14 } = await req.json().catch(() => ({ days: 14 }));

    const clientId = Deno.env.get('WHOOP_CLIENT_ID');
    const clientSecret = Deno.env.get('WHOOP_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return json({ error: 'Whoop credentials not configured' }, 500);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: 'Invalid user' }, 401);

    const { data: conn, error: connError } = await supabase
      .from('whoop_connections')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (connError) throw connError;
    if (!conn || !conn.access_token) {
      return json({ error: 'Whoop not connected' }, 400);
    }

    // Refresh the access token if it is expired or close to expiring.
    let accessToken = conn.access_token as string;
    const expiresAt = conn.token_expires_at
      ? new Date(conn.token_expires_at).getTime()
      : 0;
    if (Date.now() > expiresAt - 60_000 && conn.refresh_token) {
      const refreshed = await refreshTokens({
        refreshToken: conn.refresh_token as string,
        clientId,
        clientSecret,
      });
      accessToken = refreshed.access_token;
      await supabase
        .from('whoop_connections')
        .update({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          token_expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000,
          ).toISOString(),
        })
        .eq('user_id', user.id);
    }

    const start = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [recoveries, cycles, sleeps] = await Promise.all([
      fetchCollection<RecoveryRecord>('/recovery', accessToken, start),
      fetchCollection<CycleRecord>('/cycle', accessToken, start),
      fetchCollection<SleepRecord>('/activity/sleep', accessToken, start),
    ]);

    const cycleById = new Map(cycles.map((c) => [c.id, c]));
    const sleepById = new Map(sleeps.map((s) => [s.id, s]));

    const rows = recoveries
      .map((rec) => {
        const cycle = cycleById.get(rec.cycle_id);
        const date = dateKey(cycle?.end ?? cycle?.start ?? rec.created_at);
        if (!date) return null;
        const sleep = sleepById.get(rec.sleep_id);
        const stage = sleep?.score?.stage_summary;
        const sleepMin =
          stage?.total_in_bed_time_milli != null
            ? (stage.total_in_bed_time_milli -
                (stage.total_awake_time_milli ?? 0)) /
              60000
            : null;
        return {
          user_id: user.id,
          date,
          recovery_score: rec.score?.recovery_score ?? null,
          hrv_ms: rec.score?.hrv_rmssd_milli ?? null,
          rhr_bpm: rec.score?.resting_heart_rate ?? null,
          skin_temp_c: rec.score?.skin_temp_celsius ?? null,
          spo2: rec.score?.spo2_percentage ?? null,
          day_strain: cycle?.score?.strain ?? null,
          resting_calories: null,
          sleep_performance: sleep?.score?.sleep_performance_percentage ?? null,
          sleep_duration_min: sleepMin,
          sleep_efficiency: sleep?.score?.sleep_efficiency_percentage ?? null,
          sleep_consistency: sleep?.score?.sleep_consistency_percentage ?? null,
          respiratory_rate: sleep?.score?.respiratory_rate ?? null,
          raw: rec as unknown as Record<string, unknown>,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from('whoop_cycles')
        .upsert(rows, { onConflict: 'user_id,date' });
      if (upsertError) throw upsertError;
    }

    await supabase
      .from('whoop_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', user.id);

    return json({ ok: true, synced: rows.length });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
