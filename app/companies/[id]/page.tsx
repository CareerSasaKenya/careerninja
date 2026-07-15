import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  MapPin,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanyLogo } from "@/components/CompanyLogo";
import JobCard from "@/components/JobCard";
import CompanyStructuredData from "@/components/CompanyStructuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveCompanyLogoUrl, resolveCompanyWebsite } from "@/lib/companyLogo";

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

type CompanyRow = {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  size: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type CompanyJob = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  salary: string | null;
  company_id: string | null;
  industry: string | null;
  job_location_type: string | null;
  employment_type: string | null;
  job_location_city: string | null;
  job_location_county: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  experience_level: string | null;
  date_posted: string | null;
  valid_through: string | null;
  application_url: string | null;
  apply_email: string | null;
  apply_link: string | null;
  job_function: string | null;
  job_slug: string | null;
  is_featured: boolean | null;
  is_promoted: boolean | null;
  promotion_tier: string | null;
  companies?: {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
  } | null;
};

async function getCompany(id: string): Promise<CompanyRow | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data as CompanyRow | null;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

async function getCompanyJobs(
  companyId: string,
  companyName: string
): Promise<CompanyJob[]> {
  if (!supabase) return [];

  try {
    const jobSelect = `
      id, title, company, location, description, salary, company_id,
      industry, job_location_type, employment_type,
      job_location_city, job_location_county,
      salary_min, salary_max, salary_currency, salary_period,
      experience_level, date_posted, valid_through,
      application_url, apply_email, apply_link, job_function, job_slug,
      is_featured, is_promoted, promotion_tier,
      companies ( id, name, logo, website )
    `;

    const [{ data: byId, error: byIdError }, { data: byName, error: byNameError }] =
      await Promise.all([
        supabase
          .from("jobs")
          .select(jobSelect)
          .eq("company_id", companyId)
          .eq("status", "active")
          .order("is_featured", { ascending: false, nullsFirst: false })
          .order("is_promoted", { ascending: false, nullsFirst: false })
          .order("date_posted", { ascending: false })
          .limit(50),
        // Catch active listings that still only have a company name match
        supabase
          .from("jobs")
          .select(jobSelect)
          .is("company_id", null)
          .ilike("company", companyName)
          .eq("status", "active")
          .order("date_posted", { ascending: false })
          .limit(50),
      ]);

    if (byIdError) throw byIdError;
    if (byNameError) throw byNameError;

    const merged = new Map<string, CompanyJob>();
    for (const job of [...(byId || []), ...(byName || [])] as CompanyJob[]) {
      merged.set(job.id, job);
    }

    return Array.from(merged.values()).sort((a, b) => {
      const featured = Number(!!b.is_featured) - Number(!!a.is_featured);
      if (featured !== 0) return featured;
      const promoted = Number(!!b.is_promoted) - Number(!!a.is_promoted);
      if (promoted !== 0) return promoted;
      return (
        new Date(b.date_posted || 0).getTime() -
        new Date(a.date_posted || 0).getTime()
      );
    });
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return [];
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    return {
      title: "Company Not Found | CareerSasa",
      description: "This company profile could not be found on CareerSasa.",
    };
  }

  const pageUrl = `${SITE_URL.replace(/\/$/, "")}/companies/${company.id}`;
  const website = resolveCompanyWebsite(company.name, company.website);
  const logo = resolveCompanyLogoUrl({
    logo: company.logo,
    website: company.website,
    companyName: company.name,
  });

  const locationBit = company.location ? ` in ${company.location}` : " in Kenya";
  const industryBit = company.industry ? ` (${company.industry})` : "";
  const description =
    company.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Explore ${company.name}${industryBit} careers${locationBit} on CareerSasa. View open roles and apply today.`;

  return {
    title: `${company.name} Careers & Jobs${locationBit} | CareerSasa`,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${company.name} Careers | CareerSasa`,
      description,
      url: pageUrl,
      type: "website",
      siteName: "CareerSasa",
      images: logo
        ? [{ url: logo, alt: `${company.name} logo` }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `${company.name} Careers | CareerSasa`,
      description,
      images: logo ? [logo] : undefined,
    },
    other: website ? { "company:website": website } : undefined,
  };
}

function websiteHref(website: string | null | undefined): string | null {
  if (!website) return null;
  return website.startsWith("http") ? website : `https://${website}`;
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  const jobs = await getCompanyJobs(company.id, company.name);
  const pageUrl = `${SITE_URL.replace(/\/$/, "")}/companies/${company.id}`;
  const externalWebsite = websiteHref(
    resolveCompanyWebsite(company.name, company.website) || company.website
  );
  const jobCountLabel =
    jobs.length === 1 ? "1 open role" : `${jobs.length} open roles`;

  return (
    <>
      <CompanyStructuredData company={company} pageUrl={pageUrl} />
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        {/* Brand hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div
            className="absolute inset-0 bg-gradient-mesh opacity-80"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-subtle"
            aria-hidden
          />
          <div className="container relative mx-auto px-4 py-10 md:py-14">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to jobs
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8 animate-fade-in">
              <CompanyLogo
                name={company.name}
                logo={company.logo}
                website={company.website}
                size="2xl"
                className="rounded-xl border border-border/60 bg-background shadow-lg ring-1 ring-primary/10"
              />

              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-primary mb-1 tracking-wide">
                    Hiring on CareerSasa
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    {company.name}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-2">
                  {company.industry && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/15">
                      <Building2 className="h-3.5 w-3.5 mr-1" />
                      {company.industry}
                    </Badge>
                  )}
                  {company.location && (
                    <Badge variant="outline">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {company.location}
                    </Badge>
                  )}
                  {company.size && (
                    <Badge variant="outline">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {/employee|staff|people/i.test(company.size)
                        ? company.size
                        : `${company.size} employees`}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    {jobCountLabel}
                  </Badge>
                </div>

                {company.description && (
                  <p className="text-muted-foreground max-w-2xl line-clamp-3 leading-relaxed">
                    {company.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  {jobs.length > 0 && (
                    <Button asChild variant="gradient" size="lg">
                      <a href="#open-jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        View open roles
                      </a>
                    </Button>
                  )}
                  {externalWebsite && (
                    <Button asChild variant="outline" size="lg">
                      <a
                        href={externalWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-10 md:py-12 flex-1 space-y-10">
          {/* About */}
          {(company.description ||
            company.industry ||
            company.location ||
            company.size ||
            externalWebsite) && (
            <section aria-labelledby="about-heading" className="animate-fade-in">
              <Card className="border-border/60 overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle id="about-heading" className="text-xl md:text-2xl">
                    About {company.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6 space-y-6">
                  {company.description ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {company.description.replace(/<[^>]*>/g, "")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">
                      {company.name} is hiring on CareerSasa
                      {company.industry ? ` in the ${company.industry} space` : ""}
                      {company.location ? ` · based in ${company.location}` : ""}.
                      Browse current openings below and apply directly.
                    </p>
                  )}

                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {company.industry && (
                      <div className="rounded-lg bg-muted/40 px-4 py-3">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Industry
                        </dt>
                        <dd className="font-medium">{company.industry}</dd>
                      </div>
                    )}
                    {company.location && (
                      <div className="rounded-lg bg-muted/40 px-4 py-3">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Location
                        </dt>
                        <dd className="font-medium">{company.location}</dd>
                      </div>
                    )}
                    {company.size && (
                      <div className="rounded-lg bg-muted/40 px-4 py-3">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Company size
                        </dt>
                        <dd className="font-medium">{company.size}</dd>
                      </div>
                    )}
                    {externalWebsite && (
                      <div className="rounded-lg bg-muted/40 px-4 py-3 sm:col-span-2 lg:col-span-1">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Website
                        </dt>
                        <dd>
                          <a
                            href={externalWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline inline-flex items-center gap-1 break-all"
                          >
                            {externalWebsite.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Open jobs on CareerSasa */}
          <section
            id="open-jobs"
            aria-labelledby="jobs-heading"
            className="scroll-mt-24 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2
                  id="jobs-heading"
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                >
                  Open jobs at {company.name}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {jobs.length > 0
                    ? `Active listings posted on CareerSasa · ${jobCountLabel}`
                    : "No active CareerSasa listings right now"}
                </p>
              </div>
              <Link
                href="/jobs"
                className="text-sm font-medium text-primary hover:underline"
              >
                Browse all CareerSasa jobs
              </Link>
            </div>

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                {jobs.map((job, index) => (
                  <div
                    key={job.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="animate-fade-in"
                  >
                    <JobCard
                      id={job.id}
                      title={job.title}
                      company={job.companies?.name || job.company || company.name}
                      location={job.location || ""}
                      locationCity={job.job_location_city}
                      locationCounty={job.job_location_county}
                      description={job.description || ""}
                      salary={job.salary || undefined}
                      companyId={job.company_id || company.id}
                      companyLogo={job.companies?.logo || company.logo}
                      companyWebsite={
                        job.companies?.website || company.website
                      }
                      industry={job.industry}
                      locationType={job.job_location_type}
                      employmentType={job.employment_type}
                      salaryMin={job.salary_min}
                      salaryMax={job.salary_max}
                      salaryCurrency={job.salary_currency}
                      salaryPeriod={job.salary_period}
                      experienceLevel={job.experience_level}
                      datePosted={job.date_posted}
                      validThrough={job.valid_through}
                      applicationUrl={job.application_url}
                      applyEmail={job.apply_email}
                      applyLink={job.apply_link}
                      department={job.job_function}
                      jobSlug={job.job_slug}
                      isFeatured={job.is_featured}
                      isPromoted={job.is_promoted}
                      promotionTier={job.promotion_tier}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-border/70">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      No open roles listed yet
                    </p>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {company.name} doesn&apos;t have active jobs on CareerSasa
                      at the moment. Check back soon or browse other openings.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/jobs">Browse all jobs</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
