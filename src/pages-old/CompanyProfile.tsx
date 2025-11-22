import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Globe, MapPin, Users, Building2, ArrowLeft } from "lucide-react";

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading: companyLoading } = useQuery({
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

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["company-jobs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Company not found</h1>
            <Link to="/jobs">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Link to="/jobs">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {company.logo && (
                <div className="flex-shrink-0">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-24 h-24 object-contain rounded-lg border border-border"
                  />
                </div>
              )}
              <div className="flex-grow">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {company.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  {company.industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span>{company.industry}</span>
                    </div>
                  )}
                  {company.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{company.size} employees</span>
                    </div>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>
                {company.description && (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {company.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Open Positions</h2>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={company.name}
                  location={job.location}
                  description={job.description}
                  salary={job.salary || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                No open positions at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
