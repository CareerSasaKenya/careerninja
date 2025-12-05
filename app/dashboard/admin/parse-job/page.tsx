"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JobTextParser from "@/components/JobTextParser";
import JobPostingForm from "@/components/JobPostingForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ParsedJobData {
  title: string;
  company: string;
  description: string;
  responsibilities: string;
  required_qualifications: string;
  software_skills?: string;
  employment_type: string;
  job_location_type: string;
  job_location_country: string;
  job_location_county?: string;
  job_location_city?: string;
  industry: string;
  education_level_name?: string;
  education_level_id?: string;
  experience_level: string;
  language_requirements?: string;
  salary_min?: string;
  salary_max?: string;
  salary_period?: string;
  salary_currency?: string;
  minimum_experience?: string;
  apply_email?: string;
  apply_link?: string;
  tags?: string;
  job_function?: string;
  valid_through?: string;
}

const ParseJobPage = () => {
  const router = useRouter();
  const [parsedData, setParsedData] = useState<ParsedJobData | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleParsed = async (data: ParsedJobData) => {
    // Convert education_level_name to education_level_id
    if (data.education_level_name) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: educationLevel } = await supabase
          .from("education_levels")
          .select("id")
          .eq("name", data.education_level_name)
          .maybeSingle();
        
        if (educationLevel) {
          (data as any).education_level_id = String(educationLevel.id);
        }
      } catch (error) {
        console.error("Error fetching education level:", error);
      }
    }
    
    setParsedData(data);
    setShowForm(true);
  };

  const handleReset = () => {
    setParsedData(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Parse & Post Job</h1>
          <p className="text-muted-foreground">
            Use AI to automatically extract job information from text and create a structured job posting
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Paste your pre-cleaned job text (90%+ ready)</li>
              <li>AI extracts structured information</li>
              <li>Review and edit the parsed data in the form</li>
              <li>Save as draft or publish immediately</li>
            </ol>
          </AlertDescription>
        </Alert>

        {!showForm ? (
          <JobTextParser onParsed={handleParsed} />
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review & Edit Parsed Job</CardTitle>
                <CardDescription>
                  The AI has extracted the following information. Review and edit as needed before saving.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="mb-4"
                >
                  Parse Another Job
                </Button>
              </CardContent>
            </Card>

            {parsedData && (
              <>
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200">
                      ✓ Successfully Parsed
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                      Extracted the following information:
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {parsedData.title && (
                        <div>
                          <span className="font-medium">Title:</span> {parsedData.title}
                        </div>
                      )}
                      {parsedData.company && (
                        <div>
                          <span className="font-medium">Company:</span> {parsedData.company}
                        </div>
                      )}
                      {parsedData.industry && (
                        <div>
                          <span className="font-medium">Industry:</span> {parsedData.industry}
                        </div>
                      )}
                      {parsedData.employment_type && (
                        <div>
                          <span className="font-medium">Type:</span> {parsedData.employment_type}
                        </div>
                      )}
                      {parsedData.job_location_city && (
                        <div>
                          <span className="font-medium">Location:</span> {parsedData.job_location_city}
                        </div>
                      )}
                      {parsedData.salary_min && parsedData.salary_max && (
                        <div>
                          <span className="font-medium">Salary:</span> {parsedData.salary_currency} {parsedData.salary_min} - {parsedData.salary_max}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <JobPostingFormWrapper initialData={parsedData} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper component to pass initial data to JobPostingForm
const JobPostingFormWrapper = ({ initialData }: { initialData: ParsedJobData }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <JobPostingForm initialData={initialData} isParsedData={true} />
      </CardContent>
    </Card>
  );
};

export default ParseJobPage;
