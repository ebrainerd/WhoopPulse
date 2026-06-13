// Exchanges a Whoop OAuth authorization code for tokens and stores them.
// Invoked by the app with the user's JWT; writes are scoped by RLS to that user.
import { createClient } from 'jsr:@supabase/supabase-js@2';

import { corsHeaders, json } from '../_shared/cors.ts';
import { exchangeCode, fetchProfile } from '../_shared/whoop.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization' }, 401);

    const { code, redirect_uri, code_verifier } = await req.json();
    if (!code || !redirect_uri) {
      return json({ error: 'Missing code or redirect_uri' }, 400);
    }

    const clientId = Deno.env.get('WHOOP_CLIENT_ID');
    const clientSecret = Deno.env.get('WHOOP_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      return json({ error: 'Whoop credentials not configured' }, 500);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: 'Invalid user' }, 401);

    const tokens = await exchangeCode({
      code,
      redirectUri: redirect_uri,
      clientId,
      clientSecret,
      codeVerifier: code_verifier,
    });

    const profile = await fetchProfile(tokens.access_token);
    const expiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    const { error } = await supabase.from('whoop_connections').upsert(
      {
        user_id: user.id,
        whoop_user_id: profile.user_id ? String(profile.user_id) : null,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        scopes: tokens.scope ?? null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) throw error;

    return json({ ok: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});
