import type { Metadata } from "next";
import { BrowseHubChrome } from "@/components/BrowseHubChrome";
import { JobsByCountyMap } from "@/components/ExploreJobsByCounty";
import { getActiveJobsByCounty } from "@/lib/jobsByCounty";
import { SITE_URL } from "@/lib/browseNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const title = "Jobs by County";
const description =
  "Explore live jobs across Kenya's 47 counties. Tap the map or pick a county to see open roles.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/jobs/counties`,
  },
  openGraph: {
    title: `${title} | CareerSasa`,
    description,
    url: `${SITE_URL}/jobs/counties`,
    type: "website",
    siteName: "CareerSasa",
  },
};

export default async function JobsByCountyPage() {
  const jobsByCounty = await getActiveJobsByCounty();

  return (
    <BrowseHubChrome
      eyebrow="Browse jobs"
      title="Jobs by County"
      description="The interactive map belongs here — tap a county or pick from the ranked list to see live jobs nearby."
    >
      {jobsByCounty.length > 0 ? (
        <JobsByCountyMap counts={jobsByCounty} />
      ) : (
        <p className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          Live county counts are unavailable right now. You can still{" "}
          <a href="/jobs" className="font-semibold text-primary hover:underline">
            browse all jobs
          </a>
          .
        </p>
      )}
    </BrowseHubChrome>
  );
}
