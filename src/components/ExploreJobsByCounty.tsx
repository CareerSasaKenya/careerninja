"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CountyJobCount } from "@/lib/jobsByCounty";
import { JobsMapSectionSkeleton } from "@/components/map/JobsMapSectionSkeleton";

const JobsMapSection = dynamic(
  () =>
    import("@/components/map/JobsMapSection").then((mod) => mod.JobsMapSection),
  {
    ssr: false,
    loading: () => <JobsMapSectionSkeleton />,
  }
);

const SECTION_HEADING_CLASS = "text-3xl md:text-4xl font-bold mb-2 text-[#0A66C2]";
const SECTION_SUBCOPY_CLASS = "text-muted-foreground";

const TEASER_ROWS = 8;

type ExploreJobsByCountyTeaserProps = {
  counties: CountyJobCount[];
};

/**
 * Compact homepage teaser for jobs-by-county. The full interactive map lives
 * on `/jobs/counties` so it does not dominate the homepage on desktop.
 */
export function ExploreJobsByCountyTeaser({
  counties,
}: ExploreJobsByCountyTeaserProps) {
  const total = counties.reduce((sum, c) => sum + c.count, 0);
  const top = counties.slice(0, TEASER_ROWS);
  const maxCount = Math.max(1, ...top.map((c) => c.count));

  return (
    <section
      className="py-3 md:py-8 px-4"
      aria-labelledby="explore-jobs-by-county-teaser-heading"
    >
      <div className="container mx-auto">
        <div className="mb-4 md:mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 dark:bg-green-950/40">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-green-700 dark:text-green-400">
              Live
            </span>
          </div>
          <h2
            id="explore-jobs-by-county-teaser-heading"
            className={SECTION_HEADING_CLASS}
          >
            Jobs by County
          </h2>
          <p className={SECTION_SUBCOPY_CLASS}>
            <span className="font-semibold text-green-700 dark:text-green-400">
              {total.toLocaleString()} live jobs · {counties.length} counties
            </span>
            <span className="text-muted-foreground">
              {" "}
              — explore the map for all 47
            </span>
          </p>
        </div>

        <ol className="mx-auto max-w-3xl space-y-1" role="list">
          {top.map((county, index) => {
            const barWidth = `${Math.max(2, (county.count / maxCount) * 100)}%`;
            return (
              <li key={county.name}>
                <Link
                  href={`/jobs?location=${encodeURIComponent(county.name)}`}
                  prefetch={false}
                  className="group grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 transition-colors hover:bg-primary/5 md:grid-cols-[16rem_minmax(0,1fr)_5.5rem] lg:grid-cols-[18rem_minmax(0,1fr)_5.5rem]"
                >
                  <span className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
                    <span className="w-6 shrink-0 text-right text-sm font-bold tabular-nums text-primary">
                      {index + 1}.
                    </span>
                    <span className="min-w-0 text-sm font-medium leading-snug text-foreground group-hover:text-[#0A66C2]">
                      {county.name}
                    </span>
                  </span>
                  <span className="relative h-2.5 w-full min-w-0 overflow-hidden rounded-full bg-muted">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-[#0A66C2] origin-left group-hover:brightness-110 group-hover:scale-y-[1.35]"
                      style={{ width: barWidth }}
                    />
                  </span>
                  <span className="flex shrink-0 items-center justify-end gap-1 text-sm font-semibold tabular-nums">
                    {county.count.toLocaleString()}
                    <ArrowRight
                      className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#0A66C2]"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex justify-center">
          <Link href="/jobs/counties" prefetch={true}>
            <Button variant="outline" className="whitespace-nowrap">
              <MapPin className="mr-2 h-4 w-4" />
              Explore the map
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function JobsByCountyMap({ counts }: { counts: CountyJobCount[] }) {
  return <JobsMapSection counts={counts} showHeading={false} />;
}
