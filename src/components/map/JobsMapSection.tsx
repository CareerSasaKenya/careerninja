"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { KenyaJobsMap } from "@/components/map/KenyaJobsMap";
import type { CountyJobCount } from "@/lib/jobsByCounty";

const SECTION_HEADING_CLASS = "text-3xl md:text-4xl font-bold mb-2 text-[#0A66C2]";
const SECTION_SUBCOPY_CLASS = "text-muted-foreground";

type JobsMapSectionProps = {
  counts: CountyJobCount[];
};

/**
 * "Live Jobs Across Kenya" homepage section — an interactive 47-county map
 * with a compact top-counties panel. Data is aggregated server-side and
 * passed in as props; the map itself is lazy-loaded from the homepage.
 */
export function JobsMapSection({ counts }: JobsMapSectionProps) {
  const total = useMemo(() => counts.reduce((sum, c) => sum + c.count, 0), [counts]);
  const activeCounties = counts.length;
  const topCounties = counts.slice(0, 5);

  return (
    <section className="py-6 md:py-8 px-4" aria-labelledby="live-jobs-map-heading">
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
          <h2 id="live-jobs-map-heading" className={SECTION_HEADING_CLASS}>
            Live Jobs Across Kenya
          </h2>
          <p className={SECTION_SUBCOPY_CLASS}>
            {total.toLocaleString()} active opportunities across {activeCounties} counties —
            tap a county to explore
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="relative">
            <KenyaJobsMap counts={counts} />
          </div>

          <aside
            className="rounded-2xl border border-border/50 bg-card/70 p-4 md:p-5 lg:sticky lg:top-6"
            aria-label="Top counties by job count"
          >
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              Top Counties by Job Count
            </h3>
            <ol className="space-y-0.5">
              {topCounties.map((county, index) => (
                <li key={county.name}>
                  <Link
                    href={`/jobs?location=${encodeURIComponent(county.name)}`}
                    prefetch={false}
                    className="group flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-foreground transition-colors hover:bg-primary/5"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="w-5 flex-shrink-0 text-right text-sm font-bold text-primary">
                        {index + 1}.
                      </span>
                      <span className="truncate text-sm font-medium group-hover:text-[#0A66C2]">
                        {county.name}
                      </span>
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold tabular-nums">
                      {county.count.toLocaleString()}
                      <ArrowRight
                        className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#0A66C2]"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-3 border-t border-border/60 pt-3">
              <Link
                href="/jobs"
                prefetch={false}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Browse all jobs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
