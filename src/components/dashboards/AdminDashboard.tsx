import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, Trash2, FileText, Edit, BarChart } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  employment_type: string;
  status: string;
  industry: string;
  posted_by: string;
  education_levels?: {
    name: string;
  } | null | any;
}

interface User {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  author_id: string | null;
}

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobFilter, setJobFilter] = useState<"all" | "active" | "draft">("all");
  const jobsPerPage = 10;
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate pagination
      const from = (currentPage - 1) * jobsPerPage;
      const to = from + jobsPerPage - 1;
      
      const [jobsResult, jobsCountResult, usersResult, blogPostsResult] = await Promise.all([
        supabase.from("jobs").select(`
          id, 
          title, 
          company, 
          location, 
          created_at, 
          employment_type, 
          status, 
          industry, 
          posted_by,
          education_levels (name)
        `).order("created_at", { ascending: false }).range(from, to),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("id, title, category, created_at, author_id").order("created_at", { ascending: false }),
      ]);

      if (jobsResult.error) {
        toast.error("Failed to load jobs");
        console.error("Jobs fetch error:", jobsResult.error);
      } else {
        setJobs(jobsResult.data || []);
      }

      if (jobsCountResult.count !== null) {
        setTotalJobs(jobsCountResult.count);
      }

      if (usersResult.error) {
        toast.error("Failed to load users");
        console.error("Users fetch error:", usersResult.error);
      } else {
        setUsers(usersResult.data || []);
      }

      if (blogPostsResult.error) {
        toast.error("Failed to load blog posts");
        console.error("Blog posts fetch error:", blogPostsResult.error);
      } else {
        setBlogPosts(blogPostsResult.data || []);
      }
    } catch (error) {
      console.error("Unexpected error in fetchData:", error);
      toast.error("An unexpected error occurred while loading data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, jobsPerPage]);

  useEffect(() => {
    fetchData();
    
    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchData]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId);

      if (error) {
        toast.error("Failed to delete job");
        console.error("Job delete error:", error);
      } else {
        toast.success("Job deleted successfully");
        // Add a small delay before refreshing to prevent rate limiting
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        fetchTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, 500);
      }
    } catch (error) {
      console.error("Unexpected error deleting job:", error);
      toast.error("An unexpected error occurred while deleting the job");
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

      if (error) {
        toast.error("Failed to delete blog post");
        console.error("Blog post delete error:", error);
      } else {
        toast.success("Blog post deleted successfully");
        // Add a small delay before refreshing to prevent rate limiting
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        fetchTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, 500);
      }
    } catch (error) {
      console.error("Unexpected error deleting blog post:", error);
      toast.error("An unexpected error occurred while deleting the blog post");
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "active" })
        .eq("id", jobId);

      if (error) {
        toast.error("Failed to publish job");
        console.error("Job publish error:", error);
      } else {
        toast.success("Job published successfully!");
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        fetchTimeoutRef.current = setTimeout(() => {
          fetchData();
        }, 500);
      }
    } catch (error) {
      console.error("Unexpected error publishing job:", error);
      toast.error("An unexpected error occurred while publishing the job");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (jobFilter === "all") return true;
    if (jobFilter === "active") return job.status === "active";
    if (jobFilter === "draft") return job.status === "draft";
    return true;
  });

  const draftCount = jobs.filter((j) => j.status === "draft").length;
  const activeCount = jobs.filter((j) => j.status === "active").length;

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/blog/create">
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              New Blog Post
            </Button>
          </Link>
          <Link href="/dashboard/admin/parse-job">
            <Button variant="outline" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Parse Job Text
            </Button>
          </Link>
          <Link href="/dashboard/admin/job-parser-stats">
            <Button variant="outline" className="w-full sm:w-auto">
              <BarChart className="mr-2 h-4 w-4" />
              Parser Stats
            </Button>
          </Link>
          <Link href="/post-job">
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                All Job Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={jobFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setJobFilter("all")}
                >
                  All ({jobs.length})
                </Button>
                <Button
                  variant={jobFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setJobFilter("active")}
                >
                  Active ({activeCount})
                </Button>
                <Button
                  variant={jobFilter === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setJobFilter("draft")}
                >
                  Drafts ({draftCount})
                </Button>
              </div>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : filteredJobs.length === 0 ? (
                <p className="text-muted-foreground">
                  {jobFilter === "draft" 
                    ? "No draft jobs. Save a job as draft to see it here." 
                    : jobFilter === "active"
                    ? "No active jobs. Publish a job to see it here."
                    : "No jobs available."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Education</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">
                            <Link href={`/jobs/${job.id}`} className="hover:underline">
                              {job.title}
                            </Link>
                          </TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.education_levels?.name || 'Not specified'}</TableCell>
                          <TableCell>
                            <Badge variant={job.status === 'active' ? 'default' : job.status === 'draft' ? 'secondary' : 'outline'}>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {job.status === "draft" && (
                                <>
                                  <Link href={`/post-job/${job.id}`}>
                                    <Button variant="outline" size="sm">Edit</Button>
                                  </Link>
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={() => handlePublishJob(job.id)}
                                  >
                                    Publish
                                  </Button>
                                </>
                              )}
                              {job.status === "active" && (
                                <Link href={`/post-job/${job.id}`}>
                                  <Button variant="ghost" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {!loading && filteredJobs.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * jobsPerPage) + 1} to {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs} jobs
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(totalJobs / jobsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          const totalPages = Math.ceil(totalJobs / jobsPerPage);
                          return page === 1 || 
                                 page === totalPages || 
                                 (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const prevPage = array[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalJobs / jobsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(totalJobs / jobsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : blogPosts.length === 0 ? (
                <p className="text-muted-foreground">No blog posts available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">
                            <Link href={`/blog/${generateSlug(post.title)}-${post.id}`} className="hover:underline">
                              {post.title}
                            </Link>
                          </TableCell>
                          <TableCell>{post.category || 'Uncategorized'}</TableCell>
                          <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/blog/edit/${post.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBlogPost(post.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground">No users available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;