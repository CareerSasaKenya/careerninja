import type { Metadata } from "next";
import { BrowseHubChrome } from "@/components/BrowseHubChrome";
import { ExploreJobsByIndustry } from "@/components/ExploreJobsByIndustry";
import { getActiveJobsByIndustry } from "@/lib/jobsByIndustry";
import { SITE_URL } from "@/lib/browseNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const title = "Jobs by Industry";
const description =
  "Browse live jobs in Kenya by industry. See which sectors are hiring and jump into open roles.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/jobs/industries`,
  },
  openGraph: {
    title: `${title} | CareerSasa`,
    description,
    url: `${SITE_URL}/jobs/industries`,
    type: "website",
    siteName: "CareerSasa",
  },
};

export default async function JobsByIndustryPage() {
  const industries = await getActiveJobsByIndustry();

  return (
    <BrowseHubChrome
      eyebrow="Browse jobs"
      title="Jobs by Industry"
      description="Pick a sector to see live roles. Industry names are shown in full so you can compare hiring at a glance."
    >
      <ExploreJobsByIndustry industries={industries} variant="full" />
    </BrowseHubChrome>
  );
}
