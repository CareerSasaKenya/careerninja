/**
 * Run: npx tsx src/lib/supabaseRead.test.ts
 */
import assert from "node:assert/strict";
import {
  SUPABASE_NO_ROWS_CODE,
  isSupabaseMissingRowError,
  throwIfSupabaseError,
} from "./supabaseRead";

assert.equal(
  isSupabaseMissingRowError(null),
  false,
  "null is not a missing-row error"
);
assert.equal(
  isSupabaseMissingRowError({ code: SUPABASE_NO_ROWS_CODE }),
  true,
  ".single() with 0 rows is missing, not an outage"
);
assert.equal(
  isSupabaseMissingRowError({
    code: "PGRST301",
    message: "JWT expired",
  }),
  false,
  "auth/project errors are outages, not 404s"
);
assert.equal(
  isSupabaseMissingRowError({
    message: "Could not query the database for the schema cache. Retrying.",
  }),
  false,
  "paused/unpaid project messages are outages, not 404s"
);

throwIfSupabaseError(null, "fetching job");
throwIfSupabaseError(undefined, "fetching job");
throwIfSupabaseError(
  { code: SUPABASE_NO_ROWS_CODE, message: "JSON object requested, multiple (or no) rows returned" },
  "fetching job"
);

assert.throws(
  () =>
    throwIfSupabaseError(
      { message: "Could not query the database for the schema cache. Retrying." },
      "fetching job"
    ),
  /fetching job: Could not query the database/,
  "outage errors must throw so the page is 5xx, not 404"
);

assert.throws(
  () =>
    throwIfSupabaseError(
      { code: "502", message: "Bad Gateway" },
      "fetching company"
    ),
  /fetching company: Bad Gateway/,
  "gateway failures must throw"
);

console.log("supabaseRead test: ok");
