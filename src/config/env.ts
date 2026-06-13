/**
 * Centralized access to public environment configuration.
 *
 * All values here come from `EXPO_PUBLIC_*` variables which are inlined into the
 * client bundle at build time. Secrets (Whoop client secret, service role keys)
 * must never live here — they belong in Supabase Edge Function secrets.
 */

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  supabaseUrl: readEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  whoopClientId: readEnv('EXPO_PUBLIC_WHOOP_CLIENT_ID'),
  defaultLocation: {
    lat: Number(readEnv('EXPO_PUBLIC_DEFAULT_LAT') ?? '33.8622'),
    lng: Number(readEnv('EXPO_PUBLIC_DEFAULT_LNG') ?? '-118.3995'),
    name: readEnv('EXPO_PUBLIC_DEFAULT_LOCATION_NAME') ?? 'Hermosa Beach, CA',
  },
};

/** True when Supabase has been configured. Used to show a friendly setup screen. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** True when the Whoop OAuth client id is configured. */
export const isWhoopConfigured = Boolean(env.whoopClientId);
