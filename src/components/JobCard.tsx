"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, DollarSign, FileText, Clock, ExternalLink, Mail, Briefcase, GraduationCap } from "lucide-react";
import { stripHtmlTags } from "@/lib/textUtils";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  // Legacy combined salary text (optional)
  salary?: string;
  companyId?: string | null;
  companyLogo?: string | null;
  // New optional fields for richer display
  industry?: string | null;
  locationType?: string | null; // e.g., REMOTE, HYBRID, ONSITE
  employmentType?: string | null; // e.g., FULL_TIME
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null; // e.g., KES
  salaryPeriod?: string | null; // e.g., MONTH
  experienceLevel?: string | null; // e.g., MID, SENIOR
  datePosted?: string | null; // ISO string
  validThrough?: string | null; // ISO string (deadline)
  applicationUrl?: string | null;
  applyEmail?: string | null;
  applyLink?: string | null;
  skillsTop3?: string[] | null; // optional: top 3 skills
  department?: string | null;
  jobSlug?: string | null; // SEO-friendly slug
  educationLevel?: string | null; // Education level name
}

const formatCurrency = (amount?: number | null, currency?: string | null) => {
  if (amount == null || currency == null || currency === "") return null;
  try {
    return `${currency} ${amount.toLocaleString()}`;
  } catch {
    return `${currency} ${amount}`;
  }
};

const toTitleCase = (text?: string | null) => {
  if (!text) return null;
  return text
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const relativeTimeFromNow = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 30) return `Posted ${Math.floor(day / 30)} mo ago`;
  if (day >= 1) return `Posted ${day} day${day > 1 ? "s" : ""} ago`;
  if (hr >= 1) return `Posted ${hr} hour${hr > 1 ? "s" : ""} ago`;
  if (min >= 1) return `Posted ${min} min ago`;
  return "Posted Today";
};

const JobCard = ({
  id,
  title,
  company,
  location,
  description,
  salary,
  companyId,
  companyLogo,
  industry,
  locationType,
  employmentType,
  salaryMin,
  salaryMax,
  salaryCurrency,
  salaryPeriod,
  experienceLevel,
  datePosted,
  validThrough,
  applicationUrl,
  applyEmail,
  applyLink,
  skillsTop3,
  department,
  jobSlug,
  educationLevel,
}: JobCardProps) => {
  // Safely handle potentially undefined values
  const displayLocation = locationType
    ? `${location || ""}${location && locationType ? " • " : ""}${toTitleCase(locationType) || ""}`
    : location || "";

  const salaryMinFmt = formatCurrency(salaryMin, salaryCurrency);
  const salaryMaxFmt = formatCurrency(salaryMax, salaryCurrency);
  const salaryPeriodFmt = salaryPeriod ? salaryPeriod.toLowerCase() : null;

  let salaryDisplay: string | null = null;
  if (salaryMinFmt && salaryMaxFmt) {
    salaryDisplay = `${salaryMinFmt} – ${salaryMaxFmt}${salaryPeriodFmt ? ` / ${salaryPeriodFmt}` : ""}`;
  } else if (salaryMinFmt || salaryMaxFmt) {
    salaryDisplay = `${salaryMinFmt || salaryMaxFmt}${salaryPeriodFmt ? ` / ${salaryPeriodFmt}` : ""}`;
  } else if (salary) {
    salaryDisplay = salary; // legacy string
  } else {
    salaryDisplay = "Negotiable";
  }

  const experienceDisplay = experienceLevel
    ? toTitleCase(experienceLevel)?.replace("Mid", "Mid-level")?.replace("Entry", "Entry-level")
    : null;

  // Calculate time-based values as derived state instead of in useEffect
  const postedRel = relativeTimeFromNow(datePosted || undefined);
  const deadline = validThrough ? new Date(validThrough) : null;
  const isExpired = deadline ? deadline.getTime() < Date.now() : false;
  const deadlineDisplay = deadline ? `Apply by ${deadline.toLocaleDateString()}` : null;;

  const hasExternalApply = !!(applyEmail || applyLink || applicationUrl);

  // Use job slug for SEO-friendly URLs, fallback to ID
  const jobUrl = jobSlug ? `/jobs/${jobSlug}` : `/jobs/${id}`;

  return (
    <Link href={jobUrl} className="block" prefetch={true}>
      <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 hover:scale-[1.02] overflow-hidden h-full">
      <CardHeader className="pb-3">
        {/* Title (prominent) */}
        <CardTitle className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1" title={title}>
          {title}
        </CardTitle>

        {/* Company row */}
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          {companyId ? (
            <div className="flex items-center gap-2">
              {companyLogo && (
                <div className="h-6 w-6 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  <img src={companyLogo} alt={company || "Company"} className="h-5 w-5 object-contain" />
                </div>
              )}
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{company || "Unknown Company"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{company || "Direct Listing"}</span>
              {!company && <Badge variant="secondary">Admin</Badge>}
            </div>
          )}
          {industry && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="truncate" title={industry}>{industry}</span>
            </>
          )}
        </div>

        {/* Tag row: location, type, employment, experience, education */}
        <div className="flex flex-wrap gap-2 mt-3">
          {displayLocation && (
            <Badge variant="outline">
              <MapPin className="h-3.5 w-3.5 inline mr-1" />
              {displayLocation}
            </Badge>
          )}
          {employmentType && (
            <Badge variant="secondary">
              {toTitleCase(employmentType) || employmentType}
            </Badge>
          )}
          {experienceDisplay && (
            <Badge variant="outline">
              {experienceDisplay}
            </Badge>
          )}
          {educationLevel && (
            <Badge variant="outline">
              <GraduationCap className="h-3.5 w-3.5 inline mr-1" />
              {educationLevel}
            </Badge>
          )}
          {department && (
            <Badge variant="outline">
              <Briefcase className="h-3.5 w-3.5 inline mr-1" />
              {department}
            </Badge>
          )}
        </div>

        {/* Salary */}
        <div className="flex items-center gap-2 mt-3">
          <DollarSign className="h-4 w-4 text-success" />
          <span className="font-semibold text-foreground">{salaryDisplay}</span>
        </div>

        {/* Dates */}
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-3">
          {postedRel && (
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{postedRel}</span>
          )}
          {deadlineDisplay && (
            <span className={`flex items-center gap-1 ${isExpired ? 'text-destructive' : ''}`}>
              <Clock className="h-3.5 w-3.5" />
              {isExpired ? 'Job Closed' : deadlineDisplay}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Short description (2-3 sentences) */}
        <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
          {stripHtmlTags(description || "")}
        </p>

        {/* Secondary chips: top 3 skills (optional) */}
        {skillsTop3 && skillsTop3.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skillsTop3.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

export default JobCard;