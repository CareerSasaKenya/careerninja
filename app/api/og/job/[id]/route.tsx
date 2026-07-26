import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyLogoUrl } from '@/lib/companyLogo';
import { getModelForJob, loadIndustryModelDataUrl } from '@/lib/jobIndustryModel';
import { JobSocialCard } from '@/components/og/JobSocialCard';
import {
  OG_CARD_SIZES,
  OG_COLORS,
  formatEmploymentType,
  getCategoryStripColor,
  loadInterFonts,
  loadPublicAssetDataUrl,
  resolveOgCardSize,
  type OgJobCardData,
} from '@/lib/ogJobCardDesign';

export const runtime = 'edge';
export const revalidate = 900;

const SITE_URL = 'https://www.careersasa.co.ke';

function brandFallbackCard(width: number, height: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(145deg, ${OG_COLORS.primaryBlueDeep}, ${OG_COLORS.primaryBlue})`,
          color: OG_COLORS.white,
          fontFamily: 'Inter, sans-serif',
          padding: 48,
        }}
      >
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 800 }}>CareerSasa</div>
        <div style={{ display: 'flex', fontSize: 32, marginTop: 16, opacity: 0.9 }}>
          Find Your Dream Job in Kenya
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            padding: '14px 32px',
            borderRadius: 18,
            background: `linear-gradient(135deg, ${OG_COLORS.accentOrange}, ${OG_COLORS.accentOrangeDeep})`,
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          APPLY NOW
        </div>
      </div>
    ),
    {
      width,
      height,
      headers: {
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
      },
    },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const size = resolveOgCardSize(request.nextUrl.searchParams.get('size'));
  const { width, height } = OG_CARD_SIZES[size];

  try {
    if (!id) {
      return new Response('Missing job ID', { status: 400 });
    }

    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
    const SUPABASE_KEY =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const jobSelect = `
      id,
      title,
      company,
      location,
      salary_min,
      salary_max,
      salary_currency,
      salary_period,
      job_function,
      employment_type,
      hiring_organization_logo,
      companies (
        name,
        logo,
        website
      )
    `;

    let { data: job, error } = await supabase
      .from('jobs')
      .select(jobSelect)
      .eq('job_slug', id)
      .maybeSingle();

    if (!job && !error) {
      ({ data: job, error } = await supabase
        .from('jobs')
        .select(jobSelect)
        .eq('id', id)
        .maybeSingle());
    }

    if (error || !job) {
      return brandFallbackCard(width, height);
    }

    const companiesRel = job.companies as
      | { name?: string; logo?: string | null; website?: string | null }
      | { name?: string; logo?: string | null; website?: string | null }[]
      | null;
    const companyRow = Array.isArray(companiesRel) ? companiesRel[0] ?? null : companiesRel;
    const companyName = companyRow?.name || job.company || 'Company';
    const companyLogoUrl = resolveCompanyLogoUrl({
      logo: companyRow?.logo,
      website: companyRow?.website,
      companyName,
      hiringOrganizationLogo: job.hiring_organization_logo,
    });

    const jobTitle = job.title || 'Job Opening';
    const location = job.location || null;
    const jobFunction = job.job_function || null;
    const employmentType = formatEmploymentType(job.employment_type);

    const assetOrigin = request.nextUrl?.origin || SITE_URL;
    const modelCategory = getModelForJob(jobTitle, `${companyName} ${jobFunction || ''}`);

    const [personImageSrc, brandLogoSrc, companyLogoSrc, fonts] = await Promise.all([
      loadIndustryModelDataUrl(modelCategory, assetOrigin),
      loadPublicAssetDataUrl('/logo.png', assetOrigin),
      companyLogoUrl
        ? fetch(companyLogoUrl)
            .then(async (res) => {
              if (!res.ok) return null;
              const contentType = (res.headers.get('content-type') || 'image/png').split(';')[0];
              // Satori reliably supports raster logos; skip SVG favicons
              if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(contentType)) {
                return null;
              }
              const buf = await res.arrayBuffer();
              if (!buf.byteLength || buf.byteLength > 1_500_000) return null;
              const bytes = new Uint8Array(buf);
              let binary = '';
              const chunk = 0x8000;
              for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
              }
              return `data:${contentType};base64,${btoa(binary)}`;
            })
            .catch(() => null)
        : Promise.resolve(null),
      loadInterFonts(),
    ]);

    const cardData: OgJobCardData = {
      title: jobTitle,
      companyName,
      location,
      employmentType,
      jobFunction,
      companyLogoSrc,
      personImageSrc,
      brandLogoSrc,
      showVerified: Boolean(companyLogoSrc || companyRow?.website),
      categoryColor: getCategoryStripColor(jobFunction, jobTitle),
      size,
    };

    return new ImageResponse(<JobSocialCard {...cardData} />, {
      width,
      height,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return brandFallbackCard(width, height);
  }
}
