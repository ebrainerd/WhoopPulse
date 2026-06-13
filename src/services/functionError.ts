import { FunctionsHttpError } from '@supabase/supabase-js';

/**
 * Supabase's `functions.invoke` returns a generic error ("Edge Function
 * returned a non-2xx status code") and hides the response body. This pulls out
 * the `{ error }` message our functions return so the UI can show what actually
 * went wrong (e.g. "Whoop not connected", "Whoop /recovery failed: 401 …").
 */
export async function describeFunctionError(
  error: unknown,
  fallback = 'Edge Function request failed.',
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body && typeof body.error === 'string') return body.error;
    } catch {
      // body wasn't JSON; fall through
    }
    try {
      const text = await error.context.text();
      if (text) return text;
    } catch {
      // ignore
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
