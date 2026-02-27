'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, ExternalLink, Upload, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ApplySectionProps {
  job: any;
}

export default function ApplySection({ job }: ApplySectionProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    yearsExperience: '',
    coverLetter: '',
    expectedSalary: '',
    salaryNegotiable: false,
    applicationMethod: 'profile' as 'profile' | 'cv',
    cvFile: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOC file",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({ ...prev, cvFile: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to apply for this job",
          variant: "destructive",
        });
        router.push('/auth/signin');
        return;
      }

      // Get user profile data
      const { data: profile } = await (supabase as any)
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let cvFileUrl = null;
      let cvFileName = null;
      let cvFileSize = null;

      // Upload CV if provided
      if (formData.cvFile) {
        const fileExt = formData.cvFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('application-cvs')
          .upload(fileName, formData.cvFile);

        if (uploadError) {
          throw new Error('Failed to upload CV');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('application-cvs')
          .getPublicUrl(fileName);

        cvFileUrl = publicUrl;
        cvFileName = formData.cvFile.name;
        cvFileSize = formData.cvFile.size;
      }

      // Create application
      const { error: applicationError } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          user_id: user.id,
          full_name: profile?.full_name || user.email?.split('@')[0],
          email: user.email,
          phone: profile?.phone,
          years_experience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          cover_letter: formData.coverLetter || null,
          expected_salary_min: formData.expectedSalary ? parseFloat(formData.expectedSalary) : null,
          salary_negotiable: formData.salaryNegotiable,
          application_method: formData.applicationMethod,
          cv_file_url: cvFileUrl,
          cv_file_name: cvFileName,
          cv_file_size: cvFileSize,
          candidate_profile_id: profile?.id,
          status: 'pending',
        });

      if (applicationError) {
        if (applicationError.code === '23505') {
          toast({
            title: "Already applied",
            description: "You have already applied to this job",
            variant: "destructive",
          });
        } else {
          throw applicationError;
        }
        return;
      }

      setIsSuccess(true);
      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully",
      });

      // Redirect to applications page after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 2000);

    } catch (error: any) {
      console.error('Application error:', error);
      toast({
        title: "Application failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if there are any external application methods
  const hasExternalMethods = !!(job?.application_url || job?.apply_link || job?.apply_email);
  const hasDirectApply = job?.direct_apply !== false; // Default to true if not explicitly false

  // Success state
  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Application Submitted!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your application has been successfully submitted. The employer will review your application and contact you if you're a good fit.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push('/dashboard/applications')}
              className="flex-1"
            >
              View My Applications
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/jobs')}
              className="flex-1"
            >
              Browse More Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main application section - show all available methods
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Apply for this Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Direct portal application form */}
        {hasDirectApply && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm font-medium text-muted-foreground">Apply via Portal</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearsExp">Years of experience</Label>
                <Input 
                  id="yearsExp" 
                  type="number" 
                  min={0} 
                  placeholder="e.g. 3"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover letter</Label>
                <Textarea 
                  id="coverLetter" 
                  placeholder="Write a brief cover letter..." 
                  rows={5}
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected salary (NGN)</Label>
                  <Input 
                    id="expectedSalary" 
                    type="number" 
                    min={0} 
                    placeholder="e.g. 80000"
                    value={formData.expectedSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Checkbox 
                    id="negotiable"
                    checked={formData.salaryNegotiable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, salaryNegotiable: checked as boolean }))}
                  />
                  <Label htmlFor="negotiable">Negotiable</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Choose how to apply</Label>
                <RadioGroup 
                  value={formData.applicationMethod}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, applicationMethod: value as 'profile' | 'cv' }))}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="profile" id="apply-profile" />
                    <Label htmlFor="apply-profile" className="cursor-pointer">Apply with my profile</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="cv" id="apply-cv" />
                    <Label htmlFor="apply-cv" className="cursor-pointer">Apply with uploaded CV</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv">Upload CV (PDF/DOC) {formData.applicationMethod === 'cv' && <span className="text-red-500">*</span>}</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="cv" 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required={formData.applicationMethod === 'cv'}
                  />
                  {formData.cvFile && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {formData.cvFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Max file size: 5MB. Accepted formats: PDF, DOC, DOCX</p>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isSubmitting || (formData.applicationMethod === 'cv' && !formData.cvFile)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Apply Now
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Note: CVs are stored securely in our database.</p>
            </form>
          </div>
        )}

        {/* External application methods */}
        {hasExternalMethods && (
          <div className="space-y-4">
            {hasDirectApply && (
              <div className="flex items-center gap-2 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-medium text-muted-foreground">Or Apply Externally</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
            
            {!hasDirectApply && (
              <div className="flex items-center gap-2 pb-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-medium text-muted-foreground">External Application</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            {job?.application_url && (
              <Button 
                onClick={() => { if (typeof window !== 'undefined') window.open(job.application_url, "_blank"); }} 
                className="w-full"
                variant={hasDirectApply ? "outline" : "default"}
              >
                <ExternalLink className="mr-2 h-5 w-5" /> Apply on Company Site
              </Button>
            )}

            {job?.apply_link && (
              <Button 
                onClick={() => { if (typeof window !== 'undefined') window.open(job.apply_link, "_blank"); }} 
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Apply via External Link
              </Button>
            )}

            {job?.apply_email && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => { if (typeof window !== 'undefined') window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`; }}
              >
                <Mail className="mr-2 h-4 w-4" /> Apply via Email
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
