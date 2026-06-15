"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail, Send, Users, BarChart3, FileText, Plus,
  Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle, Eye, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";

// =====================================================
// TYPES
// =====================================================

interface EmailStats {
  total_sent: number;
  total_failed: number;
  total_bounced: number;
  subscribers_confirmed: number;
  subscribers_pending: number;
  campaigns_total: number;
  campaigns_sent: number;
}

interface EmailLog {
  id: string;
  recipient_email: string;
  email_type: string;
  subject: string;
  status: string;
  provider: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  status: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
}

// =====================================================
// COMPONENT
// =====================================================

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Campaign form
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignBody, setCampaignBody] = useState("");

  // Test email
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchStats(), fetchLogs(), fetchSubscribers(), fetchCampaigns()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Data fetching ----

  async function fetchStats() {
    const { data, error } = await (supabase as any).rpc("get_email_stats");
    if (!error && data) setStats(data);
  }

  async function fetchLogs() {
    const { data, error } = await (supabase as any)
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setLogs(data);
  }

  async function fetchSubscribers() {
    const { data, error } = await (supabase as any)
      .from("email_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) setSubscribers(data);
  }

  async function fetchCampaigns() {
    const { data, error } = await (supabase as any)
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setCampaigns(data);
  }

  // ---- Actions ----

  async function handleSendTest() {
    if (!testEmail) {
      toast.error("Enter a test email address");
      return;
    }
    setTestingEmail(true);
    try {
      const res = await fetch("/api/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || data.error);
      }
    } catch {
      toast.error("Failed to send test email");
    } finally {
      setTestingEmail(false);
    }
  }

  async function handleCreateCampaign() {
    if (!campaignTitle || !campaignSubject || !campaignBody) {
      toast.error("All fields are required");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const { error } = await (supabase as any).from("email_campaigns").insert({
        title: campaignTitle,
        subject: campaignSubject,
        html_body: campaignBody,
        status: "draft",
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Campaign created as draft");
      setCampaignTitle("");
      setCampaignSubject("");
      setCampaignBody("");
      fetchCampaigns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create campaign";
      toast.error(msg);
    }
  }

  async function handleSendCampaign(campaignId: string) {
    if (!confirm("Send this campaign to all confirmed subscribers?")) return;
    setSending(true);
    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Sent to ${data.sent} recipients (${data.failed} failed)`);
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error(data.error || "Failed to send");
      }
    } catch {
      toast.error("Failed to send campaign");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteSubscriber(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    const { error } = await (supabase as any)
      .from("email_subscribers")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to remove subscriber");
    } else {
      toast.success("Subscriber removed");
      fetchSubscribers();
      fetchStats();
    }
  }

  // ---- Status badges ----

  function statusBadge(status: string) {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sent: "default",
      delivered: "default",
      failed: "destructive",
      bounced: "destructive",
      confirmed: "default",
      pending: "secondary",
      unsubscribed: "outline",
      draft: "secondary",
      sending: "secondary",
      scheduled: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  }

  // ---- Render ----

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage newsletters, campaigns, subscribers, and email logs
          </p>
        </div>
        <Button variant="outline" onClick={fetchAll}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
          <TabsTrigger value="settings">Test & Settings</TabsTrigger>
        </TabsList>

        {/* ---- OVERVIEW TAB ---- */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Send className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.total_sent ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Emails Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.total_failed ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.subscribers_confirmed ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Subscribers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.campaigns_sent ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Campaigns Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("campaigns")}>
              <CardContent className="pt-6 flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Create New Campaign</span>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("subscribers")}>
              <CardContent className="pt-6 flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span className="font-medium">Manage Subscribers</span>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("settings")}>
              <CardContent className="pt-6 flex items-center gap-3">
                <Send className="h-5 w-5" />
                <span className="font-medium">Send Test Email</span>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- CAMPAIGNS TAB ---- */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Create Campaign Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Campaign</CardTitle>
              <CardDescription>Draft a new newsletter or marketing campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)} placeholder="e.g., June 2026 Newsletter" />
                </div>
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input value={campaignSubject} onChange={(e) => setCampaignSubject(e.target.value)} placeholder="e.g., Top Jobs This Week" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>HTML Body</Label>
                <textarea
                  value={campaignBody}
                  onChange={(e) => setCampaignBody(e.target.value)}
                  placeholder="<p>Your email content here...</p>"
                  className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <Button onClick={handleCreateCampaign} disabled={!campaignTitle || !campaignSubject || !campaignBody}>
                <Plus className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
            </CardContent>
          </Card>

          {/* Campaign List */}
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No campaigns yet</p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.subject} &middot; {new Date(c.created_at).toLocaleDateString()}
                          {c.sent_count > 0 && ` \u00b7 ${c.sent_count} sent`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(c.status)}
                        {(c.status === "draft" || c.status === "scheduled") && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSendCampaign(c.id)}
                            disabled={sending}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            {sending ? "Sending..." : "Send"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- SUBSCRIBERS TAB ---- */}
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscribers</CardTitle>
                  <CardDescription>
                    {stats?.subscribers_confirmed ?? 0} confirmed, {stats?.subscribers_pending ?? 0} pending
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSubscribers}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subscribers yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Email</th>
                        <th className="text-left py-2 px-2">Name</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Source</th>
                        <th className="text-left py-2 px-2">Joined</th>
                        <th className="text-right py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2 font-mono text-xs">{s.email}</td>
                          <td className="py-2 px-2">{s.name || "-"}</td>
                          <td className="py-2 px-2">{statusBadge(s.status)}</td>
                          <td className="py-2 px-2 text-muted-foreground">{s.source}</td>
                          <td className="py-2 px-2 text-muted-foreground text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td className="py-2 px-2 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSubscriber(s.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- EMAIL LOGS TAB ---- */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Logs</CardTitle>
                  <CardDescription>Recent email send history</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLogs}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No email logs yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Recipient</th>
                        <th className="text-left py-2 px-2">Type</th>
                        <th className="text-left py-2 px-2">Subject</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2 font-mono text-xs">{l.recipient_email}</td>
                          <td className="py-2 px-2">
                            <Badge variant="outline" className="text-xs">{l.email_type}</Badge>
                          </td>
                          <td className="py-2 px-2 max-w-[200px] truncate">{l.subject}</td>
                          <td className="py-2 px-2">{statusBadge(l.status)}</td>
                          <td className="py-2 px-2 text-muted-foreground text-xs">
                            {l.sent_at ? new Date(l.sent_at).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- SETTINGS / TEST TAB ---- */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>Send a test email to verify the email system is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Recipient Email</Label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
              </div>
              <Button onClick={handleSendTest} disabled={testingEmail || !testEmail}>
                {testingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Email system settings and info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Provider</span>
                <Badge>Resend</Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">From Email</span>
                <code className="text-sm">{process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : "onboarding@resend.dev"}</code>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Free Tier Limit</span>
                <Badge variant="outline">100 emails/day</Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Newsletter Page</span>
                <Link href="/newsletter" className="text-sm text-primary hover:underline">
                  /newsletter
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
