"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface FailedScrapeJob {
  id: string;
  source_id: string;
  source_name: string | null;
  job_url: string;
  title: string;
  location: string | null;
  error_message: string | null;
  attempts: number;
  queued_at: string | null;
  processed_at: string | null;
}

interface FailedListResponse {
  items: FailedScrapeJob[];
  total: number;
  limit: number;
  offset: number;
  error?: string;
}

type FailedScope =
  | { ids: string[] }
  | { source_id: string }
  | { all: true };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId?: string;
  sourceName?: string;
  onChanged: () => Promise<void> | void;
}

const PAGE_SIZE = 25;

export function FailedScrapeJobsDialog({
  open,
  onOpenChange,
  sourceId,
  sourceName,
  onChanged,
}: Props) {
  const [items, setItems] = useState<FailedScrapeJob[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<FailedScope | null>(null);

  const pageLabel = useMemo(() => {
    if (total === 0) return "0 of 0";
    const from = offset + 1;
    const to = Math.min(offset + items.length, total);
    return `${from}–${to} of ${total}`;
  }, [items.length, offset, total]);

  const fetchFailed = useCallback(async (nextOffset = 0) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
      });
      if (sourceId) params.set("source_id", sourceId);

      const response = await fetch(`/api/admin/scraper-sources/failed?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = (await response.json()) as FailedListResponse;
      if (!response.ok) throw new Error(body.error || "Failed to load failed jobs");

      setItems(body.items || []);
      setTotal(body.total || 0);
      setOffset(body.offset ?? nextOffset);
      setSelected(new Set());
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load failed jobs");
    } finally {
      setLoading(false);
    }
  }, [sourceId]);

  useEffect(() => {
    if (!open) return;
    setOffset(0);
    setSelected(new Set());
    void fetchFailed(0);
  }, [open, sourceId, fetchFailed]);

  const mutate = async (action: "retry" | "delete", scope: FailedScope) => {
    try {
      setActing(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch("/api/admin/scraper-sources/failed", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...scope }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `${action} failed`);

      const affected = typeof body.affected === "number" ? body.affected : 0;
      if (action === "retry") {
        toast.success(
          affected === 0
            ? "No failed jobs were requeued"
            : `Requeued ${affected} job(s) as pending — use Process queue to run them`
        );
      } else {
        toast.success(affected === 0 ? "No failed jobs were deleted" : `Deleted ${affected} failed job(s)`);
      }

      await onChanged();
      await fetchFailed(0);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : `${action} failed`);
    } finally {
      setActing(false);
    }
  };

  const selectedIds = items.filter(item => selected.has(item.id)).map(item => item.id);
  const allOnPageSelected = items.length > 0 && items.every(item => selected.has(item.id));
  const heading = sourceName
    ? `Failed scrape jobs — ${sourceName}`
    : sourceId
      ? `Failed scrape jobs — ${sourceId}`
      : "Failed scrape jobs";

  const deleteScopeLabel = (scope: FailedScope | null) => {
    if (!scope) return "";
    if ("ids" in scope) return `${scope.ids.length} selected job(s)`;
    if ("source_id" in scope) return `all failed jobs for ${sourceName || scope.source_id}`;
    return "all failed jobs";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>
              Review the original listing, retry to put jobs back in the pending queue, or delete them from the queue.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={acting || loading || selectedIds.length === 0}
              onClick={() => mutate("retry", { ids: selectedIds })}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Retry selected{selectedIds.length ? ` · ${selectedIds.length}` : ""}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={acting || loading || selectedIds.length === 0}
              onClick={() => setConfirmDelete({ ids: selectedIds })}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete selected
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={acting || loading || total === 0}
              onClick={() => mutate("retry", sourceId ? { source_id: sourceId } : { all: true })}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Retry all{total ? ` · ${total}` : ""}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={acting || loading || total === 0}
              onClick={() => setConfirmDelete(sourceId ? { source_id: sourceId } : { all: true })}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete all
            </Button>
            <div className="ml-auto text-xs text-muted-foreground">{pageLabel}</div>
          </div>

          <div className="overflow-auto border rounded-md min-h-[200px]">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading failed jobs…
              </div>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">No failed jobs in the scrape queue.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allOnPageSelected}
                        onCheckedChange={(checked) => {
                          setSelected(checked ? new Set(items.map(item => item.id)) : new Set());
                        }}
                        aria-label="Select all failed jobs on this page"
                      />
                    </TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Tries</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(item.id)}
                          onCheckedChange={(checked) => {
                            setSelected(prev => {
                              const next = new Set(prev);
                              if (checked) next.add(item.id);
                              else next.delete(item.id);
                              return next;
                            });
                          }}
                          aria-label={`Select ${item.title}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <div className="font-medium truncate" title={item.title}>{item.title}</div>
                        {item.location && (
                          <div className="text-xs text-muted-foreground truncate">{item.location}</div>
                        )}
                        <a
                          href={item.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 truncate max-w-full"
                          title={item.job_url}
                        >
                          Open listing
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{item.source_name || item.source_id}</div>
                        {item.source_name && (
                          <div className="text-xs text-muted-foreground font-mono">{item.source_id}</div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <div className="text-xs text-destructive whitespace-pre-wrap break-words">
                          {item.error_message || "No error message recorded"}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          {item.processed_at
                            ? `Failed ${new Date(item.processed_at).toLocaleString()}`
                            : item.queued_at
                              ? `Queued ${new Date(item.queued_at).toLocaleString()}`
                              : ""}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.attempts}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={acting}
                            onClick={() => mutate("retry", { ids: [item.id] })}
                          >
                            Retry
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={acting}
                            onClick={() => setConfirmDelete({ ids: [item.id] })}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || acting || offset === 0}
              onClick={() => fetchFailed(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || acting || offset + items.length >= total}
              onClick={() => fetchFailed(offset + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(next) => { if (!next) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete failed job(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {deleteScopeLabel(confirmDelete)} from the scrape queue. They will not be processed unless Discover finds them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={acting}
              onClick={(event) => {
                event.preventDefault();
                if (!confirmDelete) return;
                const scope = confirmDelete;
                setConfirmDelete(null);
                void mutate("delete", scope);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
