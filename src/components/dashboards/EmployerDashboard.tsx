import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Briefcase, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CompanyProfileForm from "@/components/CompanyProfileForm";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  employment_type: string;
  status: string;
  applications_count: number;
  views_count: number;
  education_levels?: {
    name: string;
  } | null | any;
}

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id, 
        title, 
        company, 
        location, 
        created_at, 
        employment_type, 
        status, 
        applications_count, 
        views_count,
        education_levels (name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load jobs");
      console.error(error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, fetchJobs]);

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      toast.error("Failed to delete job");
    } else {
      toast.success("Job deleted successfully");
      fetchJobs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <Link href="/post-job">
          <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                My Job Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground">No jobs posted yet. Create your first job posting!</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                          </TableCell>
                          <TableCell><Badge variant="outline">{job.employment_type?.replace(/_/g, ' ')}</Badge></TableCell>
                          <TableCell>{job.education_levels?.name || 'Not specified'}</TableCell>
                          <TableCell><Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge></TableCell>
                          <TableCell>{job.applications_count || 0}</TableCell>
                          <TableCell>{job.views_count || 0}</TableCell>
                          <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <CompanyProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerDashboard;