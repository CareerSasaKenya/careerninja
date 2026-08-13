import Script from 'next/script';
import { Database } from '@/integrations/supabase/types';
import { resolveCompanyLogoUrl, resolveCompanyWebsite } from '@/lib/companyLogo';

interface JobStructuredDataProps {
  job: Database['public']['Tables']['jobs']['Row'] & {
    companies?: Database['public']['Tables']['companies']['Row'] | null;
    salary_is_estimated?: boolean | null;
  };
}

function resolveBaseSalary(job: JobStructuredDataProps['job']) {
  // Google requires baseSalary to be the ACTUAL salary provided by the employer
  // (not an estimate). Estimated Kenyan market figures stay on the visible page
  // only — emitting them here as employer-provided pay violates the JobPosting
  // guidelines and gets listings removed from Google Jobs.
  if (job.salary_is_estimated) return undefined;

  const hasMin = job.salary_min != null && Number.isFinite(job.salary_min);
  const hasMax = job.salary_max != null && Number.isFinite(job.salary_max);

  if (!hasMin && !hasMax) return undefined;

  return {
    "@type": "MonetaryAmount" as const,
    currency: job.salary_currency || "KES",
    value: {
      "@type": "QuantitativeValue" as const,
      minValue: hasMin ? job.salary_min! : undefined,
      maxValue: hasMax ? job.salary_max! : undefined,
      // Scraped/local Kenyan jobs default to monthly; YEAR was a stale fallback.
      unitText: job.salary_period || "MONTH",
    },
  };
}

export default function JobStructuredData({ job }: JobStructuredDataProps) {
  const orgName = job.companies?.name || job.company;
  const orgWebsite = resolveCompanyWebsite(orgName, job.companies?.website || job.hiring_organization_url);
  const orgLogo = resolveCompanyLogoUrl({
    logo: job.companies?.logo,
    website: job.companies?.website || job.hiring_organization_url,
    companyName: orgName,
    hiringOrganizationLogo: job.hiring_organization_logo,
  });

  // Format the job data for JSON-LD
  const jobData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || `Join ${orgName} as a ${job.title}. Find out more about this exciting opportunity.`,
    "datePosted": job.date_posted ? new Date(job.date_posted).toISOString() : new Date().toISOString(),
    "validThrough": job.valid_through ? new Date(job.valid_through).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
    "employmentType": job.employment_type || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": orgName,
      "sameAs": orgWebsite || undefined,
      "logo": orgLogo || undefined
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": job.location,
        "addressLocality": job.job_location_city || job.location,
        "addressRegion": job.job_location_county || job.location,
        "addressCountry": job.job_location_country || "KE"
      }
    },
    "baseSalary": resolveBaseSalary(job),
    "skills": undefined,
    "experienceRequirements": job.minimum_experience ? `${job.minimum_experience} years` : job.experience_level || undefined,
    "educationRequirements": job.education_requirements || undefined,
    "industry": job.industry || undefined,
    "jobLocationType": job.job_location_type || undefined,
    "workHours": job.work_schedule || undefined,
    "responsibilities": job.responsibilities || undefined,
    "qualifications": job.required_qualifications || undefined,
    "benefits": job.additional_info || undefined,
    "directApply": job.direct_apply === true
  };

  // Remove undefined properties
  const cleanJobData = Object.fromEntries(
    Object.entries(jobData).filter(([_, value]) => value !== undefined)
  );

  return (
    <Script
      id={`job-posting-${job.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanJobData)
      }}
    />
  );
}