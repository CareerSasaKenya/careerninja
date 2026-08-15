import { Database } from '@/integrations/supabase/types';
import { resolveCompanyLogoUrl, resolveCompanyWebsite } from '@/lib/companyLogo';
import {
  resolveApplicantLocationRequirements,
  resolveDatePosted,
  resolveEducationRequirements,
  resolveExperienceRequirements,
  resolveJobAddress,
  resolveJobLocationType,
  resolveValidThrough,
  isSchemaLogoPlaceholder,
} from '@/lib/jobStructuredDataMapping';

interface JobStructuredDataProps {
  job: Database['public']['Tables']['jobs']['Row'] & {
    companies?: Database['public']['Tables']['companies']['Row'] | null;
    salary_is_estimated?: boolean | null;
  };
}

const GOOGLE_EMPLOYMENT_TYPES = new Set([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACTOR',
  'TEMPORARY',
  'INTERN',
  'VOLUNTEER',
  'PER_DIEM',
  'OTHER',
]);

function resolveBaseSalary(job: JobStructuredDataProps['job']) {
  // Google requires baseSalary to be the ACTUAL salary provided by the employer
  // (not an estimate). Estimated Kenyan market figures stay on the visible page
  // only — emitting them here as employer-provided pay violates the JobPosting
  // guidelines and gets listings removed from Google Jobs.
  // Employers who set salary_visibility = 'Hide' get no salary in the markup
  // either — Google requires markup to match what's visible on the page.
  if (job.salary_is_estimated) return undefined;
  if (job.salary_visibility === 'Hide') return undefined;

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
      unitText: job.salary_period || "MONTH",
    },
  };
}

export default function JobStructuredData({ job }: JobStructuredDataProps) {
  const orgName = job.companies?.name || job.company;
  const orgWebsite = resolveCompanyWebsite(
    orgName,
    job.companies?.website || job.hiring_organization_url
  );

  // Never emit favicon-CDN placeholders as the org logo (fails Google logo rules).
  const resolvedLogo = resolveCompanyLogoUrl({
    logo: job.companies?.logo,
    website: job.companies?.website || job.hiring_organization_url,
    companyName: orgName,
    hiringOrganizationLogo: job.hiring_organization_logo,
  });
  const orgLogo = isSchemaLogoPlaceholder(resolvedLogo) ? undefined : resolvedLogo;

  const employmentType =
    job.employment_type && GOOGLE_EMPLOYMENT_TYPES.has(job.employment_type)
      ? job.employment_type
      : undefined;

  // Fail-safe: never fabricate dates/types that are unknown. Google's guidance is
  // to omit a property when the information is missing rather than invent it.
  const jobData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || undefined,
    "identifier": {
      "@type": "PropertyValue",
      "name": orgName,
      "value": job.id,
    },
    "datePosted": resolveDatePosted(job),
    "validThrough": resolveValidThrough(job),
    "employmentType": employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": orgName,
      "sameAs": orgWebsite || undefined,
      "logo": orgLogo || undefined,
    },
    "jobLocationType": resolveJobLocationType(job),
    "applicantLocationRequirements": resolveApplicantLocationRequirements(job),
    "jobLocation": resolveJobAddress(job),
    "baseSalary": resolveBaseSalary(job),
    "experienceRequirements": resolveExperienceRequirements(job),
    "educationRequirements": resolveEducationRequirements(job.education_requirements),
    "industry": job.industry || undefined,
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

  if (Object.keys(cleanJobData).length <= 2) return null;

  // Escape "<" so "</script>" inside job content can never break out of the tag.
  const jsonLd = JSON.stringify(cleanJobData).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
