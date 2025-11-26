import { createClient } from '@supabase/supabase-js';

// Map of job categories to professional model images
// All images feature Black/African professionals as required
const MODEL_IMAGES: Record<string, string> = {
  healthcare: 'healthcare-professional.jpg',
  technology: 'technology-professional.jpg',
  education: 'education-professional.jpg',
  finance: 'finance-professional.jpg',
  hospitality: 'hospitality-professional.jpg',
  agriculture: 'agriculture-professional.jpg',
  construction: 'construction-professional.jpg',
  retail: 'retail-professional.jpg',
  government: 'government-professional.jpg',
  creative: 'creative-professional.jpg',
  professional: 'professional-default.jpg',
};

// Enhanced function to determine which model image to use based on job title and industry
// Updated to better reflect Kenyan/African professionals and ensure all images feature Black/African professionals
const getModelForJob = (jobTitle: string, company: string): string => {
  const combined = `${jobTitle} ${company}`.toLowerCase();
  
  // Healthcare - doctors, nurses, medical professionals
  if (combined.includes('doctor') || combined.includes('nurse') || combined.includes('medical') || 
      combined.includes('health') || combined.includes('clinical') || combined.includes('physician') ||
      combined.includes('surgeon') || combined.includes('pharmacist') || combined.includes('therapy') ||
      combined.includes('hospital') || combined.includes('clinic') || combined.includes('dentist') ||
      combined.includes('veterinary') || combined.includes('optometrist')) {
    return 'healthcare';
  }
  
  // Technology - developers, engineers, IT professionals
  if (combined.includes('developer') || combined.includes('engineer') || combined.includes('software') || 
      combined.includes('tech') || combined.includes('programmer') || combined.includes('it ') ||
      combined.includes('data') || combined.includes('analyst') || combined.includes('cyber') ||
      combined.includes('web') || combined.includes('frontend') || combined.includes('backend') ||
      combined.includes('fullstack') || combined.includes('devops') || combined.includes('cloud') ||
      combined.includes('ai') || combined.includes('machine learning') || combined.includes('blockchain') ||
      combined.includes('network') || combined.includes('database') || combined.includes('systems')) {
    return 'technology';
  }
  
  // Education - teachers, professors, academic roles
  if (combined.includes('teacher') || combined.includes('educator') || combined.includes('school') || 
      combined.includes('professor') || combined.includes('academic') || combined.includes('lecturer') ||
      combined.includes('tutor') || combined.includes('trainer') || combined.includes('instruction') ||
      combined.includes('research') || combined.includes('university') || combined.includes('college') ||
      combined.includes('kindergarten') || combined.includes('tuition')) {
    return 'education';
  }
  
  // Finance - accountants, bankers, financial analysts
  if (combined.includes('finance') || combined.includes('accountant') || combined.includes('bank') || 
      combined.includes('analyst') || combined.includes('auditor') || combined.includes('investment') ||
      combined.includes('financial') || combined.includes('insurance') || combined.includes('tax') ||
      combined.includes('wealth') || combined.includes('credit') || combined.includes('loan') ||
      combined.includes('broker') || combined.includes('trading') || combined.includes('stock')) {
    return 'finance';
  }
  
  // Hospitality - hotel staff, restaurant workers, tourism
  if (combined.includes('hotel') || combined.includes('restaurant') || combined.includes('chef') || 
      combined.includes('hospitality') || combined.includes('tourism') || combined.includes('catering') ||
      combined.includes('waiter') || combined.includes('bartender') || combined.includes('cook') ||
      combined.includes('barista') || combined.includes('lodging') || combined.includes('travel') ||
      combined.includes('resort') || combined.includes('cafe')) {
    return 'hospitality';
  }
  
  // Agriculture - farmers, agronomists, livestock workers
  if (combined.includes('farm') || combined.includes('agriculture') || combined.includes('crop') || 
      combined.includes('livestock') || combined.includes('agri') || combined.includes('farming') ||
      combined.includes('ranch') || combined.includes('agronomist') || combined.includes('horticulture') ||
      combined.includes('fisheries') || combined.includes('forestry') || combined.includes('dairy') ||
      combined.includes('tea') || combined.includes('coffee') || combined.includes('maize') ||
      combined.includes('wheat') || combined.includes('sugarcane')) {
    return 'agriculture';
  }
  
  // Construction - builders, architects, civil engineers
  if (combined.includes('construction') || combined.includes('architect') || combined.includes('civil') || 
      combined.includes('builder') || combined.includes('contractor') || combined.includes('surveyor') ||
      combined.includes('engineer') || combined.includes('foreman') || combined.includes('welding') ||
      combined.includes('mechanical') || combined.includes('electrician') || combined.includes('plumber') ||
      combined.includes('carpenter') || combined.includes('mason') || combined.includes('painter') ||
      combined.includes('roofer') || combined.includes('tiler')) {
    return 'construction';
  }
  
  // Retail - salespeople, shop workers, customer service
  if (combined.includes('sales') || combined.includes('retail') || combined.includes('shop') || 
      combined.includes('store') || combined.includes('customer service') || combined.includes('cashier') ||
      combined.includes('merchandiser') || combined.includes('clerk') || combined.includes('associate') ||
      combined.includes('market') || combined.includes('mall') || combined.includes('boutique')) {
    return 'retail';
  }
  
  // Government/Public Service - civil servants, police, military
  if (combined.includes('government') || combined.includes('county') || combined.includes('public') || 
      combined.includes('civil service') || combined.includes('ministry') || combined.includes('military') ||
      combined.includes('police') || combined.includes('firefighter') || combined.includes('officer') ||
      combined.includes('administration') || combined.includes('parliament') || combined.includes('judiciary') ||
      combined.includes('senate') || combined.includes('assembly')) {
    return 'government';
  }
  
  // Creative/Design - designers, artists, marketers
  if (combined.includes('designer') || combined.includes('creative') || combined.includes('artist') || 
      combined.includes('graphic') || combined.includes('marketing') || combined.includes('brand') ||
      combined.includes('ui') || combined.includes('ux') || combined.includes('media') ||
      combined.includes('content') || combined.includes('writer') || combined.includes('photographer') ||
      combined.includes('music') || combined.includes('film') || combined.includes('video') ||
      combined.includes('advertising') || combined.includes('pr ') || combined.includes('public relations')) {
    return 'creative';
  }
  
  // NGO/Non-profit sector - common in Kenya
  if (combined.includes('ngo') || combined.includes('non profit') || combined.includes('charity') ||
      combined.includes('foundation') || combined.includes('humanitarian') || combined.includes('community') ||
      combined.includes('development') || combined.includes('advocacy') || combined.includes('social work')) {
    return 'professional'; // Using default professional image for NGO sector
  }
  
  return 'professional';
};

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    
    if (!jobId) {
      return new Response('Missing job ID', { status: 400 });
    }

    // Get environment variables
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    // Fetch job data from Supabase
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        title,
        company,
        location,
        salary_min,
        salary_max,
        salary_currency,
        salary_period,
        job_function,
        companies (
          name
        )
      `)
      .eq('id', jobId)
      .single();

    if (error || !job) {
      // Return a default thumbnail if job not found
      return createDefaultThumbnail();
    }

    // Extract company name (handle both direct company field and companies relation)
    const companyName = job.companies && job.companies.length > 0 
      ? job.companies[0].name 
      : job.company;

    // Get the appropriate model image for this job
    const modelCategory = getModelForJob(job.title || '', companyName || '');
    const modelImage = MODEL_IMAGES[modelCategory];

    // Generate thumbnail using Canvas API (simplified version for serverless)
    const canvasWidth = 1200;
    const canvasHeight = 630;
    
    // Create SVG version of the thumbnail (simpler for serverless)
    const svg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background gradient -->
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(262, 83%, 58%);stop-opacity:1" />
            <stop offset="100%" style="stop-color:hsl(199, 89%, 48%);stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bgGradient)" />
        
        <!-- Overlay -->
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.3)" />
        
        <!-- Decorative elements -->
        <circle cx="${canvasWidth * 0.8}" cy="${canvasHeight * 0.2}" r="80" fill="rgba(255, 255, 255, 0.1)" />
        <circle cx="${canvasWidth * 0.2}" cy="${canvasHeight * 0.7}" r="60" fill="rgba(255, 255, 255, 0.1)" />
        
        <!-- Logo - More prominent -->
        <circle cx="${canvasWidth * 0.85}" cy="${canvasHeight * 0.15}" r="60" fill="rgba(255, 255, 255, 0.25)" stroke="white" stroke-width="3" />
        <text x="${canvasWidth * 0.85}" y="${canvasHeight * 0.15}" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
        
        <!-- Text content - pushed down and better organized -->
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.4}" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="bold" fill="white">${escapeXml(job.title || 'Job Title')}</text>
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.52}" font-family="system-ui, -apple-system, sans-serif" font-size="38" fill="rgba(255, 255, 255, 0.95)">at ${escapeXml(companyName || 'Company Name')}</text>
        
        <!-- Location and Apply Now on same line -->
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.64}" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="rgba(255, 255, 255, 0.85)">📍 ${escapeXml(job.location || 'Location')}</text>
        
        <!-- Apply Now Button - aligned with location -->
        <rect x="${canvasWidth * 0.55}" y="${canvasHeight * 0.6}" width="220" height="60" rx="10" fill="white" opacity="0.95" />
        <text x="${canvasWidth * 0.55 + 110}" y="${canvasHeight * 0.6 + 30}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="hsl(262, 83%, 58%)" text-anchor="middle" dominant-baseline="middle">Apply Now →</text>
        
        <!-- Footer branding -->
        <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.9}" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" fill="rgba(255, 255, 255, 0.8)">CareerSasa.co.ke</text>
      </svg>
    `;

    // Convert SVG to PNG using a service or library
    // For now, we'll return the SVG directly with proper content type
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    // Return a default thumbnail if there's an error
    return createDefaultThumbnail();
  }
}

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
      <!-- Background gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(262, 83%, 58%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(199, 89%, 48%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      <!-- Overlay -->
      <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.3)" />
      
      <!-- Decorative elements -->
      <circle cx="${canvasWidth * 0.8}" cy="${canvasHeight * 0.2}" r="80" fill="rgba(255, 255, 255, 0.1)" />
      <circle cx="${canvasWidth * 0.2}" cy="${canvasHeight * 0.7}" r="60" fill="rgba(255, 255, 255, 0.1)" />
      
      <!-- Logo - More prominent -->
      <circle cx="${canvasWidth * 0.85}" cy="${canvasHeight * 0.15}" r="60" fill="rgba(255, 255, 255, 0.25)" stroke="white" stroke-width="3" />
      <text x="${canvasWidth * 0.85}" y="${canvasHeight * 0.15}" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">C</text>
      
      <!-- Text content - pushed down and better organized -->
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.4}" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="bold" fill="white">CareerSasa</text>
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.52}" font-family="system-ui, -apple-system, sans-serif" font-size="38" fill="rgba(255, 255, 255, 0.95)">Find Your Dream Job in Kenya</text>
      
      <!-- Tagline and Apply Now on same line -->
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.64}" font-family="system-ui, -apple-system, sans-serif" font-size="30" fill="rgba(255, 255, 255, 0.85)">🚀 Discover exciting opportunities</text>
      
      <!-- Apply Now Button - aligned with tagline -->
      <rect x="${canvasWidth * 0.55}" y="${canvasHeight * 0.6}" width="220" height="60" rx="10" fill="white" opacity="0.95" />
      <text x="${canvasWidth * 0.55 + 110}" y="${canvasHeight * 0.6 + 30}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold" fill="hsl(262, 83%, 58%)" text-anchor="middle" dominant-baseline="middle">Apply Now →</text>
      
      <!-- Footer branding -->
      <text x="${canvasWidth * 0.1}" y="${canvasHeight * 0.9}" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" fill="rgba(255, 255, 255, 0.8)">CareerSasa.co.ke</text>
    </svg>
  `;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}