import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key (bypasses Row
 * Level Security). Never import this from a "use client" component — the
 * service-role key must never reach the browser.
 *
 * Lazily constructed (not at module scope) so that merely importing this
 * file — which happens for every route that imports src/lib/uploads.ts,
 * even ones that never actually upload anything — doesn't crash Next.js's
 * build-time page-data collection if the env vars happen to be unset in
 * that build context. The error now only surfaces when an upload is
 * actually attempted, with a clear message pointing at the missing var.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Project Settings > API) in the environment."
    );
  }

  cached = createClient(url, key);
  return cached;
}

export const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
