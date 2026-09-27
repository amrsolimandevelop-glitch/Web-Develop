import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Allow Vercel to build the project before environment variables are added.
  // Authentication remains disabled until both values are configured.
  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
