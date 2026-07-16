"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyCard, type CompanyCardData } from "@/components/CompanyCard";

const ALL_INDUSTRIES = "__all__";

interface CompaniesDirectoryProps {
  companies: CompanyCardData[];
  /** Canonical industry names from the same `industries` table used when posting jobs. */
  industries: string[];
}

function StatFigure({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <div className="min-w-[5.5rem]">
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground leading-none">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function CompaniesDirectory({
  companies,
  industries,
}: CompaniesDirectoryProps) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>(ALL_INDUSTRIES);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesIndustry =
        industry === ALL_INDUSTRIES || c.industry === industry;
      if (!matchesIndustry) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.industry || "").toLowerCase().includes(q) ||
        (c.location || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    });
  }, [companies, search, industry]);

  const hiringCount = filtered.filter((c) => c.openJobs > 0).length;
  const openRoles = filtered.reduce((sum, c) => sum + c.openJobs, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name or location…"
              className="pl-10 h-11 bg-background/80"
              aria-label="Search companies"
            />
          </div>

          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger
              className="h-11 w-full sm:w-[280px] bg-background/80"
              aria-label="Filter by industry"
            >
              <SelectValue placeholder="All industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_INDUSTRIES}>All industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-start gap-6 sm:gap-8">
          <StatFigure
            value={filtered.length}
            label={filtered.length === 1 ? "company" : "companies"}
          />
          <div className="hidden sm:block w-px self-stretch bg-border/70" aria-hidden />
          <StatFigure
            value={openRoles}
            label={openRoles === 1 ? "open role" : "open roles"}
          />
          <div className="hidden sm:block w-px self-stretch bg-border/70" aria-hidden />
          <StatFigure
            value={hiringCount}
            label="hiring now"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((company, index) => (
            <CompanyCard
              key={company.id}
              company={company}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/70 py-16 text-center px-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
            No matches
          </p>
          <p className="text-lg font-medium">Nothing in this filter yet</p>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            Try a different name or choose another industry.
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-primary hover:underline"
            onClick={() => {
              setSearch("");
              setIndustry(ALL_INDUSTRIES);
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default CompaniesDirectory;
