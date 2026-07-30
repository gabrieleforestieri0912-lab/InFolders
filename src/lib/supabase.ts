import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function initSupabase(url: string, key: string): SupabaseClient {
  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = (typeof process !== 'undefined' && (process as any)?.env?.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
  const key = (typeof process !== 'undefined' && (process as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

  if (url && key) {
    return initSupabase(url, key);
  }

  throw new Error('Supabase non configurato. Chiamare initSupabase() con url e chiave.');
}

export async function signInWithGoogleToken(googleToken: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: googleToken,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}
