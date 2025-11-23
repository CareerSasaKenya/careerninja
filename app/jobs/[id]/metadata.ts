import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getJobThumbnailUrl } from '@/lib/ogUtils';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';

export async function generateJobMetadata(id: string): Promise<Metadata> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Try to find by slug first
    let { data: job, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        company,
        location,
        description,
        companies (
          name
        )
      `)
      .eq('job_slug', id)
      .maybeSingle();
    
    // If not found by slug, try by ID
    if (!job && !error) {
      ({ data: job, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company,
          location,
          description,
          companies (
            name
          )
        `)
        .eq('id', id)
        .maybeSingle());
    }
    
    if (!job || error) {
      return {
        title: 'Job Not Found - CareerSasa',
        description: 'The job you are looking for could not be found.',
      };
    }
    
    const companyName = (job.companies as any)?.name || job.company || 'Company';
    const jobTitle = job.title || 'Job Opening';
    const location = job.location || 'Kenya';
    
    // Strip HTML tags from description for meta description
    const plainDescription = job.description?.replace(/<[^>]*>/g, '').substring(0, 160) || 
      `Apply for ${jobTitle} position at ${companyName} in ${location}.`;
    
    const title = `${jobTitle} at ${companyName} - CareerSasa`;
    const description = `${plainDescription}... Find more jobs on CareerSasa.`;
    const thumbnailUrl = getJobThumbnailUrl(job.id);
    const url = `https://careersasa.co.ke/jobs/${id}`;
    
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
            alt: `${jobTitle} at ${companyName}`,
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
