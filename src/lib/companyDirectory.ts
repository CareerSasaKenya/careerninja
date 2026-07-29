import { createClient } from "@supabase/supabase-js";
import type { CompanyCardData } from "@/components/CompanyCard";
import { fuzzyMatchOption } from "@/lib/jobParseNormalization";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const ALL_INDUSTRIES_SLUG = "all";

export type IndustryCardData = {
  name: string;
  slug: string;
  companyCount: number;
  openJobs: number;
  hiringCount: number;
};

export type CompanyDirectoryData = {
  companies: CompanyCardData[];
  industries: string[];
  industryCards: IndustryCardData[];
};

export type HomepageStats = {
  activeJobs: number;
  companies: number;
};

/** URL slug for an industry name (or "all"). */
export function industryToSlug(name: string): string {
  if (!name || name === ALL_INDUSTRIES_SLUG) return ALL_INDUSTRIES_SLUG;
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveIndustryFromSlug(
  slug: string,
  industries: string[]
): string | null {
  if (!slug || slug === ALL_INDUSTRIES_SLUG) return null;
  const match = industries.find((name) => industryToSlug(name) === slug);
  return match ?? null;
}

/** PostgREST/Supabase caps each response at max_rows (default 1000). */
const DIRECTORY_PAGE_SIZE = 1000;

type CompanyRow = {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
};
type JobRow = { company_id: string | null };
type IndustryRow = { id: number | string; name: string };

async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const to = from + DIRECTORY_PAGE_SIZE - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < DIRECTORY_PAGE_SIZE) break;
    from += DIRECTORY_PAGE_SIZE;
  }

  return rows;
}

export async function getCompanyDirectoryData(): Promise<CompanyDirectoryData> {
  if (!supabase) {
    return { companies: [], industries: [], industryCards: [] };
  }

  try {
    const [companyRows, jobRows, industryRows] = await Promise.all([
      fetchAllRows<CompanyRow>((from, to) =>
        supabase!
          .from("companies")
          .select("id, name, logo, website, industry, location, description")
          .order("name")
          .range(from, to)
      ),
      fetchAllRows<JobRow>((from, to) =>
        supabase!
          .from("jobs")
          .select("company_id")
          .eq("status", "active")
          .not("company_id", "is", null)
          .order("id")
          .range(from, to)
      ),
      fetchAllRows<IndustryRow>((from, to) =>
        supabase!.from("industries").select("id, name").order("name").range(from, to)
      ),
    ]);

    const industries = industryRows
      .map((row) => row.name.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const openJobsByCompany = new Map<string, number>();
    for (const job of jobRows) {
      if (!job.company_id) continue;
      openJobsByCompany.set(
        job.company_id,
        (openJobsByCompany.get(job.company_id) || 0) + 1
      );
    }

    const rows: CompanyCardData[] = companyRows.map((company) => {
      const canonicalIndustry = company.industry
        ? fuzzyMatchOption(company.industry, industries) || company.industry
        : null;

      return {
        id: company.id,
        name: company.name,
        logo: company.logo,
        website: company.website,
        industry: canonicalIndustry,
        location: company.location,
        description: company.description,
        openJobs: openJobsByCompany.get(company.id) || 0,
      };
    });

    // Alphabetical company lists within an industry feel browseable;
    // still surface hiring employers first.
    rows.sort((a, b) => {
      if (b.openJobs !== a.openJobs) return b.openJobs - a.openJobs;
      return a.name.localeCompare(b.name);
    });

    const industryCards: IndustryCardData[] = industries.map((name) => {
      const inIndustry = rows.filter((c) => c.industry === name);
      const openJobs = inIndustry.reduce((sum, c) => sum + c.openJobs, 0);
      const hiringCount = inIndustry.filter((c) => c.openJobs > 0).length;
      return {
        name,
        slug: industryToSlug(name),
        companyCount: inIndustry.length,
        openJobs,
        hiringCount,
      };
    });

    return { companies: rows, industries, industryCards };
  } catch (error) {
    console.error("Error loading companies directory:", error);
    return { companies: [], industries: [], industryCards: [] };
  }
}

/** Live counts for homepage counters. */
export async function getHomepageStats(): Promise<HomepageStats> {
  if (!supabase) {
    return { activeJobs: 0, companies: 0 };
  }

  try {
    const [
      { count: activeJobs, error: jobsError },
      { count: companies, error: companiesError },
    ] = await Promise.all([
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("companies").select("id", { count: "exact", head: true }),
    ]);

    if (jobsError) throw jobsError;
    if (companiesError) throw companiesError;

    return {
      activeJobs: activeJobs ?? 0,
      companies: companies ?? 0,
    };
  } catch (error) {
    console.error("Error loading homepage stats:", error);
    return { activeJobs: 0, companies: 0 };
  }
}
