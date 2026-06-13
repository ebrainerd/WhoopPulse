import { supabase } from '@/lib/supabase';
import type { BloodworkPanel } from '@/types/models';

import { mapBloodworkRow } from './mappers';

export async function listBloodworkPanels(
  userId: string,
): Promise<BloodworkPanel[]> {
  const { data, error } = await supabase
    .from('bloodwork_panels')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBloodworkRow);
}

export async function saveBloodworkPanel(
  userId: string,
  panel: Omit<BloodworkPanel, 'id' | 'userId' | 'createdAt'>,
): Promise<BloodworkPanel> {
  const { data, error } = await supabase
    .from('bloodwork_panels')
    .insert({
      user_id: userId,
      date: panel.date,
      markers: panel.markers,
      notes: panel.notes,
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapBloodworkRow(data);
}

export async function deleteBloodworkPanel(
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from('bloodwork_panels')
    .delete()
    .eq('user_id', userId)
    .eq('id', id);
  if (error) throw error;
}
