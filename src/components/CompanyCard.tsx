"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Briefcase, Building2, MapPin } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CompanyCardData = {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  openJobs: number;
};

interface CompanyCardProps {
  company: CompanyCardData;
  className?: string;
  style?: CSSProperties;
}

export function CompanyCard({ company, className, style }: CompanyCardProps) {
  const jobLabel =
    company.openJobs === 1 ? "1 open job" : `${company.openJobs} open jobs`;
  const blurb = company.description
    ? company.description.replace(/<[^>]*>/g, "").trim()
    : null;

  return (
    <Link
      href={`/companies/${company.id}`}
      prefetch={true}
      className={cn(
        "group block h-full rounded-xl border border-border/60 bg-card p-5",
        "shadow-sm transition-all duration-300",
        "hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      style={style}
    >
      <div className="flex items-start gap-4">
        <CompanyLogo
          name={company.name}
          logo={company.logo}
          website={company.website}
          size="lg"
          className="rounded-lg ring-1 ring-border/50 group-hover:ring-primary/30 transition-all"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {company.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {company.industry ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 font-normal">
                <Building2 className="h-3 w-3 mr-1" />
                {company.industry}
              </Badge>
            ) : (
              <Badge variant="outline" className="font-normal text-muted-foreground">
                Employer
              </Badge>
            )}
          </div>
        </div>
      </div>

      {blurb && (
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {blurb}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-medium",
            company.openJobs > 0 ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />
          {jobLabel}
        </span>
        {company.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[12rem]">{company.location}</span>
          </span>
        )}
      </div>
    </Link>
  );
}

export default CompanyCard;
