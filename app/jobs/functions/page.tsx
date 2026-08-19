import type { Metadata } from "next";
import { BrowseHubChrome } from "@/components/BrowseHubChrome";
import { ExploreJobsByFunction } from "@/components/ExploreJobsByFunction";
import { completeFunctionCatalog } from "@/lib/completeFunctionCatalog";
import { getActiveJobsByFunction } from "@/lib/jobsByFunction";
import { SITE_URL } from "@/lib/browseNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const title = "Jobs by Function";
const description =
  "Browse every job function on CareerSasa. See live counts, compare fields, and open roles in the area you work.";

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
      description="Every field we hire for — including those with no live roles right now. Search, sort, and click through to open jobs."
    >
      <ExploreJobsByFunction
        functions={completeFunctionCatalog(functions)}
        variant="full"
        showHeader={false}
      />
    </BrowseHubChrome>
  );
}
