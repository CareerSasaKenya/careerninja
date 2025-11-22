"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import JobPostingForm from "@/components/JobPostingForm";
import { Loader2 } from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

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
          <h1 className="text-4xl font-bold mb-2">Post a Job</h1>
          <p className="text-muted-foreground">
            Fill in the details below to post a new job listing
          </p>
        </div>
        <JobPostingForm />
      </div>
    </div>
  );
}
