import { supabase } from '@/lib/supabase';
import type { WhoopConnection, WhoopCycle } from '@/types/models';

import { mapCycleRow } from './mappers';

export async function listCycles(
  userId: string,
  limit = 90,
): Promise<WhoopCycle[]> {
  const { data, error } = await supabase
    .from('whoop_cycles')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapCycleRow);
}

export async function getCycleByDate(
  userId: string,
  date: string,
): Promise<WhoopCycle | null> {
  const { data, error } = await supabase
    .from('whoop_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCycleRow(data) : null;
}

export async function getWhoopConnection(
  userId: string,
): Promise<WhoopConnection | null> {
  const { data, error } = await supabase
    .from('whoop_connections')
    .select('user_id, whoop_user_id, connected_at, last_synced_at, scopes')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    userId: data.user_id,
    whoopUserId: data.whoop_user_id,
    connectedAt: data.connected_at,
    lastSyncedAt: data.last_synced_at,
    scopes: data.scopes,
  };
}

/**
 * Triggers the server-side Whoop sync Edge Function, which refreshes the OAuth
 * token and pulls recent recovery/sleep/cycle data into `whoop_cycles`.
 */
export async function triggerWhoopSync(): Promise<{ synced: number }> {
  const { data, error } = await supabase.functions.invoke('whoop-sync', {
    body: { days: 14 },
  });
  if (error) throw error;
  return { synced: (data as { synced?: number })?.synced ?? 0 };
}

/**
 * Exchanges an OAuth authorization code for tokens via the `whoop-auth` Edge
 * Function (which holds the client secret). Returns once tokens are stored.
 */
export async function exchangeWhoopCode(
  code: string,
  redirectUri: string,
  codeVerifier?: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke('whoop-auth', {
    body: { code, redirect_uri: redirectUri, code_verifier: codeVerifier },
  });
  if (error) throw error;
}
