import { supabase } from '@/lib/supabase';
import type { Experiment } from '@/types/models';

import { mapExperimentRow } from './mappers';

export async function listExperiments(userId: string): Promise<Experiment[]> {
  const { data, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapExperimentRow);
}

export async function createExperiment(
  userId: string,
  exp: Omit<Experiment, 'id' | 'userId' | 'createdAt'>,
): Promise<Experiment> {
  const { data, error } = await supabase
    .from('experiments')
    .insert({
      user_id: userId,
      title: exp.title,
      hypothesis: exp.hypothesis,
      condition_key: exp.conditionKey,
      start_date: exp.startDate,
      end_date: exp.endDate,
      target_days: exp.targetDays,
      status: exp.status,
      result_summary: exp.resultSummary,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapExperimentRow(data);
}

export async function completeExperiment(
  userId: string,
  id: string,
  endDate: string,
  resultSummary: string,
): Promise<void> {
  const { error } = await supabase
    .from('experiments')
    .update({ status: 'completed', end_date: endDate, result_summary: resultSummary })
    .eq('user_id', userId)
    .eq('id', id);
  if (error) throw error;
}

export async function abandonExperiment(
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('experiments')
    .update({ status: 'abandoned', end_date: new Date().toISOString().slice(0, 10) })
    .eq('user_id', userId)
    .eq('id', id);
  if (error) throw error;
}
