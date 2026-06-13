/**
 * Centralized access to public environment configuration.
 *
 * All values here come from `EXPO_PUBLIC_*` variables which are inlined into the
 * client bundle at build time. Secrets (Whoop client secret, service role keys)
 * must never live here — they belong in Supabase Edge Function secrets.
 *
 * IMPORTANT: `EXPO_PUBLIC_*` vars are only inlined into production bundles when
 * referenced STATICALLY (e.g. `process.env.EXPO_PUBLIC_SUPABASE_URL`). Dynamic
 * access like `process.env[key]` is NOT replaced by the bundler and resolves to
 * undefined in web/native release builds — so every variable below is read with
 * a direct, static reference.
 */

function clean(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  supabaseUrl: clean(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: clean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  whoopClientId: clean(process.env.EXPO_PUBLIC_WHOOP_CLIENT_ID),
  defaultLocation: {
    lat: Number(clean(process.env.EXPO_PUBLIC_DEFAULT_LAT) ?? '33.8622'),
    lng: Number(clean(process.env.EXPO_PUBLIC_DEFAULT_LNG) ?? '-118.3995'),
    name: clean(process.env.EXPO_PUBLIC_DEFAULT_LOCATION_NAME) ?? 'Hermosa Beach, CA',
  },
};

/** True when Supabase has been configured. Used to show a friendly setup screen. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** True when the Whoop OAuth client id is configured. */
export const isWhoopConfigured = Boolean(env.whoopClientId);
