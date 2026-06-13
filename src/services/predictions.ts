import { supabase } from '@/lib/supabase';
import type { Prediction, Recommendation, RecommendationLog } from '@/types/models';

import { mapPredictionRow, predictionToInsert } from './mappers';

export async function listPredictions(
  userId: string,
  limit = 90,
): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapPredictionRow);
}

export async function getPredictionByDate(
  userId: string,
  date: string,
): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPredictionRow(data) : null;
}

export async function savePrediction(
  userId: string,
  p: Prediction,
): Promise<Prediction> {
  const { data, error } = await supabase
    .from('predictions')
    .upsert(predictionToInsert(userId, p), { onConflict: 'user_id,date' })
    .select('*')
    .single();
  if (error) throw error;
  return mapPredictionRow(data);
}

/**
 * Back-fills `actual_score` on past predictions once the matching Whoop recovery
 * arrives. Drives the accuracy-over-time view.
 */
export async function reconcilePredictionActuals(
  userId: string,
  recoveryByDate: Map<string, number>,
): Promise<number> {
  const predictions = await listPredictions(userId, 365);
  let updated = 0;
  for (const p of predictions) {
    if (p.actualScore != null) continue;
    const actual = recoveryByDate.get(p.date);
    if (actual == null) continue;
    const { error } = await supabase
      .from('predictions')
      .update({ actual_score: actual })
      .eq('user_id', userId)
      .eq('date', p.date);
    if (!error) updated += 1;
  }
  return updated;
}

export async function logRecommendations(
  userId: string,
  date: string,
  recs: Recommendation[],
): Promise<void> {
  if (recs.length === 0) return;
  const rows = recs.map((r) => ({
    user_id: userId,
    date,
    action_key: r.key,
    title: r.title,
    impact_points: r.impactPoints,
  }));
  // Insert only those not already logged for the day.
  const { error } = await supabase
    .from('recommendations_log')
    .upsert(rows, { onConflict: 'user_id,date,action_key', ignoreDuplicates: true });
  if (error) throw error;
}

export async function listRecommendationLogs(
  userId: string,
  date: string,
): Promise<RecommendationLog[]> {
  const { data, error } = await supabase
    .from('recommendations_log')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    actionKey: row.action_key,
    title: row.title,
    impactPoints: row.impact_points,
    followed: row.followed,
  }));
}

export async function listRecommendationLogsSince(
  userId: string,
  sinceDate: string,
): Promise<RecommendationLog[]> {
  const { data, error } = await supabase
    .from('recommendations_log')
    .select('*')
    .eq('user_id', userId)
    .gte('date', sinceDate);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    actionKey: row.action_key,
    title: row.title,
    impactPoints: row.impact_points,
    followed: row.followed,
  }));
}

export async function setRecommendationFollowed(
  userId: string,
  date: string,
  actionKey: string,
  followed: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('recommendations_log')
    .update({ followed })
    .eq('user_id', userId)
    .eq('date', date)
    .eq('action_key', actionKey);
  if (error) throw error;
}
