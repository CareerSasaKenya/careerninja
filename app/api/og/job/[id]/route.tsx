import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Revalidate every 15 minutes to ensure fresh data while still caching
export const revalidate = 900;

// Brand colors based on the new design
const COLORS = {
  primary: '#0b66c3',     // Primary Blue - HSL(210, 89%, 40%)
  teal: '#0ea5e9',        // Teal - HSL(199, 89%, 48%)
  orange: '#f97316',      // Orange - HSL(25, 95%, 53%)
  white: '#ffffff',
  lightTeal: '#67e8f9',   // Light teal for the tagline
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    if (!id) {
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
        salary_min,
        salary_max,
        salary_currency,
        salary_period,
        job_function,
        companies (
          name,
          logo
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
          salary_min,
          salary_max,
          salary_currency,
          salary_period,
          job_function,
          companies (
            name,
            logo
          )
        `)
        .eq('id', id)
        .maybeSingle());
    }

    if (error || !job) {
      // Return default OG image
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(to bottom right, ${COLORS.primary}, ${COLORS.teal})`,
              padding: '40px',
              fontFamily: 'sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              {/* Background decorative elements */}
              <div
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '8%',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  right: '8%',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              
              {/* Company Logo Placeholder - Top Left */}
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '40px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.orange,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                C
              </div>
              
              {/* Main content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  maxWidth: '80%',
                }}
              >
                <h1
                  style={{
                    fontSize: '72px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '20px',
                    lineHeight: '1.2',
                  }}
                >
                  CareerSasa
                </h1>
                <p
                  style={{
                    fontSize: '42px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '30px',
                    lineHeight: '1.4',
                  }}
                >
                  Find Your Dream Job in Kenya
                </p>
                <p
                  style={{
                    fontSize: '32px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.4',
                  }}
                >
                  Discover exciting career opportunities
                </p>
                {/* CTA button - Bottom Right */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    padding: '20px 40px',
                    borderRadius: '12px',
                    backgroundColor: COLORS.orange,
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  APPLY NOW
                </div>
                {/* Branding text - Bottom Left */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '40px',
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  CareerSasa.co.ke — Enrich Your Career Now
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
          },
        }
      );
    }

    // Extract company name and logo
    const companyName = (job.companies && job.companies.length > 0 && job.companies[0].name) || job.company || 'Company';
    const companyLogo = job.companies && job.companies.length > 0 && job.companies[0].logo;
    const jobTitle = job.title || 'Job Opening';
    const location = job.location || 'Kenya';
    const salaryMin = job.salary_min;
    const salaryMax = job.salary_max;
    const salaryCurrency = job.salary_currency || 'KES';
    const salaryPeriod = job.salary_period || 'MONTH';
    const jobFunction = job.job_function || '';

    // Truncate long text to fit in the image
    const truncateText = (text: string, maxLength: number) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(to bottom right, ${COLORS.purple}, ${COLORS.teal})`,
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* Company Logo Placeholder - Top Left */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: COLORS.orange,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {companyName.charAt(0).toUpperCase()}
            </div>
            
            {/* Job Title - Top Center */}
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '60px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                maxWidth: '70%',
                lineHeight: '1.2',
              }}
            >
              {truncateText(jobTitle, 45)}
            </div>
            
            {/* Left Column - Company Info (moved down for better spacing) */}
            <div
              style={{
                position: 'absolute',
                top: '220px', // Moved down to create space after title
                left: '60px',
                display: 'flex',
                flexDirection: 'column',
                gap: '25px',
                color: 'white',
              }}
            >
              {/* Company Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                  <path d="M3 3h18v18H3z"/>
                </svg>
                <span style={{ fontSize: '36px', fontWeight: '600' }}>{truncateText(companyName, 25)}</span>
              </div>
              
              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                <span style={{ fontSize: '32px' }}>{truncateText(location, 25)}</span>
              </div>
              
              {/* Salary Range (only if available) */}
              {(salaryMin || salaryMax) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.25 3.75 10.74 9 12 5.25-1.26 9-6.75 9-12V5l-9-4zm1 16h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span style={{ fontSize: '34px', fontWeight: '600' }}>
                    {salaryCurrency} {salaryMin?.toLocaleString()} - {salaryMax?.toLocaleString()}/{salaryPeriod.toLowerCase()}
                  </span>
                </div>
              )}
              
              {/* Job Function */}
              {jobFunction && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                    <path d="M4 7h16v2H4zm0 4h16v2H4zm0 4h10v2H4z"/>
                  </svg>
                  <span style={{ fontSize: '32px' }}>{truncateText(jobFunction, 25)}</span>
                </div>
              )}
            </div>
            
            {/* CTA button - Bottom Right (same line as tagline) */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                padding: '20px 40px',
                borderRadius: '12px',
                backgroundColor: COLORS.orange,
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
              }}
            >
              APPLY NOW
            </div>
            
            {/* Branding text - Bottom Left (same line as CTA button) */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                fontSize: '24px',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              CareerSasa.co.ke — Enrich Your Career Now
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Return default OG image on error
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(to bottom right, ${COLORS.purple}, ${COLORS.teal})`,
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            {/* Background decorative elements */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '8%',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '15%',
                right: '8%',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            
            {/* Logo with secondary color */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: COLORS.orange,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              C
            </div>
            
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                maxWidth: '80%',
              }}
            >
              <h1
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px',
                }}
              >
                CareerSasa
              </h1>
              <p
                style={{
                  fontSize: '42px',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                Find Your Dream Job in Kenya
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
        },
      }
    );
  }
}