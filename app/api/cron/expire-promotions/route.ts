import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint should be called by an external cron service (e.g., Vercel Cron, GitHub Actions)
// Add authentication via CRON_SECRET environment variable

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Expire promotions
    const { data: promotionData, error: promotionError } = await supabase
      .from('jobs')
      .update({
        is_promoted: false,
        promotion_tier: null,
        promotion_start_date: null,
        promotion_end_date: null
      })
      .eq('is_promoted', true)
      .lte('promotion_end_date', new Date().toISOString())
      .select('id');

    if (promotionError) {
      console.error('Error expiring promotions:', promotionError);
      return NextResponse.json({ error: promotionError.message }, { status: 500 });
    }

    // Expire featured jobs
    const { data: featuredData, error: featuredError } = await supabase
      .from('jobs')
      .update({
        is_featured: false,
        featured_until: null
      })
      .eq('is_featured', true)
      .lte('featured_until', new Date().toISOString())
      .select('id');

    if (featuredError) {
      console.error('Error expiring featured jobs:', featuredError);
      return NextResponse.json({ error: featuredError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      expired_promotions: promotionData?.length || 0,
      expired_featured: featuredData?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
