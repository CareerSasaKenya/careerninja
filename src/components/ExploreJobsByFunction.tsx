"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calculator,
  ClipboardList,
  Code2,
  Cog,
  Factory,
  FlaskConical,
  GraduationCap,
  Headphones,
  HeartPulse,
  Landmark,
  Leaf,
  ListFilter,
  Megaphone,
  Package,
  PieChart,
  Plane,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FunctionJobCount } from "@/lib/jobsByFunction";

/**
 * "Explore Jobs by Function" — interactive job-market dashboard for the
 * homepage. Horizontal bars (primary interaction) + donut overview (secondary),
 * both rendered from the same server-side aggregation of active jobs.
 *
 * Every row/segment links into the existing jobs page via the
 * `/jobs?jobType=<function>` convention the jobs listing already understands —
 * no separate filtering system is introduced here.
 */

const BAR_ROWS_DESKTOP = 10;
/** Rows 9–10 stay available but are hidden below `md` to keep mobile tidy. */
const BAR_ROWS_MOBILE = 8;

/**
 * Donut shows the top six functions only; everything else rolls into
 * "Others" so the chart stays readable.
 */
const DONUT_ROWS = 6;

/** Careersasa blue/orange/accent fallback palette for functions without a dedicated color. */
const DONUT_COLORS = [
  "hsl(210 89% 40%)", // primary blue
  "hsl(199 89% 48%)", // accent cyan
  "hsl(25 95% 53%)", //  secondary orange
  "hsl(245 65% 55%)", // indigo
  "hsl(174 72% 40%)", // turquoise
  "hsl(142 76% 36%)", // green
  "hsl(280 65% 52%)", // purple
  "hsl(340 75% 50%)", // rose
  "hsl(35 90% 52%)", //  amber
  "hsl(200 45% 48%)", // slate blue
];

/** Per-function donut colors so the leading segments stay visually distinct. */
const FUNCTION_COLORS: Record<string, string> = {
  "Sales": "hsl(210 89% 40%)", // primary blue (unchanged)
  "Education & Training": "hsl(199 89% 48%)", // accent cyan (unchanged)
  "Engineering & Technology": "hsl(25 95% 53%)", // secondary orange (unchanged)
  "IT & Software": "hsl(245 65% 55%)", // indigo
  "Accounting, Auditing & Finance": "hsl(174 72% 40%)", // turquoise
  "Healthcare & Medical": "hsl(142 76% 36%)", // green
};
const OTHERS_COLOR = "hsl(220 14% 64%)";

function donutColor(name: string, index: number): string {
  return FUNCTION_COLORS[name] ?? DONUT_COLORS[index % DONUT_COLORS.length];
}

const DONUT_SIZE = 200;
const DONUT_STROKE = 22;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const OTHERS_LABEL = "Others";

type ExploreJobsByFunctionProps = {
  functions: FunctionJobCount[];
};

function functionIcon(name: string) {
  const key = name.toLowerCase();
  if (key.includes("engineering") || key.includes("technology"))
    return Cog;
  if (key.includes("software") || key.includes("it &") || key.includes("telecom"))
    return Code2;
  if (
    key.includes("data") ||
    key.includes("analytics") ||
    key.includes("ai") ||
    key.includes("science")
  )
    return BarChart3;
  if (key.includes("account") || key.includes("finance") || key.includes("bank"))
    return Calculator;
  if (key.includes("sales")) return TrendingUp;
  if (key.includes("admin") || key.includes("office")) return ClipboardList;
  if (key.includes("health") || key.includes("medical")) return HeartPulse;
  if (key.includes("management") || key.includes("executive"))
    return Briefcase;
  if (key.includes("quality") || key.includes("health & safety"))
    return ShieldCheck;
  if (
    key.includes("supply chain") ||
    key.includes("procurement") ||
    key.includes("logistics") ||
    key.includes("transport") ||
    key.includes("driver")
  )
    return Truck;
  if (
    key.includes("marketing") ||
    key.includes("media") ||
    key.includes("advertis") ||
    key.includes("pr")
  )
    return Megaphone;
  if (
    key.includes("human resources") ||
    key.includes("recruit") ||
    key.includes("hr")
  )
    return Users;
  if (
    key.includes("education") ||
    key.includes("training") ||
    key.includes("teaching") ||
    key.includes("research")
  )
    return GraduationCap;
  if (key.includes("legal")) return Scale;
  if (key.includes("customer")) return Headphones;
  if (key.includes("manufactur") || key.includes("warehouse"))
    return Factory;
  if (
    key.includes("retail") ||
    key.includes("fashion") ||
    key.includes("fmcg")
  )
    return ShoppingBag;
  if (
    key.includes("building") ||
    key.includes("architect") ||
    key.includes("construction") ||
    key.includes("real estate")
  )
    return Building2;
  if (
    key.includes("food") ||
    key.includes("catering") ||
    key.includes("hospitality") ||
    key.includes("restaurant")
  )
    return Utensils;
  if (
    key.includes("agriculture") ||
    key.includes("farming") ||
    key.includes("vet") ||
    key.includes("natural resources")
  )
    return Sprout;
  if (
    key.includes("environment") ||
    key.includes("energy") ||
    key.includes("renewable")
  )
    return Leaf;
  if (key.includes("travel") || key.includes("tourism") || key.includes("leisure"))
    return Plane;
  if (key.includes("trades") || key.includes("maintenance") || key.includes("repair"))
    return Wrench;
  if (key.includes("supply") || key.includes("procurement"))
    return Package;
  if (key.includes("insurance") || key.includes("financial"))
    return Landmark;
  return Briefcase;
}

