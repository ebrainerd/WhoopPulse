import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

import { Splash } from '@/components/ui/Splash';

/**
 * OAuth redirect target. On web, expo-auth-session opens this page in a popup;
 * `maybeCompleteAuthSession` posts the result back to the opener and closes it.
 * On native the deep link is handled by the auth session directly.
 */
export default function WhoopCallback() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return <Splash message="Finishing Whoop connection…" />;
}
