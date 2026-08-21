import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabaseEnv";

/** Server-side page_content lookup used by jobs browse hubs. */
export const fetchPageContentMap = cache(async (pageSlug: string) => {
  const map: Record<string, string> = {};

  try {
    const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
    const { data, error } = await supabase
      .from("page_content")
      .select("section_key, content_value")
      .eq("page_slug", pageSlug);

    if (error || !data) return map;

    for (const row of data) {
      if (row.section_key && row.content_value) {
        map[row.section_key] = row.content_value;
      }
    }
  } catch {
    // Fall back to hardcoded copy when CMS is unavailable.
  }

  return map;
});