export function ExploreJobsByFunction({
  functions,
}: ExploreJobsByFunctionProps) {
  const router = useRouter();

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeName, setActiveName] = useState<string | null>(null);

  const total = useMemo(
    () => functions.reduce((sum, f) => sum + f.count, 0),
    [functions]
  );

  const maxCount = useMemo(
    () => Math.max(1, ...functions.map((f) => f.count)),
    [functions]
  );

  const displayFunctions = useMemo(
    () => functions.slice(0, BAR_ROWS_DESKTOP),
    [functions]
  );

  /** Top functions that make it into the donut/legend (everything else → Others). */
  const donutFunctions = useMemo(
    () => functions.slice(0, DONUT_ROWS),
    [functions]
  );

  const othersCount = Math.max(0, total - donutFunctions.reduce((s, f) => s + f.count, 0));

  const donutSegments = useMemo(() => {
    const segments = donutFunctions.map((f, i) => ({
      name: f.name,
      count: f.count,
      color: donutColor(f.name, i),
    }));
    if (othersCount > 0) {
      segments.push({ name: OTHERS_LABEL, count: othersCount, color: OTHERS_COLOR });
    }
    return segments;
  }, [donutFunctions, othersCount]);

  /** Compact legend: the same six functions + Others as the donut. */
  const legendItems = useMemo(() => {
    const items = donutFunctions.map((f, i) => ({
      name: f.name,
      count: f.count,
      color: donutColor(f.name, i),
    }));
    if (othersCount > 0) {
      items.push({ name: OTHERS_LABEL, count: othersCount, color: OTHERS_COLOR });
    }
    return items;
  }, [donutFunctions, othersCount]);

  /** Donut segment currently highlighted (via bar, legend, or segment hover). */
  const activeSegment = useMemo(
    () =>
      activeName
        ? donutSegments.find((seg) => seg.name === activeName) ?? null
        : null,
    [activeName, donutSegments]
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const navigateToFunction = (name: string) => {
    if (name === OTHERS_LABEL) {
      router.push("/jobs");
      return;
    }
    router.push(`/jobs?jobType=${encodeURIComponent(name)}`);
  };

  const percentOf = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  const percentText = (count: number) => {
    const pct = percentOf(count);
    return pct < 1 ? "<1" : String(pct);
  };

  return (
    <section
      ref={sectionRef}
      className="py-3 md:py-8 px-4"
      aria-labelledby="explore-jobs-by-function-heading"
    >
      <div className="container mx-auto">
        <div className="rounded-3xl border border-border/60 bg-white shadow-sm dark:bg-card p-5 md:p-7 lg:p-8">
          {/* Header row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="explore-jobs-by-function-heading"
                  className="text-2xl md:text-3xl font-bold text-[#0A66C2]"
                >
                  Explore Jobs by Function
                </h2>
                <p className="text-sm text-muted-foreground md:text-base">
                  Find opportunities based on what you do best.
                </p>
              </div>
            </div>

            <Link href="/jobs" prefetch={false} className="shrink-0 md:mt-1">
              <Button variant="outline" className="w-full md:w-auto whitespace-nowrap">
                <ListFilter className="h-4 w-4" aria-hidden="true" />
                View all functions
              </Button>
            </Link>
          </div>

          {/* Prominent live total */}
          <div className="mt-5 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 md:mt-6">
            <span className="text-4xl md:text-5xl font-extrabold tabular-nums text-[#0A66C2]">
              {total.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground md:text-base">
              active jobs across{" "}
              <span className="font-semibold text-foreground">
                {functions.length.toLocaleString()}
              </span>{" "}
              functions
            </span>
          </div>

          {/* Bars (primary) + donut (secondary) */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start md:mt-8">
            {/* Left — interactive horizontal bars */}
            <div>
              <ul className="flex flex-col gap-1" role="list">
                {displayFunctions.map((fn, index) => {
                  const Icon = functionIcon(fn.name);
                  const isActive = activeName === fn.name;
                  const barWidth =
                    inView ? `${Math.max(2, (fn.count / maxCount) * 100)}%` : "0%";
                  return (
                    <li
                      key={fn.name}
                      className={index >= BAR_ROWS_MOBILE ? "hidden md:block" : undefined}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActiveName(fn.name)}
                        onMouseLeave={() => setActiveName(null)}
                        onClick={() => navigateToFunction(fn.name)}
                        aria-label={`${fn.name}: ${fn.count.toLocaleString()} active jobs (${percentOf(fn.count)}%), explore jobs`}
                        className={`group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors md:gap-3 ${
                          isActive ? "bg-primary/5" : "hover:bg-primary/5"
                        }`}
                      >
                        {/* Desktop tooltip */}
                        <span className="pointer-events-none absolute -top-11 left-8 z-30 hidden items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-left shadow-lg dark:bg-card md:flex md:opacity-0 md:transition-opacity md:duration-150 md:group-hover:opacity-100">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-foreground">
                              {fn.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {fn.count.toLocaleString()} active jobs ·{" "}
                              {percentText(fn.count)}%
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[#0A66C2]">
                              Explore jobs <ArrowRight className="h-3 w-3" aria-hidden="true" />
                            </span>
                          </span>
                        </span>

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>

                        <span className="w-24 truncate text-sm font-medium text-foreground sm:w-36 lg:w-44">
                          {fn.name}
                        </span>

                        <span className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                          <span
                            className={`absolute inset-y-0 left-0 rounded-full bg-[#0A66C2] origin-left ${
                              isActive
                                ? "brightness-110 scale-y-[1.35]"
                                : "group-hover:brightness-110 group-hover:scale-y-[1.35]"
                            }`}
                            style={{
                              width: barWidth,
                              transition: `width 700ms cubic-bezier(0.25,1,0.5,1) ${index * 60}ms, transform 200ms ease, filter 200ms ease`,
                            }}
                          />
                        </span>

                        <span className="flex shrink-0 flex-col items-end leading-tight sm:flex-row sm:items-baseline sm:gap-2">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {fn.count.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-muted-foreground sm:text-xs">
                            {percentText(fn.count)}%
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right — donut overview */}
            <aside
              className="flex flex-col rounded-2xl border border-border/50 bg-card/70 p-4 md:p-5"
              aria-label="Jobs by function overview"
            >
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <PieChart className="h-4 w-4 text-[#0A66C2]" aria-hidden="true" />
                Jobs by Function
                <span className="text-base font-medium text-muted-foreground">
                  (Overview)
                </span>
              </h3>

              <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                {/* Donut */}
                <div
                  className="relative h-44 w-44 shrink-0 md:h-52 md:w-52"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "scale(1)" : "scale(0.96)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                  }}
                >
                  <svg
                    viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
                    className="h-full w-full"
                    role="img"
                    aria-label="Distribution of active jobs by function"
                  >
                    <g transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}>
                      {(() => {
                        let cumulative = 0;
                        return donutSegments.map((seg) => {
                          const fraction = seg.count / total;
                          const dash = fraction * DONUT_CIRCUMFERENCE;
                          const gap = DONUT_CIRCUMFERENCE - dash;
                          const offset = -cumulative * DONUT_CIRCUMFERENCE;
                          cumulative += fraction;
                          const isActive = activeName === seg.name;
                          return (
                            <circle
                              key={seg.name}
                              cx={DONUT_SIZE / 2}
                              cy={DONUT_SIZE / 2}
                              r={DONUT_RADIUS}
                              fill="none"
                              stroke={seg.color}
                              strokeWidth={isActive ? DONUT_STROKE + 6 : DONUT_STROKE}
                              strokeDasharray={`${dash} ${gap}`}
                              strokeDashoffset={offset}
                              strokeLinecap="butt"
                              tabIndex={0}
                              role="button"
                              aria-label={`${seg.name}: ${seg.count.toLocaleString()} active jobs`}
                              className="cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              style={{
                                opacity:
                                  activeSegment && !isActive ? 0.25 : 1,
                              }}
                              onMouseEnter={() => setActiveName(seg.name)}
                              onMouseLeave={() => setActiveName(null)}
                              onFocus={() => setActiveName(seg.name)}
                              onBlur={() => setActiveName(null)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  navigateToFunction(seg.name);
                                }
                              }}
                              onClick={() => navigateToFunction(seg.name)}
                            />
                          );
                        });
                      })()}
                    </g>
                  </svg>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3">
                    <span className="max-w-full truncate text-3xl font-extrabold tabular-nums text-[#0A66C2] md:text-4xl">
                      {activeSegment
                        ? activeSegment.count.toLocaleString()
                        : total.toLocaleString()}
                    </span>
                    <span className="max-w-full truncate text-xs text-muted-foreground">
                      {activeSegment ? activeSegment.name : "Total Jobs"}
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <ul className="flex w-full flex-1 flex-col gap-0.5" role="list">
                  {legendItems.map((item) => {
                    const isActive = activeName === item.name;
                    return (
                      <li key={item.name}>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveName(item.name)}
                          onMouseLeave={() => setActiveName(null)}
                          onClick={() => navigateToFunction(item.name)}
                          className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors ${
                            isActive ? "bg-primary/5" : "hover:bg-primary/5"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                            style={{ backgroundColor: item.color }}
                            aria-hidden="true"
                          />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                            {percentText(item.count)}%
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>

          {/* Bottom-right tip callout */}
          <div className="mt-6 flex justify-start md:justify-end">
            <div className="flex max-w-md items-start gap-2.5 rounded-xl border border-border/60 bg-orange-50/70 px-3.5 py-2.5 dark:bg-orange-950/20">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Tip: Click any function to explore jobs
                </p>
                <p className="text-xs text-muted-foreground">
                  Get matched with the right opportunities for your skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
