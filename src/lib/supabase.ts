import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key (bypasses Row
 * Level Security). Never import this from a "use client" component — the
 * service-role key must never reach the browser.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
