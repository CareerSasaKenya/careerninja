import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Helper function to escape XML special characters
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Function to create a default thumbnail
function createDefaultThumbnail(): Response {
  const canvasWidth = 1200;
  const canvasHeight = 630;
  
  const svg = `
    <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(262, 83%, 58%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(199, 89%, 48%);stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGradient)" />
      <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.3)" />
      <circle cx="${canvasWidth * 0.8}" cy="${canvasHeight * 0.2}" r="80" fill="rgba(255, 255, 255, 0.1)" />
      <circle cx="${canvasWidth * 0.2}" cy="${canvasHeight * 0.7}" r="60" fill="rgba(255, 255, 255, 0.1)" />
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.3}" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="white">CareerSasa</text>
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.45}" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="rgba(255, 255, 255, 0.9)">Find Your Dream Job in Kenya</text>
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.55}" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="rgba(255, 255, 255, 0.8)">Discover exciting career opportunities</text>
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.9}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="rgba(255, 255, 255, 0.7)">CareerSasa.co.ke</text>
      <rect x="${canvasWidth * 0.1}" y="${canvasHeight * 0.75}" width="200" height="50" rx="8" fill="rgba(255, 255, 255, 0.2)" />
      <text x="${canvasWidth * 0.1 + 100}" y="${canvasHeight * 0.75 + 32}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Apply Now</text>
      <circle cx="${canvasWidth * 0.85 + 40}" cy="${canvasHeight * 0.1 + 40}" r="40" fill="rgba(255, 255, 255, 0.2)" />
      <text x="${canvasWidth * 0.85 + 40}" y="${canvasHeight * 0.1 + 50}" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">C</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return new Response('Missing job ID', { status: 400 });
    }

    // Get environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Try to find by slug first
    let { data: job, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        company,
        location,
        companies (
          name
        )
      `)
      .eq('job_slug', jobId)
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
          companies (
            name
          )
        `)
        .eq('id', jobId)
        .maybeSingle());
    }

    if (error || !job) {
      return createDefaultThumbnail();
    }

    // Extract company name
    const companyName = job.companies?.name || job.company || 'Company';
    const jobTitle = job.title || 'Job Opening';
    const location = job.location || 'Kenya';

    // Generate SVG thumbnail
    const canvasWidth = 1200;
    const canvasHeight = 630;
    
    // Truncate long text to fit in the image
    const truncateText = (text: string, maxLength: number) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    
    const svg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(262, 83%, 58%);stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(199, 89%, 48%);stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#bgGradient)" />
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.3)" />
        
        <circle cx="${canvasWidth * 0.8}" cy="${canvasHeight * 0.2}" r="80" fill="rgba(255, 255, 255, 0.1)" />
        <circle cx="${canvasWidth * 0.2}" cy="${canvasHeight * 0.7}" r="60" fill="rgba(255, 255, 255, 0.1)" />
        
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.3}" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="white">${escapeXml(truncateText(jobTitle, 50))}</text>
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.45}" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="rgba(255, 255, 255, 0.9)">at ${escapeXml(truncateText(companyName, 40))}</text>
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.55}" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="rgba(255, 255, 255, 0.8)">in ${escapeXml(truncateText(location, 40))}</text>
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.9}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="rgba(255, 255, 255, 0.7)">CareerSasa.co.ke</text>
        
        <rect x="${canvasWidth * 0.1}" y="${canvasHeight * 0.75}" width="200" height="50" rx="8" fill="rgba(255, 255, 255, 0.2)" />
        <text x="${canvasWidth * 0.1 + 100}" y="${canvasHeight * 0.75 + 32}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">Apply Now</text>
        
        <circle cx="${canvasWidth * 0.85 + 40}" cy="${canvasHeight * 0.1 + 40}" r="40" fill="rgba(255, 255, 255, 0.2)" />
        <text x="${canvasWidth * 0.85 + 40}" y="${canvasHeight * 0.1 + 50}" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">C</text>
      </svg>
    `;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return createDefaultThumbnail();
  }
}
