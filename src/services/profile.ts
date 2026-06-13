import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/models';

import { mapProfileRow } from './mappers';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfileRow(data) : null;
}

export async function upsertProfile(
  userId: string,
  patch: Partial<Omit<Profile, 'id'>>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        full_name: patch.fullName,
        timezone: patch.timezone,
        location_lat: patch.locationLat,
        location_lng: patch.locationLng,
        location_name: patch.locationName,
        baseline_recovery: patch.baselineRecovery,
        onboarded_at: patch.onboardedAt,
      },
      { onConflict: 'id' },
    )
    .select('*')
    .single();
  if (error) throw error;
  return mapProfileRow(data);
}

export async function markOnboarded(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}
