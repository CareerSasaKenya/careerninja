"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

interface JobTextParserProps {
  onParsed: (data: ParsedJobData) => void;
}

const EXAMPLE_JOB_TEXT = `Software Engineer at TechCorp Kenya
Location: Nairobi, Kenya
Type: Full-time, On-site
Salary: KES 80,000 - 120,000 per month

About the role:
We are looking for a talented Software Engineer to join our growing team in Nairobi. You will work on cutting-edge web applications and collaborate with a diverse team of developers.

Responsibilities:
- Develop and maintain web applications using React and Node.js
- Collaborate with cross-functional teams to define and ship new features
- Write clean, maintainable, and well-documented code
- Participate in code reviews and mentor junior developers
- Troubleshoot and debug applications

Requirements:
- Bachelor's degree in Computer Science or related field
- 3+ years of experience in software development
- Proficiency in React, Node.js, and TypeScript
- Strong problem-solving skills and attention to detail
- Excellent communication skills in English

How to Apply:
Send your CV and cover letter to careers@techcorp.co.ke or apply at https://techcorp.co.ke/careers`;

const JobTextParser = ({ onParsed }: JobTextParserProps) => {
  const [jobText, setJobText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExample = () => {
    setJobText(EXAMPLE_JOB_TEXT);
    toast.info("Example job text loaded");
  };

  const handleParse = async () => {
    if (!jobText.trim()) {
      toast.error("Please paste job text first");
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const response = await fetch("/api/parse-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobText }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || "Failed to parse job text";
        if (result.status === 401) {
          throw new Error(`${errorMsg}\n\nSteps to fix:\n1. Go to https://openrouter.ai/credits\n2. Add at least $5 in credits\n3. Verify your API key is active`);
        }
        throw new Error(errorMsg);
      }

      if (result.success && result.data) {
        toast.success("Job text parsed successfully!");
        onParsed(result.data);
        setJobText(""); // Clear the text area
      } else {
        throw new Error("Invalid response from parser");
      }
    } catch (err: any) {
      console.error("Parse error:", err);
      const errorMessage = err.message || "Failed to parse job text";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Job Text Parser
        </CardTitle>
        <CardDescription>
          Paste pre-cleaned job text below and let AI extract structured information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Job Text</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={loadExample}
            disabled={isParsing}
          >
            Load Example
          </Button>
        </div>

        <div className="space-y-2">
          <Textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste your job posting text here...

Example:
Software Engineer at TechCorp Kenya
Location: Nairobi, Kenya
Type: Full-time, On-site

About the role:
We are looking for a talented Software Engineer...

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
..."
            className="min-h-[300px] font-mono text-sm"
            disabled={isParsing}
          />
          <p className="text-xs text-muted-foreground">
            Tip: For best results, ensure the text is already cleaned and formatted (90%+ ready)
          </p>
        </div>

        <Button
          onClick={handleParse}
          disabled={isParsing || !jobText.trim()}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          {isParsing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing with AI...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Parse Job Text
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobTextParser;
