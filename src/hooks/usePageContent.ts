import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface PageContent {
  id: string;
  page_slug: string;
  section_key: string;
  content_type: string;
  content_value: string;
  metadata: Database['public']['Tables']['page_content']['Row']['metadata'];
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch page content from Supabase
 * @param pageSlug - The page identifier (e.g., 'home', 'services-cv')
 * @param sectionKey - Optional specific section key to fetch
 */
export function usePageContent(pageSlug: string, sectionKey?: string) {
  return useQuery({
    queryKey: ["page-content", pageSlug, sectionKey],
    queryFn: async () => {
      if (sectionKey) {
        const { data, error } = await supabase
          .from("page_content")
          .select("*")
          .eq("page_slug", pageSlug)
          .eq("section_key", sectionKey)
          .single();

        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", pageSlug);

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Helper function to get content value with fallback
 */
export function getContentValue(
  content: PageContent[] | PageContent | null | undefined,
  sectionKey: string,
  fallback: string = ""
): string {
  if (!content) return fallback;

  if (Array.isArray(content)) {
    const item = content.find((c) => c.section_key === sectionKey);
    return item?.content_value || fallback;
  }

  return content.section_key === sectionKey ? content.content_value : fallback;
}

/**
 * Helper to parse JSON content
 */
export function getJsonContent<T = any>(
  content: PageContent[] | PageContent | null | undefined,
  sectionKey: string,
  fallback: T
): T {
  const value = getContentValue(content, sectionKey);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
