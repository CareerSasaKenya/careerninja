import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { buildLocationString } from '@/lib/textUtils';
import { buildShareOgImagePath } from '@/lib/ogTemplateCatalog';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';

const jobSelect = `
  id,
  title,
  company,
  location,
  description,
  job_slug,
  job_location_type,
  job_location_city,
  job_location_county,
  companies (
    name
  )
`;

export async function generateJobMetadata(id: string): Promise<Metadata> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Try to find by slug first
    let { data: job, error } = await supabase
      .from('jobs')
      .select(jobSelect)
      .eq('job_slug', id)
      .maybeSingle();
    
    // If not found by slug, try by ID
    if (!job && !error) {
      ({ data: job, error } = await supabase
        .from('jobs')
        .select(jobSelect)
        .eq('id', id)
        .maybeSingle());
    }
    
    if (!job || error) {
      return {
        title: 'Job Not Found - CareerSasa',
        description: 'The job you are looking for could not be found.',
      };
    }
    
    const companyName = (job.companies as { name?: string } | null)?.name || job.company || null;
    const jobTitle = job.title || 'Job Opening';
    const isRemote = job.job_location_type === 'REMOTE';
    const locationPart = buildLocationString(
      job.job_location_city,
      job.job_location_county,
      job.location,
    );

    // SEO-friendly title: "[Post] at [Company] in [City], [County], Kenya | CareerSasa"
    const title = isRemote
      ? `${jobTitle}${companyName ? ` at ${companyName}` : ''} Job — Remote (Kenya) | CareerSasa`
      : `${jobTitle}${companyName ? ` at ${companyName}` : ''} Job in ${locationPart} | CareerSasa`;

    const plainDescription = job.description?.replace(/<[^>]*>/g, '').substring(0, 160);
    const description = plainDescription
      || `${jobTitle} job at ${companyName || 'a top company'} in ${locationPart}. Apply now on CareerSasa.`;

    const siteUrl = 'https://www.careersasa.co.ke';
    // Stable per-job pick among accepted OG templates (2 / 4 / 5)
    const thumbnailUrl = `${siteUrl}${buildShareOgImagePath(id)}`;
    const url = `${siteUrl}/jobs/${job.job_slug || job.id || id}`;
    const imageAlt = `${jobTitle}${companyName ? ` at ${companyName}` : ''}`;
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'CareerSasa',
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: imageAlt,
          },
        ],
        locale: 'en_KE',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [thumbnailUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'CareerSasa - Find Your Dream Job',
      description: 'Discover the latest job opportunities in Kenya.',
    };
  }
}
