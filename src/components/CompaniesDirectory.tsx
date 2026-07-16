"use client";

import { useMemo, useState } from "react";
import { Search, Building2, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CompanyCard, type CompanyCardData } from "@/components/CompanyCard";

interface CompaniesDirectoryProps {
  companies: CompanyCardData[];
}

export function CompaniesDirectory({ companies }: CompaniesDirectoryProps) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);

  const industries = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) {
      if (c.industry?.trim()) set.add(c.industry.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [companies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      const matchesIndustry = !industry || c.industry === industry;
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

  const hiringCount = companies.filter((c) => c.openJobs > 0).length;
  const openRoles = companies.reduce((sum, c) => sum + c.openJobs, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies by name, industry, or location…"
            className="pl-10 h-11 bg-background/80"
            aria-label="Search companies"
          />
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-primary" />
            {filtered.length} compan{filtered.length === 1 ? "y" : "ies"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-primary" />
            {openRoles} open role{openRoles === 1 ? "" : "s"} · {hiringCount} hiring
          </span>
        </div>
      </div>

      {industries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setIndustry(null)}>
            <Badge
              variant={industry === null ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
            >
              All industries
            </Badge>
          </button>
          {industries.slice(0, 16).map((ind) => (
            <button key={ind} type="button" onClick={() => setIndustry(ind === industry ? null : ind)}>
              <Badge
                variant={industry === ind ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 max-w-[14rem] truncate"
                title={ind}
              >
                {ind}
              </Badge>
            </button>
          ))}
        </div>
      )}

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
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium">No companies match your search</p>
          <p className="text-muted-foreground mt-1 max-w-md mx-auto">
            Try a different name or clear the industry filter.
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-primary hover:underline"
            onClick={() => {
              setSearch("");
              setIndustry(null);
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
