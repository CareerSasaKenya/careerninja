/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://careersasa.com',
  generateRobotsTxt: true,
  exclude: [
    '/api/*',
    '/_next/*',
    '/_app/*',
    '/_document/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  additionalPaths: async (config) => {
    const result = [];
    
    // Import Supabase client
    const { createClient } = require('@supabase/supabase-js');
    
    // Get environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    try {
      // Fetch all active jobs
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, job_slug, updated_at')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching jobs for sitemap:', error);
        return result;
      }
      
      // Add job URLs to sitemap
      jobs.forEach(job => {
        result.push({
          loc: `/jobs/${job.job_slug || job.id}`,
          lastmod: job.updated_at,
          changefreq: 'daily',
          priority: 0.8,
        });
      });
    } catch (error) {
      console.error('Error generating job URLs for sitemap:', error);
    }
    
    return result;
  },
};