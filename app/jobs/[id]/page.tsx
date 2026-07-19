import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { Flag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, DollarSign, FileText, Clock, Briefcase, GraduationCap, Award, Code, Globe, AlertTriangle, Target, TrendingUp, Layers, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import JobCard from "@/components/JobCard";
import JobDetailsHeader from "@/components/JobDetailsHeader";
import { buildLocationString } from "@/lib/textUtils";
import JobStructuredData from "@/components/JobStructuredData";
import ApplySection from "@/components/ApplySection";
import SocialShare from "@/components/SocialShare";
import ServiceAdvertisement from "@/components/ServiceAdvertisement";
import { AdminEditJobButton } from "@/components/AdminEditJobButton";
import JobViewTracker from "@/components/JobViewTracker";
import CVAdBanner from "@/components/CVAdBanner";
import {
  dedupeStrings,
  matchToAllowedOptions,
  parseTagsInput,
  MAX_JOB_TAGS,
} from "@/lib/jobParseNormalization";
import { getLookupOptions } from "@/lib/jobParsingOptimized";

function getDisplayLabels(values: string[] | null | undefined, fallback?: string | null): string[] {
  return dedupeStrings(values?.length ? values : fallback ? [fallback] : []);
}

/** First catalog-matched label for UI; non-catalog / extras stay for search only. */
function getPrimaryCatalogLabel(
  values: string[] | null | undefined,
  fallback: string | null | undefined,
  catalog: string[],
): string | null {
  const candidates = getDisplayLabels(values, fallback);
  return matchToAllowedOptions(candidates, catalog)[0] ?? null;
}

function getDisplayTags(tags: string | string[] | null | undefined): string[] {
  return parseTagsInput(tags).slice(0, MAX_JOB_TAGS);
}

// Create Supabase client for server-side data fetching
// Check if required environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Only create the Supabase client if we have the required variables
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Server-side data fetching
async function getJobData(id: string) {
  // If Supabase isn't configured, return null
  if (!supabase) {
    console.warn("Supabase not configured - cannot fetch job data");
    return null;
  }
  
  try {
    // Try to find by slug first (more user-friendly URLs)
    let { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          website
        ),
        education_levels (
          id,
          name
        )
      `)
      .eq("job_slug", id)
      .maybeSingle();
    
    // If not found by slug, try by ID
    if (!job && !error) {
      ({ data: job, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo,
            website
          ),
          education_levels (
            id,
            name
          )
        `)
        .eq("id", id)
        .maybeSingle());
    }
    
    if (error) throw error;
    if (!job) return null;
    
    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

async function getRelatedJobs(jobId: string, industries?: string[], jobFunctions?: string[]) {
  // If Supabase isn't configured, return empty array
  if (!supabase) {
    console.warn("Supabase not configured - cannot fetch related jobs");
    return [];
  }
  
  try {
    let query = supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          logo,
          website
        )
      `)
      .neq("id", jobId)
      .limit(6);

    // Prioritize jobs with matching industries or job_functions (array overlap)
    if (industries && industries.length > 0) {
      query = query.overlaps("industries", industries);
    } else if (jobFunctions && jobFunctions.length > 0) {
      query = query.overlaps("job_functions", jobFunctions);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching related jobs:", error);
    return [];
  }
}

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// SEO-friendly metadata: "Accounting Manager Job in Nairobi, Kenya - CareerSasa"
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobData(id);
  
  if (!job) {
    return { title: "Job Not Found - CareerSasa" };
  }
  
  // Build SEO-friendly title: "[Post] at [Company] in [City], [County], Kenya | CareerSasa"
  const companyName = job.companies?.name || job.company || null;
  const isRemote = job.job_location_type === 'REMOTE';
  const seoTitle = isRemote
    ? `${job.title}${companyName ? ` at ${companyName}` : ''} Job — Remote (Kenya) | CareerSasa`
    : `${job.title}${companyName ? ` at ${companyName}` : ''} Job in ${buildLocationString(job.job_location_city, job.job_location_county, job.location)} | CareerSasa`;
  
  const locationPart = buildLocationString(job.job_location_city, job.job_location_county, job.location);
  
  const description = job.description
    ? job.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : `${job.title} job at ${job.companies?.name || job.company || 'a top company'} in ${locationPart}. Apply now on CareerSasa.`;
  
  return {
    title: seoTitle,
    description: description,
    openGraph: {
      title: seoTitle,
      description: description,
      type: 'website',
      url: `https://www.careersasa.co.ke/jobs/${job.job_slug || job.id}`,
    },
    twitter: {
      card: 'summary',
      title: seoTitle,
      description: description,
    },
  };
}

