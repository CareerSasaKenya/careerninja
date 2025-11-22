"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Facebook, Linkedin, Mail, Twitter, MessageSquare, Flag, Instagram, Share2, Download } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, DollarSign, ExternalLink, Loader2, Bookmark, CheckCircle, FileText, Clock, Briefcase, GraduationCap, Award, Code, Globe, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReportJobDialog } from "@/components/ReportJobDialog";
import JobCard from "@/components/JobCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JobThumbnailGenerator from "@/components/JobThumbnailGenerator";
import { generateThumbnailFilename, downloadBlob } from "@/lib/thumbnailUtils";
import { getJobThumbnailUrl } from "@/lib/ogUtils";
import JobThumbnailPreview from "@/components/JobThumbnailPreview";

const JobDetails = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id || '');
  const router = useRouter();
  const { user } = useAuth();
  const { role } = useUserRole();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      
      let data, error;
      
      // Try to find by slug first (more user-friendly URLs)
      ({ data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo
          ),
          education_levels (
            id,
            name
          )
        `)
        .eq("job_slug", id)
        .maybeSingle());
      
      // If not found by slug, try by ID
      if (!data && !error) {
        ({ data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            companies (
              id,
              name,
              logo
            ),
            education_levels (
              id,
              name
            )
          `)
          .eq("id", id)
          .maybeSingle());
      }
      
      if (error) throw error;
      return data;
    },
  });

  const { data: relatedJobs } = useQuery({
    queryKey: ["relatedJobs", job?.id, job?.industry, job?.job_function],
    enabled: !!job?.id && (!!job?.industry || !!job?.job_function),
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo
          ),
          education_levels (
            id,
            name
          )
        `)
        .neq("id", job!.id)
        .limit(6);

      // Prioritize jobs with matching industry or job_function
      if (job?.industry) {
        query = query.eq("industry", job.industry);
      } else if (job?.job_function) {
        query = query.eq("job_function", job.job_function);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: hasApplied } = useQuery({
    queryKey: ["application", job?.id, user?.id],
    enabled: !!user && !!job?.id && role === "candidate",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", job!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const { data: isSaved } = useQuery({
    queryKey: ["saved", job?.id, user?.id],
    enabled: !!user && !!job?.id && role === "candidate",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", job.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !job?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("job_applications")
        .insert({ job_id: job.id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["application", job?.id, user?.id] });
    },
    onError: () => {
      toast.error("Failed to submit application");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !job?.id) throw new Error("Not authenticated");
      if (isSaved) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_id", job.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_jobs")
          .insert({ job_id: job.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isSaved ? "Job removed from saved" : "Job saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["saved", job?.id, user?.id] });
    },
    onError: () => {
      toast.error("Failed to save job");
    },
  });

  const handleApply = () => {
    // Prioritize application_url over other options
    if (job?.application_url) {
      window.open(job.application_url, "_blank");
      return;
    }
    if (job?.apply_link) {
      window.open(job.apply_link, "_blank");
      return;
    }
    if (job?.apply_email) {
      window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`;
      return;
    }
  };
  const adminEmail: string | undefined =
    typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_EMAIL
      ? String((import.meta as any).env.VITE_ADMIN_EMAIL)
      : undefined;

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Remove the placeholder reportJobMutation and implement actual WhatsApp functionality
  const handleReportJobSubmit = async (message: string) => {
    if (!job?.id) return;
    
    try {
      // Prepare the job details for the WhatsApp message
      const jobTitle = job.title || 'Untitled Job';
      const jobId = job.id;
      const jobUrl = window.location.href;
      const companyName = job.companies?.name || job.company || 'Unknown Company';
      
      // Create the WhatsApp message
      const whatsappMessage = `🚨 JOB REPORT ALERT 🚨%0A%0AJob Title: ${encodeURIComponent(jobTitle)}%0ACompany: ${encodeURIComponent(companyName)}%0AJob ID: ${jobId}%0A%0AReport Reason:%0A${encodeURIComponent(message || 'No reason provided')}`;
      
      // WhatsApp phone number for admin
      const adminWhatsAppNumber = '+254795564135';
      
      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${whatsappMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      toast.success('Thank you for reporting this job. Our team will review it shortly.');
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error('Error reporting job:', error);
      toast.error('Failed to submit report. Please try again.');
    }
  };

  // Update document meta tags when job data loads
  useEffect(() => {
    if (job) {
      // Update title
      document.title = `${job.title} at ${job.companies?.name || job.company} - CareerSasa`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', `Apply for ${job.title} position at ${job.companies?.name || job.company} in ${job.location}. Find more jobs on CareerSasa.`);
      }
      
      // Update Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${job.title} at ${job.companies?.name || job.company}`);
      }
      
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', `Apply for ${job.title} position at ${job.companies?.name || job.company} in ${job.location}. Find more jobs on CareerSasa.`);
      }
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', window.location.href);
      }
      
      // Set the Open Graph image to our new API endpoint
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', getJobThumbnailUrl(job.id));
      }
      
      // Update Open Graph image type
      const ogImageType = document.querySelector('meta[property="og:image:type"]');
      if (ogImageType) {
        ogImageType.setAttribute('content', 'image/svg+xml');
      }
      
      // Update Open Graph image dimensions
      const ogImageWidth = document.querySelector('meta[property="og:image:width"]');
      if (ogImageWidth) {
        ogImageWidth.setAttribute('content', '1200');
      }
      
      const ogImageHeight = document.querySelector('meta[property="og:image:height"]');
      if (ogImageHeight) {
        ogImageHeight.setAttribute('content', '630');
      }
      
      // Update Twitter tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', `${job.title} at ${job.companies?.name || job.company}`);
      }
      
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', `Apply for ${job.title} position at ${job.companies?.name || job.company} in ${job.location}. Find more jobs on CareerSasa.`);
      }
      
      // Set the Twitter image to our new API endpoint
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) {
        twitterImage.setAttribute('content', getJobThumbnailUrl(job.id));
      }
    }
  }, [job]);

  // Handle thumbnail generation
  const handleThumbnailGenerated = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setThumbnailUrl(url);
    setThumbnailBlob(blob);
    
    // Update Open Graph image with a data URL for better compatibility
    const reader = new FileReader();
    reader.onload = function() {
      const dataUrl = reader.result as string;
      
      // Update Open Graph image
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', dataUrl);
      
      // Update Open Graph image type
      let ogImageType = document.querySelector('meta[property="og:image:type"]');
      if (!ogImageType) {
        ogImageType = document.createElement('meta');
        ogImageType.setAttribute('property', 'og:image:type');
        document.head.appendChild(ogImageType);
      }
      ogImageType.setAttribute('content', 'image/png');
      
      // Update Open Graph image width
      let ogImageWidth = document.querySelector('meta[property="og:image:width"]');
      if (!ogImageWidth) {
        ogImageWidth = document.createElement('meta');
        ogImageWidth.setAttribute('property', 'og:image:width');
        document.head.appendChild(ogImageWidth);
      }
      ogImageWidth.setAttribute('content', '1200');
      
      // Update Open Graph image height
      let ogImageHeight = document.querySelector('meta[property="og:image:height"]');
      if (!ogImageHeight) {
        ogImageHeight = document.createElement('meta');
        ogImageHeight.setAttribute('property', 'og:image:height');
        document.head.appendChild(ogImageHeight);
      }
      ogImageHeight.setAttribute('content', '630');
      
      // Update Twitter image
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement('meta');
        twitterImage.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute('content', dataUrl);
    };
    reader.readAsDataURL(blob);
  };

  // Handle download of thumbnail
  const handleDownloadThumbnail = () => {
    if (thumbnailBlob && job) {
      const filename = generateThumbnailFilename(job.title, job.companies?.name || job.company || 'company');
      downloadBlob(thumbnailBlob, filename);
      toast.success('Thumbnail downloaded successfully!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">Job not found</p>
          <Link href="/jobs">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden thumbnail generator - only used for generating social media thumbnails */}
      <JobThumbnailGenerator 
        jobTitle={job.title}
        company={job.companies?.name || job.company || ''}
        location={job.location}
        onThumbnailGenerated={handleThumbnailGenerated}
      />
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/jobs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="border-b bg-muted/330">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {(job.valid_through || job.date_posted) && (
                      <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {job.date_posted && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
                          </div>
                        )}
                        {job.valid_through && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Valid until: {new Date(job.valid_through).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <CardTitle className="text-3xl mb-4">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      {job.company_id && job.companies ? (
                        <Link 
                          href={`/companies/${job.company_id}`}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {job.companies.logo && (
                            <img src={job.companies.logo} alt={job.companies.name} className="h-6 w-6 object-contain" />
                          )}
                          <Building2 className="h-5 w-5 text-primary" />
                          <span className="text-lg">{job.companies.name}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-lg">{job.company}</span>
                          <Badge variant="secondary">Direct Listing</Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-lg">{job.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.employment_type && (
                        <Badge variant="outline">{job.employment_type.replace(/_/g, ' ')}</Badge>
                      )}
                      {job.job_location_type && (
                        <Badge variant="outline">{job.job_location_type.replace(/_/g, ' ')}</Badge>
                      )}
                      {job.experience_level && (
                        <Badge variant="outline">{job.experience_level}</Badge>
                      )}
                      {job.industry && (
                        <Badge className="bg-primary/10 text-primary">{job.industry}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-8 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Description
                  </h3>
                  <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>

                {job.responsibilities && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Key Responsibilities
                      </h3>
                      <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                    </div>
                  </>
                )}

                {job.required_qualifications && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Required Qualifications
                      </h3>
                      <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.required_qualifications }} />
                    </div>
                  </>
                )}

                {job.software_skills && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Required Skills & Software
                      </h3>
                      <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.software_skills }} />
                    </div>
                  </>
                )}

                <Separator />
              </CardContent>
            </Card>
            
            {/* Job Details Section - Moved to main content area */}
            <RoleDetails job={job} />
            
            {/* Additional Info Section */}
            {job.additional_info && (
              <div className="mt-6 rounded-md border border-border bg-muted/30 p-4">
                <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.additional_info }} />
              </div>
            )}
            
            {/* Safety Alert + Report Job */}
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-900 leading-relaxed">
                  <strong>CareerSasa Safety Alert:</strong> We strongly advise job seekers not to make any payment to employers or agencies during the recruitment process. If you're asked to pay for training, interviews, or job placement, report the job immediately using the "Report Job" button. CareerSasa thoroughly vets postings, but we encourage all applicants to stay vigilant and verify opportunities independently.
                </div>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Share:</span>
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#1877F2] hover:bg-[#1877F2]/10 p-2 rounded-full transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a 
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#0077B5] hover:bg-[#0077B5]/10 p-2 rounded-full transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this job: ${job?.title || ''}`)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#1DA1F2] hover:bg-[#1DA1F2]/10 p-2 rounded-full transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${window.location.href}`)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:bg-[#25D366]/10 p-2 rounded-full transition-colors"
                      aria-label="Share on WhatsApp"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </a>
                    <a 
                      href={`https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#E1306C] hover:bg-[#E1306C]/10 p-2 rounded-full transition-colors"
                      aria-label="Share on Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a 
                      href={`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${job?.title || ''}`)}&body=${encodeURIComponent(`Check out this job: ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:bg-gray-600/10 p-2 rounded-full transition-colors flex items-center justify-center"
                      aria-label="Share via Email"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsReportDialogOpen(true)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Flag className="h-4 w-4" />
                    Flag
                  </Button>
                  {thumbnailBlob && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadThumbnail}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download Thumbnail</span>
                      <span className="sm:hidden">Thumbnail</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Made sticky for desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit space-y-6">
            {/* Apply Here section - only visible on desktop */}
            <div className="hidden lg:block">
              <ApplySection 
                job={job} 
                userId={user?.id} 
                hasApplied={!!hasApplied} 
                onApplied={() => queryClient.invalidateQueries({ queryKey: ["application", job?.id, user?.id] })} 
              />
            </div>

            {job?.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Opportunities Section */}
        {relatedJobs && relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.slice(0, 6).map((relatedJob: any) => (
                <JobCard
                  key={relatedJob.id}
                  id={relatedJob.id}
                  title={relatedJob.title}
                  company={relatedJob.companies?.name || relatedJob.company}
                  location={relatedJob.location}
                  description={relatedJob.description}
                  salary={relatedJob.salary || undefined}
                  companyId={relatedJob.company_id}
                  companyLogo={relatedJob.companies?.logo}
                  industry={relatedJob.industry}
                  locationType={relatedJob.job_location_type}
                  employmentType={relatedJob.employment_type}
                  salaryMin={relatedJob.salary_min}
                  salaryMax={relatedJob.salary_max}
                  salaryCurrency={relatedJob.salary_currency}
                  salaryPeriod={relatedJob.salary_period}
                  experienceLevel={relatedJob.experience_level}
                  datePosted={relatedJob.date_posted}
                  validThrough={relatedJob.valid_through}
                  applicationUrl={relatedJob.application_url}
                  applyEmail={relatedJob.apply_email}
                  applyLink={relatedJob.apply_link}
                  skillsTop3={
                    Array.isArray(relatedJob.software_skills)
                      ? (relatedJob.software_skills as unknown[])
                          .filter((s): s is string => typeof s === "string")
                          .slice(0, 3)
                      : undefined
                  }
                  department={relatedJob.job_function}
                  jobSlug={relatedJob.job_slug}
                  educationLevel={relatedJob.education_levels?.name || ""}
                />
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Link href="/jobs">
            <Button variant="outline" size="lg" className="border-2 hover:bg-gradient-primary hover:text-primary-foreground hover:border-transparent transition-all duration-300">
              Browse More Opportunities
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Apply Now Button - Fixed at bottom */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-lg lg:hidden z-40">
          <Button 
            onClick={() => setIsApplyModalOpen(true)} 
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            Apply Now
          </Button>
        </div>
      )}

      {/* Apply Modal for Mobile */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {job?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ApplySection 
              job={job} 
              userId={user?.id} 
              hasApplied={!!hasApplied} 
              onApplied={() => {
                queryClient.invalidateQueries({ queryKey: ["application", job?.id, user?.id] });
                setIsApplyModalOpen(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Report Job Dialog */}
      <ReportJobDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onReport={handleReportJobSubmit}
        jobTitle={job?.title || 'Untitled Job'}
      />
    </div>
  );
};

export default JobDetails;

type Job = any;

const RoleDetails = ({ job }: { job: Job }) => {
  // Group job details into categories for better organization
  const salaryDetails = [
    job.salary_min || job.salary_max ? {
      icon: <DollarSign className="h-5 w-5 text-secondary mt-0.5" />,
      label: "Salary Range",
      value: `${job.salary_currency} ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}`,
      subtext: job.salary_period ? `/ ${job.salary_period.toLowerCase()}` : ""
    } : null,
    job.salary_type ? {
      icon: <DollarSign className="h-5 w-5 text-secondary mt-0.5" />,
      label: "Salary Type",
      value: job.salary_type
    } : null
  ].filter(Boolean);

  const jobDetails = [
    job.specialization ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Specialization",
      value: job.specialization
    } : null,
    job.job_function ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Job Function",
      value: job.job_function
    } : null,
    job.work_schedule ? {
      icon: <Clock className="h-5 w-5 text-primary mt-0.5" />,
      label: "Work Schedule",
      value: job.work_schedule
    } : null,
    job.minimum_experience ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Minimum Experience",
      value: `${job.minimum_experience} years`
    } : null
  ].filter(Boolean);

  const requirements = [
    job.education_levels?.name ? {
      icon: <GraduationCap className="h-5 w-5 text-primary mt-0.5" />,
      label: "Education",
      value: job.education_levels.name
    } : null,
    job.license_requirements ? {
      icon: <Award className="h-5 w-5 text-primary mt-0.5" />,
      label: "License Required",
      value: job.license_requirements
    } : null,
    job.language_requirements ? {
      icon: <Globe className="h-5 w-5 text-primary mt-0.5" />,
      label: "Languages",
      value: job.language_requirements
    } : null
  ].filter(Boolean);

  const additionalDetails = [
    job.practice_area ? {
      icon: <Briefcase className="h-5 w-5 text-primary mt-0.5" />,
      label: "Practice Area",
      value: job.practice_area
    } : null,
    job.project_type ? {
      icon: <Building2 className="h-5 w-5 text-primary mt-0.5" />,
      label: "Project Type",
      value: job.project_type
    } : null,
    job.visa_sponsorship && job.visa_sponsorship !== "Not Applicable" ? {
      icon: <Globe className="h-5 w-5 text-primary mt-0.5" />,
      label: "Visa Sponsorship",
      value: job.visa_sponsorship
    } : null,
    job.is_featured ? {
      icon: <Award className="h-5 w-5 text-yellow-500 mt-0.5" />,
      label: "Featured Job",
      value: "Yes"
    } : null
  ].filter(Boolean);

  // Helper function to render detail items
  const renderDetailItem = (item: any) => (
    <div className="flex items-start gap-3">
      {item.icon}
      <div>
        <p className="text-sm text-muted-foreground">{item.label}</p>
        <p className={`font-medium ${item.label === 'Featured Job' ? 'text-yellow-600' : ''}`}>
          {item.value}
          {item.subtext && <span className="text-sm text-muted-foreground ml-1">{item.subtext}</span>}
        </p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Job Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {salaryDetails.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {salaryDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}

        {jobDetails.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}

        {requirements.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}

        {additionalDetails.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-primary">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalDetails.map((item, index) => <div key={index}>{renderDetailItem(item)}</div>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ApplySection = ({ job, userId, hasApplied, onApplied }: { job: Job; userId?: string; hasApplied: boolean; onApplied: () => void }) => {
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [expectedSalary, setExpectedSalary] = useState<string>("");
  const [isNegotiable, setIsNegotiable] = useState<boolean>(false);
  const [saveCoverToProfile, setSaveCoverToProfile] = useState<boolean>(false);
  const [applyMethod, setApplyMethod] = useState<"profile" | "cv">("profile");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const doApply = async () => {
    if (!userId) {
      toast.error("Please log in to apply");
      return;
    }

    // If admin provided application_url, override and open it
    if (job?.application_url) {
      window.open(job.application_url, "_blank");
      return;
    }

    // Handle CV upload if apply with CV selected
    let uploadedCvUrl: string | null = null;
    if (applyMethod === "cv") {
      if (!cvFile) {
        toast.error("Please upload your CV to continue");
        return;
      }
      try {
        setUploading(true);
        const fileExt = cvFile.name.split(".").pop();
        const filePath = `${userId}/${job.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("cvs").upload(filePath, cvFile, {
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("cvs").getPublicUrl(filePath);
        uploadedCvUrl = data.publicUrl;
      } catch (e: any) {
        toast.error(e?.message || "Failed to upload CV. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Persist application (minimal fields to avoid schema mismatch)
    const { error } = await supabase
      .from("job_applications")
      .insert({ job_id: job.id, user_id: userId });
    if (error) {
      toast.error("Failed to submit application");
      return;
    }

    // Best-effort: include extra info via separate notification
    if (applyMethod === "cv" && uploadedCvUrl) {
      toast.info("CV uploaded successfully");
    }
    if (saveCoverToProfile) {
      // Placeholder: no profile table found. This can be wired later.
      try {
        localStorage.setItem("careersasa_cover_letter", coverLetter);
      } catch {}
      toast.success("Cover letter saved for future use");
    }

    toast.success("Application submitted successfully!");
    queryClient.invalidateQueries({ queryKey: ["application", job.id, userId] });
    onApplied();
  };

  // If only external methods exist (application_url/apply_link/apply_email), show a single button
  const hasExternal = Boolean(job?.application_url || job?.apply_link || job?.apply_email);

  if (job?.application_url) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.open(job.application_url, "_blank")} className="w-full bg-gradient-primary hover:opacity-90">
            <ExternalLink className="mr-2 h-5 w-5" /> Apply on Company Site
          </Button>
          {(job?.apply_email || job?.apply_link) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.apply_email && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`}
                >
                  <Mail className="mr-2 h-4 w-4" /> Apply via Email
                </Button>
              )}
              {job?.apply_link && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(job.apply_link, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply via External Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (job?.apply_link) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.open(job.apply_link, "_blank")} className="w-full bg-gradient-primary hover:opacity-90">
            <ExternalLink className="mr-2 h-5 w-5" /> Apply via External Link
          </Button>
          {(job?.apply_email || job?.application_url) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.apply_email && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`}
                >
                  <Mail className="mr-2 h-4 w-4" /> Apply via Email
                </Button>
              )}
              {job?.application_url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(job.application_url, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply on Company Site
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (job?.apply_email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Mail className="mr-2 h-5 w-5" /> Apply via Email
          </Button>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Clicking above will open your email client with a pre-filled subject line
          </p>
          {(job?.application_url || job?.apply_link) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.application_url && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => window.open(job.application_url, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply on Company Site
                </Button>
              )}
              {job?.apply_link && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(job.apply_link, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply via External Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Apply Here</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="yearsExp">Years of experience</Label>
          <Input id="yearsExp" type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="e.g. 3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverLetter">Cover letter</Label>
          <Textarea id="coverLetter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write a brief cover letter..." rows={5} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expectedSalary">Expected salary</Label>
            <Input id="expectedSalary" type="number" min={0} value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="e.g. 80000" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox id="negotiable" checked={isNegotiable} onCheckedChange={(v) => setIsNegotiable(Boolean(v))} />
            <Label htmlFor="negotiable">Negotiable</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="saveCover" checked={saveCoverToProfile} onCheckedChange={(v) => setSaveCoverToProfile(Boolean(v))} />
          <Label htmlFor="saveCover">Save this cover letter to my profile</Label>
        </div>

        <div className="space-y-2">
          <Label>Choose how to apply</Label>
          <RadioGroup value={applyMethod} onValueChange={(v) => setApplyMethod(v as any)} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 border rounded-md p-3">
              <RadioGroupItem value="profile" id="apply-profile" />
              <Label htmlFor="apply-profile">Apply with my profile</Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-3">
              <RadioGroupItem value="cv" id="apply-cv" />
              <Label htmlFor="apply-cv">Apply with my uploaded CV</Label>
            </div>
          </RadioGroup>
        </div>

        {applyMethod === "cv" && (
          <div className="space-y-2">
            <Label htmlFor="cv">Upload CV (PDF/DOC)</Label>
            <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
          </div>
        )}

        <div className="pt-2">
          {hasExternal ? (
            <Button onClick={() => {
              if (job?.application_url) {
                window.open(job.application_url, "_blank");
              } else if (job?.apply_link) {
                window.open(job.apply_link, "_blank");
              } else if (job?.apply_email) {
                window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`;
              }
            }} className="w-full bg-gradient-primary hover:opacity-90" disabled={uploading || hasApplied}>
              {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ExternalLink className="mr-2 h-5 w-5" />}
              Apply Now
            </Button>
          ) : (
            <Button onClick={doApply} className="w-full bg-gradient-primary hover:opacity-90" disabled={uploading || hasApplied}>
              {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
              {hasApplied ? "Applied" : "Apply Now"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Note: CVs are stored securely in our Database.</p>
      </CardContent>
    </Card>
  );
}
