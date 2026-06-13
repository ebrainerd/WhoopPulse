import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env, isSupabaseConfigured } from '@/config/env';
import type { Database } from '@/types/database';

/**
 * Supabase client. On native we persist the session in AsyncStorage; on web the
 * default localStorage adapter is used. When Supabase is not configured we still
 * create a client with placeholder values so imports don't crash — screens guard
 * on `isSupabaseConfigured` and render a setup prompt instead.
 */
export const supabase = createClient<Database>(
  env.supabaseUrl ?? 'http://localhost:54321',
  env.supabaseAnonKey ?? 'public-anon-key-placeholder',
  {
    auth: {
      ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  },
);

export { isSupabaseConfigured };
