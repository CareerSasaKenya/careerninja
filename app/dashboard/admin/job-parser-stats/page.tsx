"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Zap, Database, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface JobStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface CacheStats {
  total: number;
  hitCount: number;
  avgHitCount: number;
}

const JobParserStatsPage = () => {
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch job queue stats
      const { data: jobs, error: jobError } = await supabase
        .from('job_parsing_queue')
        .select('status');

      if (jobError) throw jobError;

      const stats: JobStats = {
        total: jobs?.length || 0,
        pending: jobs?.filter(j => j.status === 'pending').length || 0,
        processing: jobs?.filter(j => j.status === 'processing').length || 0,
        completed: jobs?.filter(j => j.status === 'completed').length || 0,
        failed: jobs?.filter(j => j.status === 'failed').length || 0,
      };

      setJobStats(stats);

      // Fetch cache stats
      const { data: cache, error: cacheError } = await supabase
        .from('ai_response_cache')
        .select('hit_count');

      if (cacheError) throw cacheError;

      const cacheStatsData: CacheStats = {
        total: cache?.length || 0,
        hitCount: cache?.reduce((sum, c) => sum + (c.hit_count || 0), 0) || 0,
        avgHitCount: cache?.length ? (cache.reduce((sum, c) => sum + (c.hit_count || 0), 0) / cache.length) : 0,
      };

      setCacheStats(cacheStatsData);

      // Fetch recent jobs
      const { data: recent, error: recentError } = await supabase
        .from('job_parsing_queue')
        .select('id, status, created_at, error_message, started_at, completed_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) throw recentError;

      setRecentJobs(recent || []);

    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const processQueue = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/parse-job/process-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 5 })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Queue processing triggered');
        await fetchStats(); // Refresh stats
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Failed to process queue: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanupCache = async () => {
    try {
      const response = await fetch('/api/cron/cleanup-cache', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Cache cleanup completed');
        await fetchStats(); // Refresh stats
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Failed to cleanup cache: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline"
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Job Parser Statistics</h1>
        <p className="text-muted-foreground">
          Monitor the performance and status of the AI job parsing system
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={fetchStats} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Stats
        </Button>
        <Button onClick={processQueue} disabled={isProcessing}>
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Process Queue
        </Button>
        <Button onClick={cleanupCache} variant="outline">
          <Database className="mr-2 h-4 w-4" />
          Cleanup Cache
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{jobStats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{jobStats?.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Entries</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{cacheStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {cacheStats?.hitCount || 0} total hits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Latest 10 job parsing requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No jobs found</p>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">{job.id.slice(0, 8)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    {job.error_message && (
                      <span className="text-xs text-red-500 max-w-[200px] truncate">
                        {job.error_message}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobParserStatsPage;