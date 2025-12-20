import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export const runtime = "edge";

// Check if required environment variables are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create the Supabase client if we have the required variables
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  // If Supabase isn't configured, return early
  if (!supabase) {
    console.warn("Supabase not configured - skipping cache cleanup");
    return NextResponse.json({
      success: true,
      message: "Cache cleanup skipped - Supabase not configured",
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Verify the request is from a cron job (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Clean up expired cache entries
    const { data, error } = await (supabase as any)
      .from('ai_response_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to clean cache: ${error.message}`);
    }

    // Clean up old failed jobs (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: jobCleanupError } = await (supabase as any)
      .from('job_parsing_queue')
      .delete()
      .eq('status', 'failed')
      .lt('created_at', sevenDaysAgo.toISOString());

    if (jobCleanupError) {
      console.warn('Failed to clean old jobs:', jobCleanupError);
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleanup completed",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Cache cleanup error:", error);
    return NextResponse.json(
      { 
        error: "Failed to cleanup cache", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}