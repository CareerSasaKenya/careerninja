"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CompanyLogo } from "@/components/CompanyLogo";
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
          {company.industry ? (
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80 line-clamp-1">
              {company.industry}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              Employer
            </p>
          )}
        </div>
      </div>

      {blurb && (
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {blurb}
        </p>
      )}

      <div className="mt-5 pt-4 border-t border-border/50 flex items-end justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-2xl font-semibold tabular-nums leading-none tracking-tight",
              company.openJobs > 0 ? "text-foreground" : "text-muted-foreground/50"
            )}
          >
            {company.openJobs}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {company.openJobs === 1 ? "open role" : "open roles"}
          </p>
        </div>
        {company.location && (
          <p className="text-sm text-muted-foreground text-right leading-snug line-clamp-2 max-w-[55%]">
            {company.location}
          </p>
        )}
      </div>
    </Link>
  );
}

export default CompanyCard;
