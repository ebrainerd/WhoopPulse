import {
  makeRedirectUri,
  useAuthRequest,
  type AuthRequestConfig,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';

import { env, isWhoopConfigured } from '@/config/env';
import { exchangeWhoopCode } from '@/services/whoop';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://api.prod.whoop.com/oauth/oauth2/auth',
  tokenEndpoint: 'https://api.prod.whoop.com/oauth/oauth2/token',
};

// Maximize scopes per the design doc. `offline` yields a refresh token so the
// sync function can keep pulling data after the access token expires.
const SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
  'read:profile',
  'read:body_measurement',
  'offline',
];

export function useWhoopAuth(onConnected?: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = makeRedirectUri({ scheme: 'whooprj', path: 'whoop-callback' });

  const config: AuthRequestConfig = {
    clientId: env.whoopClientId ?? 'missing-client-id',
    scopes: SCOPES,
    redirectUri,
    usePKCE: true,
    responseType: 'code',
  };

  const [request, , promptAsync] = useAuthRequest(config, discovery);

  const connect = useCallback(async () => {
    if (!isWhoopConfigured) {
      setError('Whoop client id is not configured (EXPO_PUBLIC_WHOOP_CLIENT_ID).');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success' || !result.params.code) {
        if (result.type === 'error') {
          setError(result.params.error_description ?? 'Authorization failed.');
        }
        return;
      }
      await exchangeWhoopCode(
        result.params.code,
        redirectUri,
        request?.codeVerifier,
      );
      onConnected?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Whoop connection failed.');
    } finally {
      setBusy(false);
    }
  }, [promptAsync, redirectUri, request, onConnected]);

  return { connect, busy, error, ready: Boolean(request), redirectUri };
}
