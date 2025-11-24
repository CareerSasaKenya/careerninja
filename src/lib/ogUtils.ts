/**
 * Utility functions for Open Graph tags and social media sharing
 */

/**
 * Generate the URL for a job's Open Graph thumbnail
 * @param jobId The ID of the job
 * @returns The URL for the job's thumbnail
 */
export const getJobThumbnailUrl = (jobId: string): string => {
  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return `/api/og/job/${jobId}`;
  }
  
  // For production, use the full URL
  return `https://www.careersasa.co.ke/api/og/job/${jobId}`;
};

/**
 * Generate the URL for the default Open Graph thumbnail
 * @returns The URL for the default thumbnail
 */
export const getDefaultThumbnailUrl = (): string => {
  // For development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return '/og-image.svg';
  }
  
  // For production, use the full URL
  return 'https://www.careersasa.co.ke/og-image.svg';
};