import type { Metadata } from "next";
import { BrowseHubChrome } from "@/components/BrowseHubChrome";
import { ExploreJobsByFunction } from "@/components/ExploreJobsByFunction";
import { getActiveJobsByFunction } from "@/lib/jobsByFunction";
import { SITE_URL } from "@/lib/browseNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const title = "Jobs by Function";
const description =
  "Browse live jobs in Kenya by function or field. Compare every role type with full names and aligned counts.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/jobs/functions`,
  },
  openGraph: {
    title: `${title} | CareerSasa`,
    description,
    url: `${SITE_URL}/jobs/functions`,
    type: "website",
    siteName: "CareerSasa",
  },
};

export default async function JobsByFunctionPage() {
  const functions = await getActiveJobsByFunction();

  return (
    <BrowseHubChrome
      eyebrow="Browse jobs"
      title="Jobs by Function"
      description="Find opportunities based on what you do. Every field name is shown in full, and the bars share one starting line so you can compare at a glance."
    >
      <ExploreJobsByFunction
        functions={functions}
        variant="full"
        showHeader={false}
      />
    </BrowseHubChrome>
  );
}
