import Script from 'next/script';
import { Database } from '@/integrations/supabase/types';

interface JobStructuredDataProps {
  job: Database['public']['Tables']['jobs']['Row'] & {
    companies?: Database['public']['Tables']['companies']['Row'] | null;
  };
}

export default function JobStructuredData({ job }: JobStructuredDataProps) {
  // Format the job data for JSON-LD
  const jobData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || `Join ${job.companies?.name || job.company} as a ${job.title}. Find out more about this exciting opportunity.`,
    "datePosted": job.date_posted ? new Date(job.date_posted).toISOString() : new Date().toISOString(),
    "validThrough": job.valid_through ? new Date(job.valid_through).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
    "employmentType": job.employment_type || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companies?.name || job.company,
      "sameAs": job.companies?.website ? `https://${job.companies.website}` : undefined,
      "logo": job.companies?.logo || undefined
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
    "baseSalary": (job.salary_min || job.salary_max) ? {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "KES",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min || undefined,
        "maxValue": job.salary_max || undefined,
        "unitText": job.salary_period || "YEAR"
      }
    } : undefined,
    "skills": job.software_skills ? 
      (Array.isArray(job.software_skills) 
        ? job.software_skills 
        : typeof job.software_skills === 'string' 
          ? job.software_skills.split(',').map((skill: string) => skill.trim())
          : [])
      : undefined,
    "experienceRequirements": job.minimum_experience ? `${job.minimum_experience} years` : job.experience_level || undefined,
    "educationRequirements": job.education_requirements || undefined,
    "industry": job.industry || undefined,
    "jobLocationType": job.job_location_type || undefined,
    "workHours": job.work_schedule || undefined,
    "responsibilities": job.responsibilities || undefined,
    "qualifications": job.required_qualifications || undefined,
    "benefits": job.additional_info || undefined,
    "directApply": true
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