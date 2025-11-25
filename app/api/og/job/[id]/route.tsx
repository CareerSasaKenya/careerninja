import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Revalidate every hour to ensure fresh data while still caching
export const revalidate = 3600;

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
              backgroundColor: '#1e40af', // Dark blue background
              backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
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
              {/* Background elements */}
              <div
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '10%',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '20%',
                  right: '10%',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              
              {/* Logo placeholder */}
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '40px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
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
                    fontSize: '60px',
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
                    fontSize: '36px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '30px',
                    lineHeight: '1.4',
                  }}
                >
                  Find Your Dream Job in Kenya
                </p>
                <p
                  style={{
                    fontSize: '28px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.4',
                  }}
                >
                  Discover exciting career opportunities
                </p>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  Apply Now
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Extract company name and logo
    const companyName = (job.companies && job.companies.length > 0 && job.companies[0].name) || job.company || 'Company';
    const companyLogo = job.companies && job.companies.length > 0 && job.companies[0].logo;
    const jobTitle = job.title || 'Job Opening';
    const location = job.location || 'Kenya';

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
            backgroundColor: '#1e40af', // Dark blue background
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
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
            {/* Background elements */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '20%',
                right: '10%',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            
            {/* Company Logo Placeholder */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
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
                alignItems: 'flex-start',
                justifyContent: 'center',
                textAlign: 'left',
                maxWidth: '80%',
              }}
            >
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px',
                  lineHeight: '1.2',
                  maxWidth: '100%',
                }}
              >
                {truncateText(jobTitle, 50)}
              </h1>
              <p
                style={{
                  fontSize: '40px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '10px',
                  lineHeight: '1.4',
                }}
              >
                at {truncateText(companyName, 40)}
              </p>
              <p
                style={{
                  fontSize: '32px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: '1.4',
                  marginBottom: '40px',
                }}
              >
                in {truncateText(location, 40)}
              </p>
              <div
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '40px',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                Apply Now
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
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
            backgroundColor: '#1e40af',
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
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
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
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
                  fontSize: '60px',
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '20px',
                }}
              >
                CareerSasa
              </h1>
              <p
                style={{
                  fontSize: '36px',
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
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  }
}