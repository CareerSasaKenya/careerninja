"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import {
  companyInitials,
  resolveCompanyLogoUrl,
  type CompanyLogoInput,
} from "@/lib/companyLogo";
import { cn } from "@/lib/utils";

type LogoSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASSES: Record<LogoSize, string> = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
};

const ICON_SIZES: Record<LogoSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export interface CompanyLogoProps extends CompanyLogoInput {
  /** Display name (alias for companyName) */
  name?: string | null;
  size?: LogoSize;
  className?: string;
  /** Show Building2 when no name/logo can be resolved (direct listings) */
  showBuildingFallback?: boolean;
}

/**
 * Compact company mark for job cards / details.
 * Uses stored logo, website domain, or known-brand domain; falls back to initials.
 */
export function CompanyLogo({
  name,
  logo,
  website,
  hiringOrganizationLogo,
  companyName,
  size = "sm",
  className,
  showBuildingFallback = false,
}: CompanyLogoProps) {
  const displayName = name || companyName || "";
  const resolved = resolveCompanyLogoUrl({
    logo,
    website,
    companyName: displayName,
    hiringOrganizationLogo,
  });
  const [failed, setFailed] = useState(false);
  const showImage = !!resolved && !failed;

  if (!showImage && !displayName && showBuildingFallback) {
    return (
      <div
        className={cn(
          "shrink-0 rounded-md bg-muted flex items-center justify-center text-muted-foreground",
          SIZE_CLASSES[size],
          className
        )}
        aria-hidden
      >
        <Building2 className={ICON_SIZES[size]} />
      </div>
    );
  }

  if (!showImage) {
    return (
      <div
        className={cn(
          "shrink-0 rounded-md bg-primary/10 text-primary font-semibold flex items-center justify-center select-none",
          SIZE_CLASSES[size],
          className
        )}
        aria-hidden
        title={displayName || undefined}
      >
        {companyInitials(displayName)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 rounded-md bg-muted/80 border border-border/40 overflow-hidden flex items-center justify-center",
        SIZE_CLASSES[size],
        className
      )}
    >
      <img
        src={resolved}
        alt={displayName ? `${displayName} logo` : "Company logo"}
        className="h-full w-full object-contain p-0.5"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default CompanyLogo;
