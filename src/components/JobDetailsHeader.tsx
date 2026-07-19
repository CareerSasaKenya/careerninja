import Link from "next/link";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  FileText,
  Clock,
  CalendarDays,
  Star,
  TrendingUp,
} from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { SaveJobButton } from "@/components/SaveJobButton";
import {
  formatJobSeoTitle,
  buildLocationString,
  jobPostedLabel,
} from "@/lib/textUtils";

type JobDetailsHeaderProps = {
  job: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
    date_posted?: string | null;
    valid_through?: string | null;
    is_featured?: boolean | null;
    is_promoted?: boolean | null;
    promotion_tier?: string | null;
    experience_level?: string | null;
    employment_type?: string | null;
    employment_types?: string[] | null;
    job_location_type?: string | null;
    job_location_types?: string[] | null;
    job_location_city?: string | null;
    job_location_county?: string | null;
    industry?: string | null;
    industries?: string[] | null;
    job_function?: string | null;
    job_functions?: string[] | null;
    area_of_study?: string | null;
    field_of_study?: string | null;
    hiring_organization_logo?: string | null;
    hiring_organization_url?: string | null;
    company_id?: string | null;
    companies?: {
      id: string;
      name: string;
      logo?: string | null;
      website?: string | null;
    } | null;
  };
  industryLabels: string[];
  functionLabels: string[];
};

function formatEnumLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatShortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function JobDetailsHeader({
  job,
  industryLabels,
  functionLabels,
}: JobDetailsHeaderProps) {
  const companyName = job.companies?.name || job.company || "Direct Listing";
  const isRemote =
    job.job_location_type === "REMOTE" ||
    job.job_location_types?.includes("REMOTE");

  const displayLocation = isRemote
    ? "Remote (Kenya)"
    : buildLocationString(
        job.job_location_city,
        job.job_location_county,
        job.location,
      ) || job.location || "Kenya";

  const seoTitle = formatJobSeoTitle(job.title, companyName === "Direct Listing" ? null : companyName, {
    city: job.job_location_city,
    county: job.job_location_county,
    rawLocation: job.location,
    isRemote: !!isRemote,
  });

  const postedRel = jobPostedLabel(job.date_posted);
  const postedAbsolute = formatShortDate(job.date_posted);
  const deadlineAbsolute = formatShortDate(job.valid_through);
  const deadlineDate = job.valid_through ? new Date(job.valid_through) : null;
  const isExpired = deadlineDate ? deadlineDate.getTime() < Date.now() : false;

  const employmentTypes =
    job.employment_types?.length
      ? job.employment_types
      : job.employment_type
        ? [job.employment_type]
        : [];

  const locationTypes =
    job.job_location_types?.length
      ? job.job_location_types
      : job.job_location_type
        ? [job.job_location_type]
        : [];

  const metaTags = [
    ...employmentTypes.map((type) => ({
      key: `emp-${type}`,
      label: formatEnumLabel(type),
    })),
    ...locationTypes.map((type) => ({
      key: `loc-${type}`,
      label: formatEnumLabel(type),
    })),
    ...(job.experience_level
      ? [{ key: `exp-${job.experience_level}`, label: job.experience_level }]
      : []),
    ...industryLabels.map((label) => ({ key: `ind-${label}`, label })),
    ...functionLabels.map((label) => ({ key: `fn-${label}`, label })),
    ...(job.area_of_study
      ? [{ key: `area-${job.area_of_study}`, label: job.area_of_study }]
      : []),
    ...(job.field_of_study
      ? [{ key: `field-${job.field_of_study}`, label: job.field_of_study }]
      : []),
  ];

  return (
    <CardHeader className="space-y-0 border-b bg-gradient-to-br from-muted/50 via-background to-background p-4 sm:p-5">
      {/* Screen-reader / SEO continuity for the long-form title */}
      <p className="sr-only">{seoTitle}</p>

      {(job.is_featured || job.is_promoted) && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {job.is_featured && (
            <Badge className="gap-1 bg-amber-500 px-2.5 py-1 text-white hover:bg-amber-500">
              <Star className="h-3.5 w-3.5 fill-white" />
              Featured
            </Badge>
          )}
          {job.is_promoted && (
            <Badge className="gap-1 bg-sky-600 px-2.5 py-1 text-white hover:bg-sky-600">
              <TrendingUp className="h-3.5 w-3.5" />
              Promoted{job.promotion_tier ? ` · ${job.promotion_tier}` : ""}
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
          <div className="shrink-0 self-start rounded-xl border border-border/70 bg-card p-1 shadow-sm">
            {job.company_id && job.companies ? (
              <CompanyLogo
                name={job.companies.name}
                logo={job.companies.logo}
                website={job.companies.website}
                size="lg"
              />
            ) : job.company ? (
              <CompanyLogo
                name={job.company}
                logo={job.hiring_organization_logo}
                website={job.hiring_organization_url}
                size="lg"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm sm:text-[15px]">
              {job.company_id && job.companies ? (
                <Link
                  href={`/companies/${job.company_id}`}
                  className="font-medium text-foreground/90 transition-colors hover:text-primary"
                >
                  {job.companies.name}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 font-medium text-foreground/90">
                  {companyName}
                  {!job.company && (
                    <Badge variant="outline" className="text-xs font-normal">
                      Direct Listing
                    </Badge>
                  )}
                </span>
              )}

              {displayLocation && (
                <>
                  <span className="text-muted-foreground/35" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{displayLocation}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <SaveJobButton
            jobId={job.id}
            variant="outline"
            size="default"
            showText={true}
          />
        </div>
      </div>

      {/* Full-width date row so posted + expiry stay on one line on mobile */}
      {(postedRel || postedAbsolute || deadlineAbsolute) && (
        <div className="mt-2.5 flex flex-nowrap items-center gap-x-2 overflow-x-auto text-xs text-muted-foreground sm:mt-3 sm:gap-x-3 sm:text-sm">
          {(postedRel || postedAbsolute) && (
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
              <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span>
                {postedRel
                  ? postedRel === "Just posted"
                    ? "Just posted"
                    : `Posted ${postedRel}`
                  : `Posted ${postedAbsolute}`}
              </span>
            </span>
          )}

          {(postedRel || postedAbsolute) && deadlineAbsolute && (
            <span className="shrink-0 text-muted-foreground/35" aria-hidden>
              ·
            </span>
          )}

          {deadlineAbsolute && (
            <span
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap ${
                isExpired ? "font-medium text-destructive" : ""
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <span>
                {isExpired ? "Closed" : `Apply by ${deadlineAbsolute}`}
              </span>
            </span>
          )}
        </div>
      )}

      {metaTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3 sm:mt-3.5 sm:gap-2">
          {metaTags.map((tag) => (
            <Badge
              key={tag.key}
              variant="outline"
              className="rounded-md border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {tag.label}
            </Badge>
          ))}
        </div>
      )}
    </CardHeader>
  );
}
