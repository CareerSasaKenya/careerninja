import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
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
      }
    );
  } catch (error) {
    console.error('Error generating default OG image:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}