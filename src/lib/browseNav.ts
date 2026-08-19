import { Briefcase, Building2, Layers, MapPin } from "lucide-react";

/** Shared Browse menu + footer links for jobs hubs. */
export const browseNavLinks = [
  {
    title: "All jobs",
    href: "/jobs",
    description: "Search and filter every live role",
    icon: Briefcase,
  },
  {
    title: "By industry",
    href: "/jobs/industries",
    description: "See which sectors are hiring now",
    icon: Building2,
  },
  {
    title: "By function",
    href: "/jobs/functions",
    description: "Browse jobs by what you do",
    icon: Layers,
  },
  {
    title: "By county",
    href: "/jobs/counties",
    description: "Find roles across Kenya's 47 counties",
    icon: MapPin,
  },
] as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.careersasa.co.ke"
).replace(/\/$/, "");
