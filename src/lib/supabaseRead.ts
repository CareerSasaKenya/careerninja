/**
 * Public-page reads from Supabase.
 *
 * A paused/unpaid project, network failure, or PostgREST 5xx must not be
 * treated as "row missing". `notFound()` is HTTP 404, which Google may
 * deindex. Real outages should throw so crawlers see 5xx and retry.
 */

export const SUPABASE_NO_ROWS_CODE = "PGRST116";

export type SupabaseLikeError = {
  code?: string | null;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

export function isSupabaseMissingRowError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code =
    "code" in error ? String((error as SupabaseLikeError).code || "") : "";
  return code === SUPABASE_NO_ROWS_CODE;
}

export function throwIfSupabaseError(
  error: SupabaseLikeError | null | undefined,
  context: string
): void {
  if (!error) return;
  if (isSupabaseMissingRowError(error)) return;
  const detail = error.message || "request failed";
  const err = new Error(`${context}: ${detail}`);
  console.error(err.message, error);
  throw err;
}
