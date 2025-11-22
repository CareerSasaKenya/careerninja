"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import JobPostingForm from "@/components/JobPostingForm";
import { Loader2 } from "lucide-react";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const jobId = params.id as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Job</h1>
          <p className="text-muted-foreground">
            Update the job listing details below
          </p>
        </div>
        <JobPostingForm jobId={jobId} isEdit={true} />
      </div>
    </div>
  );
}
