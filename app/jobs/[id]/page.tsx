import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { Flag } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, DollarSign, FileText, Clock, Briefcase, GraduationCap, Award, Code, Globe, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import JobCard from "@/components/JobCard";
import JobStructuredData from "@/components/JobStructuredData";
import ApplySection from "@/components/ApplySection";
import SocialShare from "@/components/SocialShare";

// Create Supabase client for server-side data fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
);

// Server-side data fetching
async function getJobData(id: string) {
  try {
    // Try to find by slug first (more user-friendly URLs)
    let { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          logo
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
            logo
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

async function getRelatedJobs(jobId: string, industry?: string, jobFunction?: string) {
  try {
    let query = supabase
      .from("jobs")
      .select(`
        *,
        companies (
          id,
          name,
          logo
        )
      `)
      .neq("id", jobId)
      .limit(6);

    // Prioritize jobs with matching industry or job_function
    if (industry) {
      query = query.eq("industry", industry);
    } else if (jobFunction) {
      query = query.eq("job_function", jobFunction);
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

// Main page component
export default async function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Fetch job data on the server
  const job = await getJobData(id);
  
  if (!job) {
    return notFound();
  }
  
  // Fetch related jobs
  const relatedJobs = await getRelatedJobs(job.id, job.industry, job.job_function);
  
  return (
    <>
      <JobStructuredData job={job} />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <Link href="/jobs" prefetch={true}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border">
                <CardHeader className="border-b bg-muted/330">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {(job.valid_through || job.date_posted) && (
                        <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {job.date_posted && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
                            </div>
                          )}
                          {job.valid_through && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Valid until: {new Date(job.valid_through).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <CardTitle className="text-2xl sm:text-3xl mb-4 break-words">{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-4 text-muted-foreground">
                        {job.company_id && job.companies ? (
                          <Link 
                            href={`/companies/${job.company_id}`}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            {job.companies.logo && (
                              <img src={job.companies.logo} alt={job.companies.name} className="h-6 w-6 object-contain" />
                            )}
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="text-lg">{job.companies.name}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="text-lg">{job.company}</span>
                            <Badge variant="secondary">Direct Listing</Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="text-lg">{job.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.employment_type && (
                          <Badge variant="outline">{job.employment_type.replace(/_/g, ' ')}</Badge>
                        )}
                        {job.job_location_type && (
                          <Badge variant="outline">{job.job_location_type.replace(/_/g, ' ')}</Badge>
                        )}
                        {job.experience_level && (
                          <Badge variant="outline">{job.experience_level}</Badge>
                        )}
                        {job.industry && (
                          <Badge className="bg-primary/10 text-primary">{job.industry}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Job Description
                    </h3>
                    <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                  </div>

                  {job.responsibilities && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
              <RoleDetails job={job} />
              
              {/* Additional Info Section */}
              {job.additional_info && (
                <div className="mt-6 rounded-md border border-border bg-muted/30 p-4">
                  <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.additional_info }} />
                </div>
              )}
              
              {/* Safety Alert + Share & Report Job */}
              <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-900 leading-relaxed">
                    <strong>CareerSasa Safety Alert:</strong> We strongly advise job seekers not to make any payment to employers or agencies during the recruitment process. If you're asked to pay for training, interviews, or job placement, report the job immediately using the "Flag" button. CareerSasa thoroughly vets postings, but we encourage all applicants to stay vigilant and verify opportunities independently.
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
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
            <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit space-y-6">
              {/* Apply Here section - only visible on desktop */}
              <div className="hidden lg:block">
                <ApplySection job={job} />
              </div>

              {/* Tags section */}
              {job?.tags && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(typeof job.tags === 'string' 
                        ? job.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                        : Array.isArray(job.tags) 
                          ? job.tags 
                          : []
                      ).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mobile Apply Section - Visible on mobile devices at the bottom */}
          <div className="lg:hidden mt-6 space-y-6">
            <ApplySection job={job} />
            
            {/* Tags section for mobile */}
            {job?.tags && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(typeof job.tags === 'string' 
                      ? job.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
                      : Array.isArray(job.tags) 
                        ? job.tags 
                        : []
                    ).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Opportunities Section */}
          {relatedJobs && relatedJobs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedJobs.slice(0, 6).map((relatedJob: any) => (
                  <JobCard
                    key={relatedJob.id}
                    id={relatedJob.id}
                    title={relatedJob.title}
                    company={relatedJob.companies?.name || relatedJob.company}
                    location={relatedJob.location}
                    description={relatedJob.description}
                    salary={relatedJob.salary || undefined}
                    companyId={relatedJob.company_id}
                    companyLogo={relatedJob.companies?.logo}
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
                    skillsTop3={
                      Array.isArray(relatedJob.software_skills)
                        ? (relatedJob.software_skills as unknown[])
                            .filter((s): s is string => typeof s === "string")
                            .slice(0, 3)
                        : undefined
                    }
                    department={relatedJob.job_function}
                    jobSlug={relatedJob.job_slug}
                    educationLevel=""
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-center">
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

const RoleDetails = ({ job }: { job: any }) => {
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
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Specialization",
      value: job.specialization
    } : null,
    job.job_function ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Job Function",
      value: job.job_function
    } : null,
    job.work_schedule ? {
      icon: <Clock className="h-5 w-5 text-primary mt-0.5" />,
      label: "Work Schedule",
      value: job.work_schedule
    } : null,
    job.minimum_experience ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Minimum Experience",
      value: `${job.minimum_experience} years`
    } : null
  ].filter(Boolean);

  const requirements = [
    job.education_requirements ? {
      icon: <GraduationCap className="h-5 w-5 text-primary mt-0.5" />,
      label: "Education",
      value: job.education_requirements
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
    job.practice_area ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
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
        <p className="text-sm text-muted-foreground">{item.label}</p>
        <p className={`font-medium ${item.label === 'Featured Job' ? 'text-yellow-600' : ''}`}>
          {item.value}
          {item.subtext && <span className="text-sm text-muted-foreground ml-1">{item.subtext}</span>}
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {salaryDetails.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {salaryDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}

        {jobDetails.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}

        {requirements.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}

        {additionalDetails.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};