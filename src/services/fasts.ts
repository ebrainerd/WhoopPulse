import { supabase } from '@/lib/supabase';
import type { Fast } from '@/types/models';

import { mapFastRow } from './mappers';

export async function getActiveFast(userId: string): Promise<Fast | null> {
  const { data, error } = await supabase
    .from('fasts')
    .select('*')
    .eq('user_id', userId)
    .is('end_at', null)
    .maybeSingle();
  if (error) throw error;
  return data ? mapFastRow(data) : null;
}

export async function listFasts(userId: string, limit = 60): Promise<Fast[]> {
  const { data, error } = await supabase
    .from('fasts')
    .select('*')
    .eq('user_id', userId)
    .order('start_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapFastRow);
}

export async function startFast(
  userId: string,
  targetHours: number,
  startAt: string = new Date().toISOString(),
): Promise<Fast> {
  const { data, error } = await supabase
    .from('fasts')
    .insert({ user_id: userId, start_at: startAt, target_hours: targetHours })
    .select('*')
    .single();
  if (error) throw error;
  return mapFastRow(data);
}

export async function endFast(
  userId: string,
  id: string,
  endAt: string = new Date().toISOString(),
): Promise<Fast> {
  const { data, error } = await supabase
    .from('fasts')
    .update({ end_at: endAt })
    .eq('user_id', userId)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapFastRow(data);
}
