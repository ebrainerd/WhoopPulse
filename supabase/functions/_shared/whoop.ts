// Shared Whoop API helpers for Edge Functions (Deno runtime).

export const WHOOP_TOKEN_URL =
  'https://api.prod.whoop.com/oauth/oauth2/token';
export const WHOOP_API = 'https://api.prod.whoop.com/developer/v1';

export interface WhoopTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
}

export async function exchangeCode(params: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
  codeVerifier?: string;
}): Promise<WhoopTokens> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    client_secret: params.clientSecret,
  });
  if (params.codeVerifier) body.set('code_verifier', params.codeVerifier);

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Whoop token exchange failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as WhoopTokens;
}

export async function refreshTokens(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<WhoopTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: params.refreshToken,
    client_id: params.clientId,
    client_secret: params.clientSecret,
    scope: 'offline',
  });
  const res = await fetch(WHOOP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Whoop token refresh failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as WhoopTokens;
}

/** Fetches all pages of a Whoop collection endpoint since `start` (ISO). */
export async function fetchCollection<T>(
  path: string,
  accessToken: string,
  start: string,
): Promise<T[]> {
  const results: T[] = [];
  let nextToken: string | undefined;
  do {
    const url = new URL(`${WHOOP_API}${path}`);
    url.searchParams.set('start', start);
    url.searchParams.set('limit', '25');
    if (nextToken) url.searchParams.set('nextToken', nextToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Whoop ${path} failed: ${res.status} ${await res.text()}`);
    }
    const page = (await res.json()) as { records?: T[]; next_token?: string };
    if (page.records) results.push(...page.records);
    nextToken = page.next_token;
  } while (nextToken);
  return results;
}

export async function fetchProfile(
  accessToken: string,
): Promise<{ user_id?: number }> {
  const res = await fetch(`${WHOOP_API}/user/profile/basic`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return {};
  return (await res.json()) as { user_id?: number };
}

export function dateKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}
