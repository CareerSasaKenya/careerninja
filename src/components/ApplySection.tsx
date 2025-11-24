'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, ExternalLink } from "lucide-react";

interface ApplySectionProps {
  job: any;
}

export default function ApplySection({ job }: ApplySectionProps) {
  // If only external methods exist (application_url/apply_link/apply_email), show a single button
  if (job?.application_url) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { if (typeof window !== 'undefined') window.open(job.application_url, "_blank"); }} className="w-full bg-gradient-primary hover:opacity-90">
            <ExternalLink className="mr-2 h-5 w-5" /> Apply on Company Site
          </Button>
          {(job?.apply_email || job?.apply_link) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.apply_email && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => { if (typeof window !== 'undefined') window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`; }}
                >
                  <Mail className="mr-2 h-4 w-4" /> Apply via Email
                </Button>
              )}
              {job?.apply_link && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { if (typeof window !== 'undefined') window.open(job.apply_link, "_blank"); }}
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
          <Button onClick={() => { if (typeof window !== 'undefined') window.open(job.apply_link, "_blank"); }} className="w-full bg-gradient-primary hover:opacity-90">
            <ExternalLink className="mr-2 h-5 w-5" /> Apply via External Link
          </Button>
          {(job?.apply_email || job?.application_url) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.apply_email && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => { if (typeof window !== 'undefined') window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`; }}
                >
                  <Mail className="mr-2 h-4 w-4" /> Apply via Email
                </Button>
              )}
              {job?.application_url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { if (typeof window !== 'undefined') window.open(job.application_url, "_blank"); }}
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
            onClick={() => { if (typeof window !== 'undefined') window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`; }}
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
                  onClick={() => { if (typeof window !== 'undefined') window.open(job.application_url, "_blank"); }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply on Company Site
                </Button>
              )}
              {job?.apply_link && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { if (typeof window !== 'undefined') window.open(job.apply_link, "_blank"); }}
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
          <Input id="yearsExp" type="number" min={0} placeholder="e.g. 3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverLetter">Cover letter</Label>
          <Textarea id="coverLetter" placeholder="Write a brief cover letter..." rows={5} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expectedSalary">Expected salary</Label>
            <Input id="expectedSalary" type="number" min={0} placeholder="e.g. 80000" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox id="negotiable" />
            <Label htmlFor="negotiable">Negotiable</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="saveCover" />
          <Label htmlFor="saveCover">Save this cover letter to my profile</Label>
        </div>

        <div className="space-y-2">
          <Label>Choose how to apply</Label>
          <RadioGroup defaultValue="profile" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

        <div className="space-y-2">
          <Label htmlFor="cv">Upload CV (PDF/DOC)</Label>
          <Input id="cv" type="file" accept=".pdf,.doc,.docx" />
        </div>

        <div className="pt-2">
          <Button className="w-full bg-gradient-primary hover:opacity-90">
            <Mail className="mr-2 h-5 w-5" />
            Apply Now
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Note: CVs are stored securely in our Database.</p>
      </CardContent>
    </Card>
  );
}
