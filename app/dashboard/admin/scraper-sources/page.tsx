"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Landmark,
  Loader2,
  Play,
  RefreshCw,
  Rss,
  Building2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  ADAPTER_LABELS,
  CATEGORY_LABELS,
  getAdapterType,
  getSourceCategory,
  ScraperSourceCategory,
} from "@/lib/scraperSourceMeta";

interface QueueStats {
  pending: number;
  processing: number;
  done: number;
  failed: number;
}

interface ScraperSource {
  id: string;
  source_id: string;
  name: string;
  base_url: string;
  is_active: boolean | null;
  selectors: Record<string, unknown>;
  last_discovered_at: string | null;
  created_at: string | null;
  queue_stats: QueueStats;
}

interface ApiResponse {
  sources: ScraperSource[];
  totals: QueueStats;
  active_count: number;
}

const CATEGORY_ICONS: Record<ScraperSourceCategory, typeof Globe> = {
  government: Landmark,
  employer: Building2,
  ngo: Globe,
  other: Rss,
};

export default function AdminScraperSourcesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [discoveringAll, setDiscoveringAll] = useState(false);
  const [discoveringId, setDiscoveringId] = useState<string | null>(null);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [filter, setFilter] = useState<"all" | ScraperSourceCategory>("all");

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in as admin");
        return;
      }

      const response = await fetch("/api/admin/scraper-sources", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Failed to load sources");

      setData(body);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load sources";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const toggleSource = async (sourceId: string, isActive: boolean) => {
    try {
      setTogglingId(sourceId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`/api/admin/scraper-sources/${sourceId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Update failed");

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          sources: prev.sources.map(source =>
            source.source_id === sourceId ? { ...source, is_active: isActive } : source
          ),
          active_count: prev.sources.filter(s =>
            s.source_id === sourceId ? isActive : !!s.is_active
          ).length,
        };
      });

      toast.success(isActive ? "Source activated" : "Source paused");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  };

  const runProcess = async (max = 5) => {
    try {
      setProcessingQueue(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("/api/admin/scraper-sources/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max }),
      });

      const body = await parseJsonResponse(response);
      if (!response.ok) throw new Error(body.error || "Process failed");
      if (body.processed === 0) {
        toast.info("Process complete: no pending jobs in queue");
      } else if (body.published > 0) {
        toast.success(
          `Published ${body.published} job(s) from ${body.processed} queue item(s)` +
            (body.skipped > 0 ? ` (${body.skipped} duplicate(s) skipped)` : "")
        );
      } else if (body.errors > 0) {
        toast.error(`Process failed for ${body.errors} item(s) — check queue stats`);
      } else {
        toast.info(`Processed ${body.processed} item(s); nothing new published`);
      }

      await fetchSources();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Process failed";
      toast.error(message);
    } finally {
      setProcessingQueue(false);
    }
  };

  const runDiscover = async (sourceId?: string) => {
    try {
      if (sourceId) setDiscoveringId(sourceId);
      else setDiscoveringAll(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("/api/admin/scraper-sources/discover", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sourceId ? { source_id: sourceId } : {}),
      });

      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Discover failed");

      const result = body.results?.[0];
      const label = sourceId
        ? result?.source_id || sourceId
        : `${body.sources_processed} source(s)`;

      if (body.total_queued > 0) {
        toast.success(`Discover complete: ${body.total_queued} new item(s) queued (${label})`);
      } else if (result?.error) {
        toast.error(`Discover failed for ${label}: ${result.error}`);
      } else {
        toast.info(`Discover complete: no new jobs found (${label})`);
      }

      await fetchSources();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Discover failed";
      toast.error(message);
    } finally {
      setDiscoveringAll(false);
      setDiscoveringId(null);
    }
  };

  const filteredSources = (data?.sources || []).filter(source => {
    if (filter === "all") return true;
    return getSourceCategory(source.selectors) === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Admin Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Scraper Sources</h1>
          <p className="text-muted-foreground mt-1">
            Kenyan government portals and employer ATS feeds ingested into CareerSasa.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => runDiscover()}
            disabled={loading || discoveringAll || !!discoveringId || processingQueue}
          >
            {discoveringAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Discover all active
          </Button>
          <Button
            variant="secondary"
            onClick={() => runProcess(5)}
            disabled={loading || processingQueue || discoveringAll || !!discoveringId || (data?.totals.pending ?? 0) === 0}
          >
            {processingQueue ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Process queue (5)
          </Button>
          <Button variant="outline" onClick={fetchSources} disabled={loading || discoveringAll || processingQueue}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active sources" value={data?.active_count ?? 0} />
        <StatCard label="Queue pending" value={data?.totals.pending ?? 0} />
        <StatCard label="Published (done)" value={data?.totals.done ?? 0} />
        <StatCard label="Failed" value={data?.totals.failed ?? 0} />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="government">Government</TabsTrigger>
          <TabsTrigger value="employer">Employers</TabsTrigger>
          <TabsTrigger value="ngo">NGO</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configured sources</CardTitle>
              <CardDescription>
                Toggle sources on/off before enabling scrape crons on Vercel Pro.
                New jobs flow: discover → queue → process → publish.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading sources…
                </div>
              ) : filteredSources.length === 0 ? (
                <p className="text-muted-foreground py-8">
                  No sources in this category. Run the latest Supabase migration to seed Kenyan sources.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Adapter</TableHead>
                        <TableHead>Queue</TableHead>
                        <TableHead>Last discover</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSources.map(source => {
                        const adapter = getAdapterType(source.selectors);
                        const category = getSourceCategory(source.selectors);
                        const CategoryIcon = CATEGORY_ICONS[category];
                        const stats = source.queue_stats;

                        return (
                          <TableRow key={source.source_id}>
                            <TableCell>
                              <div className="font-medium">{source.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{source.source_id}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1">
                                <CategoryIcon className="h-3 w-3" />
                                {CATEGORY_LABELS[category]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{ADAPTER_LABELS[adapter]}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs space-y-0.5">
                                <div><span className="text-muted-foreground">Pending:</span> {stats.pending}</div>
                                <div><span className="text-muted-foreground">Done:</span> {stats.done}</div>
                                {stats.failed > 0 && (
                                  <div className="text-destructive">Failed: {stats.failed}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {source.last_discovered_at
                                ? new Date(source.last_discovered_at).toLocaleString()
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={!!source.is_active}
                                disabled={togglingId === source.source_id}
                                onCheckedChange={(checked) => toggleSource(source.source_id, checked)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!source.is_active || discoveringAll || discoveringId === source.source_id}
                                  onClick={() => runDiscover(source.source_id)}
                                >
                                  {discoveringId === source.source_id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 mr-1" />
                                      Discover
                                    </>
                                  )}
                                </Button>
                                <a
                                  href={source.base_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-sm text-primary hover:underline px-2"
                                >
                                  Visit
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Seeded Kenyan sources</CardTitle>
          <CardDescription>Included in migration <code className="text-xs">20260715_combined_kenyan_scraper_sources.sql</code></CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Government (full detail):</strong> PSC PDF adverts from <a href="https://www.publicservice.go.ke/jobs/" target="_blank" rel="noopener noreferrer">publicservice.go.ke/jobs</a> — duties, qualifications, salary scales</p>
          <p><strong>Government (listing backup):</strong> PSC portal table on psckjobs.go.ke (paused when PDF source is active)</p>
          <p><strong>NGO:</strong> Amref Health Africa (SmartRecruiters, Kenya filter)</p>
          <p><strong>Employers:</strong> Inkomoko (Workable), SALIX Data Africa, Digital Divide Data (SmartRecruiters, Kenya filter)</p>
          <p><strong>Batch A (verified):</strong> PowerGen Renewable Energy, iHub (SmartRecruiters). Workable pipeline (paused): Tala, Branch, KCB, Komaza, Sanergy, Copia, Apollo</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

async function parseJsonResponse(response: Response): Promise<{
  error?: string
  processed?: number
  published?: number
  skipped?: number
  errors?: number
  [key: string]: unknown
}> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    const snippet = text.replace(/\s+/g, " ").slice(0, 120);
    throw new Error(
      `Server returned non-JSON (HTTP ${response.status})${snippet ? `: ${snippet}` : ""}`
    );
  }
}