// Main page component
export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch job data on the server
  const job = await getJobData(id);
  
  if (!job) {
    return notFound();
  }
  
  // Fetch related jobs (use full arrays so extras still power search/overlap)
  const relatedJobs = await getRelatedJobs(
    job.id,
    job.industries?.length > 0 ? job.industries : job.industry ? [job.industry] : [],
    job.job_functions?.length > 0 ? job.job_functions : job.job_function ? [job.job_function] : []
  );

  const { industries: industryCatalog, jobFunctions: functionCatalog } =
    await getLookupOptions();
  const primaryIndustry = getPrimaryCatalogLabel(
    job.industries,
    job.industry,
    industryCatalog,
  );
  const primaryJobFunction = getPrimaryCatalogLabel(
    job.job_functions,
    job.job_function,
    functionCatalog,
  );
  
  return (
    <>
      <JobStructuredData job={job} />
      <JobViewTracker jobId={job.id} />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <Link href="/jobs" prefetch={true}>
              <Button variant="ghost" className="h-9 px-3">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </Link>
            <AdminEditJobButton jobId={job.id} variant="page" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
            {/* Main Content */}
            <div className="space-y-4 lg:col-span-2 sm:space-y-5">
              <Card className="overflow-hidden border-border">
                <JobDetailsHeader
                  job={job}
                  industryLabels={primaryIndustry ? [primaryIndustry] : []}
                  functionLabels={primaryJobFunction ? [primaryJobFunction] : []}
                />
                
                <CardContent className="space-y-4 py-5 sm:space-y-5 sm:py-6">
                  {/* CV Builder promo — shown before description */}
                  <CVAdBanner />

                  <div>
                    <h3 className="mb-2.5 flex items-center gap-2 text-xl font-semibold sm:mb-3">
                      <Briefcase className="h-5 w-5" />
                      Job Description
                    </h3>
                    <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                  </div>

                  {job.responsibilities && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2.5 flex items-center gap-2 text-xl font-semibold sm:mb-3">
                          <FileText className="h-5 w-5" />
                          Key Responsibilities
                        </h3>
                        <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                      </div>
                    </>
                  )}

                  {job.required_qualifications && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2.5 flex items-center gap-2 text-xl font-semibold sm:mb-3">
                          <Award className="h-5 w-5" />
                          Required Qualifications
                        </h3>
                        <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.required_qualifications }} />
                      </div>
                    </>
                  )}

                  {job.software_skills && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2.5 flex items-center gap-2 text-xl font-semibold sm:mb-3">
                          <Code className="h-5 w-5" />
                          Required Skills & Software
                        </h3>
                        <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.software_skills }} />
                      </div>
                    </>
                  )}

                  <Separator />
                </CardContent>
              </Card>
              
              {/* Job Details Section - Moved to main content area */}
              <RoleDetails job={job} primaryJobFunction={primaryJobFunction} />
              
              {/* Additional Info Section */}
              {job.additional_info && (
                <Card className="border-border">
                  <CardHeader className="pb-3 pt-4 sm:pb-4 sm:pt-5">
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0 sm:pb-5">
                    <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.additional_info }} />
                  </CardContent>
                </Card>
              )}
              
              {/* Safety Alert + Share & Report Job */}
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div className="text-sm leading-relaxed text-amber-900">
                    <strong>CareerSasa Safety Alert:</strong> We strongly advise job seekers not to make any payment to employers or agencies during the recruitment process. If you're asked to pay for training, interviews, or job placement, report the job immediately using the "Flag" button. CareerSasa thoroughly vets postings, but we encourage all applicants to stay vigilant and verify opportunities independently.
                  </div>
                </div>
                <div className="mt-2.5 flex justify-end gap-2">
                  <SocialShare 
                    url={`https://www.careersasa.co.ke/jobs/${job.job_slug || job.id}`}
                    title={`${job.title} at ${job.companies?.name || job.company || 'Company'} - CareerSasa`}
                    description={job.description?.replace(/<[^>]*>/g, '').substring(0, 160)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Flag className="h-4 w-4" />
                    Flag
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar - Made sticky for desktop */}
            <div className="space-y-4 lg:sticky lg:top-24 lg:h-fit lg:self-start sm:space-y-5">
              {/* Apply Here section - only visible on desktop */}
              <div className="hidden lg:block">
                <ApplySection job={job} />
              </div>

              {/* Service Advertisement - only visible on desktop */}
              <div className="hidden lg:block">
                <ServiceAdvertisement />
              </div>

              {/* Tags section - only visible on desktop */}
              {job?.tags && (
                <Card className="hidden lg:block">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {getDisplayTags(job.tags).map((tag: string) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mobile Apply Section - Visible on mobile devices at the bottom */}
          <div className="mt-4 space-y-4 lg:hidden sm:mt-5 sm:space-y-5">
            <ApplySection job={job} />
            
            {/* Service Advertisement for mobile */}
            <ServiceAdvertisement />
            
            {/* Tags section for mobile */}
            {job?.tags && (
              <Card>
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {getDisplayTags(job.tags).map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Opportunities Section */}
          {relatedJobs && relatedJobs.length > 0 && (
            <div className="mt-8 sm:mt-10">
              <h2 className="mb-4 text-2xl font-bold sm:mb-5">Related Opportunities</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                {relatedJobs.slice(0, 6).map((relatedJob: any) => (
                  <JobCard
                    key={relatedJob.id}
                    id={relatedJob.id}
                    title={relatedJob.title}
                    company={relatedJob.companies?.name || relatedJob.company}
                    location={relatedJob.location}
                    locationCity={relatedJob.job_location_city}
                    locationCounty={relatedJob.job_location_county}
                    description={relatedJob.description}
                    salary={relatedJob.salary || undefined}
                    companyId={relatedJob.company_id}
                    companyLogo={relatedJob.companies?.logo}
                    companyWebsite={relatedJob.companies?.website}
                    industry={relatedJob.industry}
                    locationType={relatedJob.job_location_type}
                    employmentType={relatedJob.employment_type}
                    salaryMin={relatedJob.salary_min}
                    salaryMax={relatedJob.salary_max}
                    salaryCurrency={relatedJob.salary_currency}
                    salaryPeriod={relatedJob.salary_period}
                    experienceLevel={relatedJob.experience_level}
                    datePosted={relatedJob.date_posted}
                    validThrough={relatedJob.valid_through}
                    applicationUrl={relatedJob.application_url}
                    applyEmail={relatedJob.apply_email}
                    applyLink={relatedJob.apply_link}
                    skillsTop3={undefined}
                    department={relatedJob.job_function}
                    jobSlug={relatedJob.job_slug}
                    educationLevel=""
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-center sm:mt-8">
            <Link href="/jobs" prefetch={true}>
              <Button variant="outline" size="lg" className="border-2 hover:bg-gradient-primary hover:text-primary-foreground hover:border-transparent transition-all duration-300">
                Browse More Opportunities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

const RoleDetails = ({
  job,
  primaryJobFunction,
}: {
  job: any;
  primaryJobFunction?: string | null;
}) => {
  // Group job details into categories for better organization
  const salaryDetails = [
    job.salary_min || job.salary_max ? {
      icon: <DollarSign className="h-5 w-5 text-secondary mt-0.5" />,
      label: "Salary Range",
      value: `${job.salary_currency} ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}`,
      subtext: job.salary_period ? `/ ${job.salary_period.toLowerCase()}` : ""
    } : null,
    job.salary_type ? {
      icon: <DollarSign className="h-5 w-5 text-secondary mt-0.5" />,
      label: "Salary Type",
      value: job.salary_type
    } : null
  ].filter(Boolean);

  const jobDetails = [
    job.specialization ? {
      icon: <Lightbulb className="h-5 w-5 text-primary mt-0.5" />,
      label: "Specialization",
      value: job.specialization
    } : null,
    primaryJobFunction ? {
      icon: <Target className="h-5 w-5 text-primary mt-0.5" />,
      label: "Job Function",
      value: primaryJobFunction
    } : null,
    job.work_schedule ? {
      icon: <Clock className="h-5 w-5 text-primary mt-0.5" />,
      label: "Work Schedule",
      value: job.work_schedule
    } : null,
    job.minimum_experience ? {
      icon: <TrendingUp className="h-5 w-5 text-primary mt-0.5" />,
      label: "Minimum Experience",
      value: `${job.minimum_experience} years`
    } : null
  ].filter(Boolean);

  const requirements = [
    job.education_levels?.name ? {
      icon: <GraduationCap className="h-5 w-5 text-primary mt-0.5" />,
      label: "Education Level",
      value: job.education_levels.name
    } : null,
    job.area_of_study ? {
      icon: <GraduationCap className="h-5 w-5 text-primary mt-0.5" />,
      label: "Area of Study",
      value: job.area_of_study
    } : null,
    job.field_of_study ? {
      icon: <GraduationCap className="h-5 w-5 text-primary mt-0.5" />,
      label: "Field of Study",
      value: job.field_of_study
    } : null,
    job.license_requirements ? {
      icon: <Award className="h-5 w-5 text-primary mt-0.5" />,
      label: "License Required",
      value: job.license_requirements
    } : null,
    job.language_requirements ? {
      icon: <Globe className="h-5 w-5 text-primary mt-0.5" />,
      label: "Languages",
      value: job.language_requirements
    } : null
  ].filter(Boolean);

  const additionalDetails = [
    job.additional_locations?.length > 0 ? {
      icon: <MapPin className="h-5 w-5 text-primary mt-0.5" />,
      label: "Other Locations",
      value: job.additional_locations.map((loc: any) => [loc.city, loc.county].filter(Boolean).join(', ')).join('; ')
    } : null,
    job.practice_area ? {
      icon: <Layers className="h-5 w-5 text-primary mt-0.5" />,
      label: "Practice Area",
      value: job.practice_area
    } : null,
    job.project_type ? {
      icon: <Building2 className="h-5 w-5 text-primary mt-0.5" />,
      label: "Project Type",
      value: job.project_type
    } : null,
    job.visa_sponsorship && job.visa_sponsorship !== "Not Applicable" ? {
      icon: <Globe className="h-5 w-5 text-primary mt-0.5" />,
      label: "Visa Sponsorship",
      value: job.visa_sponsorship
    } : null,
    job.is_featured ? {
      icon: <Award className="h-5 w-5 text-yellow-500 mt-0.5" />,
      label: "Featured Job",
      value: "Yes"
    } : null
  ].filter(Boolean);

  // Helper function to render detail items
  const renderDetailItem = (item: any) => (
    <div className="flex items-start gap-3">
      {item.icon}
      <div>
        <p className="text-sm font-medium" style={{ color: '#0b66c3' }}>{item.label}</p>
        <p className={`font-medium ${item.label === 'Featured Job' ? 'text-yellow-600' : ''}`}>
          {item.value}
          {item.subtext && <span className="text-sm text-muted-foreground ml-1">{item.subtext}</span>}
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 sm:pb-4 sm:pt-5">
        <CardTitle className="text-lg">Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-4 pt-0 sm:space-y-5 sm:pb-5">
        {salaryDetails.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
            {salaryDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
          </div>
        )}

        {jobDetails.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
            {jobDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
          </div>
        )}

        {requirements.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
            {requirements.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
          </div>
        )}

        {additionalDetails.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
            {additionalDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};