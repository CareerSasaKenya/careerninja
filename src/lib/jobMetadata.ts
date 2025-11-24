import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Create a Supabase client for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
);

export interface JobMetadata {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  companyId?: string;
  companyLogo?: string;
  jobSlug?: string;
}

export async function getJobMetadata(jobId: string): Promise<JobMetadata | null> {
  try {
    // Try to find by slug first (more user-friendly URLs)
    let { data: job, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        company,
        location,
        description,
        company_id,
        job_slug,
        companies (
          id,
          name,
          logo
        )
      `)
      .eq('job_slug', jobId)
      .single();
    
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
          company_id,
          job_slug,
          companies (
            id,
            name,
            logo
          )
        `)
        .eq('id', jobId)
        .single());
    }
    
    if (error || !job) {
      console.error('Error fetching job metadata:', error);
      return null;
    }
    
    return {
      id: job.id,
      title: job.title || 'Job Opening',
      company: job.companies?.name || job.company || 'Company',
      location: job.location || 'Kenya',
      description: job.description || `Apply for ${job.title} position at ${job.companies?.name || job.company} in ${job.location}. Find more jobs on CareerSasa.`,
      companyId: job.company_id || undefined,
      companyLogo: job.companies?.logo || undefined,
      jobSlug: job.job_slug || undefined
    };
  } catch (error) {
    console.error('Error in getJobMetadata:', error);
    return null;
  }
}