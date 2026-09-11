"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  Mail,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatKes } from "@/lib/pricing";
import type { LeadRow } from "@/lib/cvFunnel";

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error("Sign in as admin");
  const res = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json as T;
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function sourceBadges(row: LeadRow) {
  return row.sources.filter((s) => s !== "emailed" && s !== "purchased");
}

function LeadTable({
  rows,
  empty,
  emailingId,
  onEmail,
}: {
  rows: LeadRow[];
  empty: string;
  emailingId: string | null;
  onEmail: (row: LeadRow) => void;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Buyer</TableHead>
            <TableHead>Template / SKU</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>CV</TableHead>
            <TableHead>Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableCell>
                <div className="font-medium">{row.name || "—"}</div>
                <div className="text-xs text-muted-foreground">{row.email || "No email"}</div>
                {row.phone && <div className="text-xs text-muted-foreground">{row.phone}</div>}
              </TableCell>
              <TableCell>
                <div className="font-medium">{row.productName || "CV"}</div>
                {row.sku && <div className="text-xs text-muted-foreground">{row.sku}</div>}
              </TableCell>
              <TableCell>
                {row.paymentStatus ? (
                  <div className="space-y-1">
                    <Badge
                      variant={
                        row.paymentStatus === "SUCCESS"
                          ? "default"
                          : row.paymentStatus === "PENDING"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {row.paymentStatus}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {row.amountKes != null ? formatKes(row.amountKes) : ""}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No payment yet</span>
                )}
              </TableCell>
              <TableCell>
                {row.cvTitle ? (
                  <div>
                    <div className="font-medium max-w-[180px] truncate">{row.cvTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.fileUrl || row.profileDocumentUrl ? "On profile" : "Not exported yet"}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No CV yet</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 mb-1">
                  {sourceBadges(row).map((src) => (
                    <Badge key={src} variant="outline" className="capitalize text-[10px]">
                      {src}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">{formatWhen(row.lastActionAt)}</div>
                {row.emailedAt && (
                  <div className="text-xs text-muted-foreground">Emailed {formatWhen(row.emailedAt)}</div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {(row.fileUrl || row.profileDocumentUrl) && (
                    <Button variant="ghost" size="icon" asChild title="Download CV">
                      <a href={(row.fileUrl || row.profileDocumentUrl) as string} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {row.cvId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Email CV to buyer"
                      disabled={emailingId === row.cvId}
                      onClick={() => onEmail(row)}
                    >
                      {emailingId === row.cvId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BuyersAdmin() {
  const [buyers, setBuyers] = useState<LeadRow[]>([]);
  const [carts, setCarts] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailingId, setEmailingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const json = await adminFetch<{ buyers: LeadRow[]; carts: LeadRow[] }>("/api/admin/buyers");
      setBuyers(json.buyers || []);
      setCarts(json.carts || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load buyers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function emailRow(row: LeadRow) {
    if (!row.cvId) return;
    try {
      setEmailingId(row.cvId);
      const result = await adminFetch<{ emailed: boolean; stored: boolean; error?: string }>(
        "/api/admin/buyers/email",
        {
          method: "POST",
          body: JSON.stringify({ cvId: row.cvId, sku: row.sku, templateName: row.productName }),
        }
      );
      if (result.emailed) toast.success(`CV emailed to ${row.email || "the buyer"}`);
      else if (result.stored) toast.success("CV saved to profile (email not sent — check the buyer email)");
      else toast.error(result.error || "Could not email this CV");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Email failed");
    } finally {
      setEmailingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Buyers & carts</h1>
          <p className="text-muted-foreground mt-1">
            People who paid for a CV, plus anyone who chose, uploaded, or edited a template.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/pricing">Pricing & M-Pesa</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              Buyers
            </CardTitle>
            <CardDescription>Successful CV payments</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{loading ? "—" : buyers.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carts
            </CardTitle>
            <CardDescription>Chosen, uploaded, edited, or pending payment</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{loading ? "—" : carts.length}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="buyers" className="w-full">
        <TabsList>
          <TabsTrigger value="buyers">
            <Users className="h-4 w-4 mr-1.5" />
            Buyers ({buyers.length})
          </TabsTrigger>
          <TabsTrigger value="carts">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Carts ({carts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buyers">
          <Card>
            <CardHeader>
              <CardTitle>Paid CV buyers</CardTitle>
              <CardDescription>
                Confirmed M-Pesa payments. The CV is stored on the buyer&apos;s profile and emailed after they save it
                (or when you click the mail icon).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <LeadTable
                  rows={buyers}
                  empty="No CV buyers yet."
                  emailingId={emailingId}
                  onEmail={emailRow}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="carts">
          <Card>
            <CardHeader>
              <CardTitle>In-progress carts</CardTitle>
              <CardDescription>
                People who picked a template, uploaded a file, or started editing — including pending M-Pesa receipts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : (
                <LeadTable
                  rows={carts}
                  empty="No open CV carts."
                  emailingId={emailingId}
                  onEmail={emailRow}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
