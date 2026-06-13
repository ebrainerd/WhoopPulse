import { supabase } from '@/lib/supabase';
import type { JournalEntry } from '@/types/models';

import { journalToInsert, mapJournalRow } from './mappers';

export async function getJournalByDate(
  userId: string,
  date: string,
): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ? mapJournalRow(data) : null;
}

export async function listJournals(
  userId: string,
  limit = 90,
): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapJournalRow);
}

/** Upsert (insert or update) the journal for its date. */
export async function saveJournal(
  userId: string,
  entry: JournalEntry,
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert(journalToInsert(userId, entry), { onConflict: 'user_id,date' })
    .select('*')
    .single();
  if (error) throw error;
  return mapJournalRow(data);
}
