import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompaniesDirectory } from "@/components/CompaniesDirectory";
import type { CompanyCardData } from "@/components/CompanyCard";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.careersasa.co.ke";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Companies Hiring in Kenya | CareerSasa",
  description:
    "Browse employers hiring on CareerSasa. Explore company profiles, industries, and open jobs across Kenya.",
  alternates: {
    canonical: `${SITE_URL.replace(/\/$/, "")}/companies`,
  },
  openGraph: {
    title: "Companies Hiring in Kenya | CareerSasa",
    description:
      "Browse employers hiring on CareerSasa. Explore company profiles, industries, and open jobs across Kenya.",
    url: `${SITE_URL.replace(/\/$/, "")}/companies`,
    type: "website",
    siteName: "CareerSasa",
  },
};

async function getCompaniesWithJobCounts(): Promise<CompanyCardData[]> {
  if (!supabase) return [];

  try {
    const [{ data: companies, error: companiesError }, { data: jobs, error: jobsError }] =
      await Promise.all([
        supabase
          .from("companies")
          .select("id, name, logo, website, industry, location, description")
          .order("name"),
        supabase
          .from("jobs")
          .select("company_id")
          .eq("status", "active")
          .not("company_id", "is", null),
      ]);

    if (companiesError) throw companiesError;
    if (jobsError) throw jobsError;

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

    const companyRows = (companies || []) as CompanyRow[];
    const jobRows = (jobs || []) as JobRow[];

    const openJobsByCompany = new Map<string, number>();
    for (const job of jobRows) {
      if (!job.company_id) continue;
      openJobsByCompany.set(
        job.company_id,
        (openJobsByCompany.get(job.company_id) || 0) + 1
      );
    }

    const rows: CompanyCardData[] = companyRows.map((company) => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      website: company.website,
      industry: company.industry,
      location: company.location,
      description: company.description,
      openJobs: openJobsByCompany.get(company.id) || 0,
    }));

    // Hiring companies first, then alphabetical
    rows.sort((a, b) => {
      if (b.openJobs !== a.openJobs) return b.openJobs - a.openJobs;
      return a.name.localeCompare(b.name);
    });

    return rows;
  } catch (error) {
    console.error("Error loading companies directory:", error);
    return [];
  }
}

export default async function CompaniesPage() {
  const companies = await getCompaniesWithJobCounts();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-subtle" aria-hidden />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <p className="text-sm font-medium text-primary mb-2 tracking-wide">
            Employers on CareerSasa
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Companies
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
            Explore employers hiring in Kenya. Open a company to see their profile and
            current CareerSasa job openings.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
        <CompaniesDirectory companies={companies} />
      </main>

      <Footer />
    </div>
  );
}
