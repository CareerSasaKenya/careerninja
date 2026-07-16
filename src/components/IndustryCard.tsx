"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { IndustryCardData } from "@/lib/companyDirectory";
import { ALL_INDUSTRIES_SLUG } from "@/lib/companyDirectory";

interface IndustryCardProps {
  title: string;
  href: string;
  companyCount: number;
  openJobs: number;
  featured?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function IndustryCard({
  title,
  href,
  companyCount,
  openJobs,
  featured = false,
  className,
  style,
}: IndustryCardProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "group block h-full rounded-xl border p-5 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        featured
          ? "border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 shadow-md hover:shadow-lg hover:border-primary/50"
          : "border-border/60 bg-card shadow-sm hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      style={style}
    >
      <p
        className={cn(
          "text-[11px] uppercase tracking-[0.14em] mb-2",
          featured ? "text-primary" : "text-muted-foreground"
        )}
      >
        {featured ? "Browse everything" : "Industry"}
      </p>
      <h2
        className={cn(
          "font-semibold leading-snug group-hover:text-primary transition-colors",
          featured ? "text-xl md:text-2xl" : "text-lg"
        )}
      >
        {title}
      </h2>

      <div className="mt-5 pt-4 border-t border-border/50 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
            {companyCount}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {companyCount === 1 ? "company" : "companies"}
          </p>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-lg font-semibold tabular-nums leading-none",
              openJobs > 0 ? "text-foreground" : "text-muted-foreground/50"
            )}
          >
            {openJobs}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {openJobs === 1 ? "open role" : "open roles"}
          </p>
        </div>
      </div>
    </Link>
  );
}

interface IndustryCardsGridProps {
  industries: IndustryCardData[];
  totalCompanies: number;
  totalOpenJobs: number;
}

export function IndustryCardsGrid({
  industries,
  totalCompanies,
  totalOpenJobs,
}: IndustryCardsGridProps) {
  // Alphabetical industry cards; "All industries" is always first
  const sorted = [...industries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
      <IndustryCard
        title="All industries"
        href={`/companies/industry/${ALL_INDUSTRIES_SLUG}`}
        companyCount={totalCompanies}
        openJobs={totalOpenJobs}
        featured
        className="animate-fade-in sm:col-span-2 xl:col-span-1"
      />
      {sorted.map((industry, index) => (
        <IndustryCard
          key={industry.slug}
          title={industry.name}
          href={`/companies/industry/${industry.slug}`}
          companyCount={industry.companyCount}
          openJobs={industry.openJobs}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index + 1, 12) * 40}ms` }}
        />
      ))}
    </div>
  );
}

export default IndustryCardsGrid;
