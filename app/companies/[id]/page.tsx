"use client";

// Company profile page
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

export default function CompanyProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: company, isLoading } = useQuery({
    queryKey: ["company", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl">Company not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{company.name}</h1>
        {company.description && (
          <p className="text-muted-foreground mb-6">{company.description}</p>
        )}
        {company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Visit Website
          </a>
        )}
      </div>
    </div>
  );
}
