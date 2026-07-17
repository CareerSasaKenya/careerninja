"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, ArrowRight, Clock, MapPin, CheckCircle2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import CanonicalTag from "@/components/CanonicalTag";
import { CompanyLogo } from "@/components/CompanyLogo";
import { CompanyCard, type CompanyCardData } from "@/components/CompanyCard";
import { IndustryCard } from "@/components/IndustryCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Autoplay from "embla-carousel-autoplay";
import { usePageContent, getContentValue } from "@/hooks/usePageContent";
import { formatJobSeoTitle } from "@/lib/textUtils";
import type { IndustryCardData } from "@/lib/companyDirectory";
import { getIndustryCardImage } from "@/lib/industryCardImages";

type HomeJobCompany = {
  id?: string | null;
  name?: string | null;
  logo?: string | null;
  website?: string | null;
} | null;

function homeJobCompanyName(job: {
  company?: string | null;
  companies?: HomeJobCompany | HomeJobCompany[];
}) {
  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
  return company?.name || job.company || "";
}

function homeJobHref(job: { id: string; job_slug?: string | null }) {
  return `/jobs/${job.job_slug || job.id}`;
}

type HomePageProps = {
  topIndustries: IndustryCardData[];
  topCompanies: CompanyCardData[];
};

export default function HomePage({
  topIndustries,
  topCompanies,
}: HomePageProps) {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [activeJobs, setActiveJobs] = useState(0);
  const [companies, setCompanies] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const { data: content } = usePageContent("home");

  const heroTitle = getContentValue(content, "hero_title", "Stop Searching. Start Getting Hired.");
  const heroSubtitle = getContentValue(content, "hero_subtitle", "You've sent dozens of applications with zero callbacks. CareerSasa changes that. We match your skills directly to employers who are hiring right now, so you skip the black hole and land your next interview faster.");
  const statsJobsTarget = parseInt(getContentValue(content, "stats_jobs", "1070"));
  const statsCompaniesTarget = parseInt(getContentValue(content, "stats_companies", "103"));
  const statsSuccessRateTarget = parseInt(getContentValue(content, "stats_success_rate", "90"));
  const ctaTitle = getContentValue(content, "cta_title", "Your Next Interview Is 60 Seconds Away");
  const ctaSubtitle = getContentValue(content, "cta_subtitle", "CareerSasa matches your skills directly to employer requirements, not just keywords. That's why our users get 3x more interview callbacks than on other job boards. Join free today.");

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          let jobCount = 0;
          const jobInterval = setInterval(() => {
            jobCount += 25;
            if (jobCount >= statsJobsTarget) {
              setActiveJobs(statsJobsTarget);
              clearInterval(jobInterval);
            } else {
              setActiveJobs(jobCount);
            }
          }, 30);

          let companyCount = 0;
          const companyInterval = setInterval(() => {
            companyCount += 3;
            if (companyCount >= statsCompaniesTarget) {
              setCompanies(statsCompaniesTarget);
              clearInterval(companyInterval);
            } else {
              setCompanies(companyCount);
            }
          }, 30);

          let rateCount = 0;
          const rateInterval = setInterval(() => {
            rateCount += 2;
            if (rateCount >= statsSuccessRateTarget) {
              setSuccessRate(statsSuccessRateTarget);
              clearInterval(rateInterval);
            } else {
              setSuccessRate(rateCount);
            }
          }, 30);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, statsJobsTarget, statsCompaniesTarget, statsSuccessRateTarget]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set("search", searchKeyword);
    if (searchLocation) params.set("location", searchLocation);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const { data: featuredJobs = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(id, name, logo, website)")
        .eq("status", "active")
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("is_promoted", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: latestJobs = [], isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, companies(id, name, logo, website)")
        .eq("status", "active")
        .order("is_featured", { ascending: false, nullsFirst: false })
        .order("is_promoted", { ascending: false, nullsFirst: false })
        .order("date_posted", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["recent-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <CanonicalTag url="/" />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-mesh opacity-60" aria-hidden />
        <div className="absolute inset-0 bg-gradient-subtle" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-pulse"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden
        />

        <div className="container relative mx-auto grid lg:grid-cols-2 gap-8 lg:gap-10 items-center py-10 md:py-14 px-4">
          <div className="animate-fade-in z-10">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary mb-3 font-medium">
              CareerSasa · Kenya
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent leading-[1.1]">
              {heroTitle}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="glass p-4 sm:p-5 rounded-2xl mb-5 shadow-lg border border-border/50">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Job title or keyword"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button variant="gradient" size="lg" className="sm:w-auto" onClick={handleSearch}>
                  <Search className="mr-2 h-5 w-5" />
                  Search Jobs
                </Button>
              </div>
            </div>

            <div
              ref={statsRef}
              className="grid grid-cols-3 gap-2 sm:gap-4 divide-x divide-border/60 rounded-xl border border-border/50 bg-background/60 backdrop-blur-sm py-3"
            >
              <div className="text-center px-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                  {activeJobs}+
                </div>
                <div className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide mt-1">
                  Active Jobs
                </div>
              </div>
              <div className="text-center px-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                  {companies}+
                </div>
                <div className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide mt-1">
                  Companies
                </div>
              </div>
              <div className="text-center px-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                  {successRate}%
                </div>
                <div className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide mt-1">
                  Success Rate
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute -inset-3 bg-gradient-primary opacity-15 rounded-[2rem] blur-2xl" aria-hidden />
            <img
              src="/assets/hero-professional.jpg"
              alt="Professional Kenyan Business Woman"
              className="relative rounded-3xl shadow-2xl w-full h-[380px] md:h-[460px] object-cover ring-1 ring-border/40"
            />
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-10 md:py-12 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Opportunities</h2>
            <p className="text-muted-foreground">
              Hand-picked roles from top Kenyan employers, with new jobs added daily
            </p>
          </div>

          {loadingFeatured ? (
            <div className="text-center py-10">Loading featured jobs...</div>
          ) : (
            <>
              <Carousel
                className="w-full mb-6"
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {featuredJobs.map((job) => {
                    const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
                    const companyName = homeJobCompanyName(job);
                    return (
                      <CarouselItem key={job.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                        <Card
                          className={`glass hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                            job.is_featured ? "border-2 border-yellow-500/50" : ""
                          } ${job.is_promoted ? "border-2 border-blue-500/50" : ""}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex gap-2">
                                {job.is_featured && (
                                  <Badge className="bg-yellow-500 text-white gap-1">
                                    <Star className="h-3 w-3 fill-white" />
                                    Featured
                                  </Badge>
                                )}
                                {job.is_promoted && (
                                  <Badge className="bg-blue-500 text-white">Promoted</Badge>
                                )}
                                {!job.is_featured && !job.is_promoted && (
                                  <Badge className="bg-gradient-primary text-primary-foreground">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                              {formatJobSeoTitle(job.title, companyName, {
                                city: job.job_location_city,
                                county: job.job_location_county,
                                rawLocation: job.location,
                                isRemote: job.job_location_type === "REMOTE",
                              })}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                              <CompanyLogo
                                name={companyName}
                                logo={company?.logo}
                                website={company?.website}
                                size="sm"
                              />
                              <span className="line-clamp-1">{companyName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            {job.salary && (
                              <div className="text-primary font-semibold mb-4">{job.salary}</div>
                            )}
                            <Link href={homeJobHref(job)} prefetch={true}>
                              <Button className="w-full" variant="outline">
                                View Details
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious
                  className="md:hidden"
                  style={{ backgroundColor: "#f97316", color: "white", border: "none" }}
                />
                <CarouselNext
                  className="md:hidden"
                  style={{ backgroundColor: "#f97316", color: "white", border: "none" }}
                />
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>

              <div className="flex justify-center">
                <Link href="/jobs" prefetch={true}>
                  <Button variant="outline" className="whitespace-nowrap">
                    Browse all jobs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Top industries by open roles */}
      {topIndustries.length > 0 && (
        <section className="py-10 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-primary mb-2 font-medium">
                  Hot sectors
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Top industries hiring now
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  The six sectors with the most open roles on CareerSasa right now
                </p>
              </div>
              <Link href="/companies" prefetch={true} className="shrink-0 hidden sm:inline-flex">
                <Button variant="outline" className="whitespace-nowrap">
                  Browse all industries <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {topIndustries.map((industry, index) => (
                <IndustryCard
                  key={industry.slug}
                  title={industry.name}
                  href={`/companies/industry/${industry.slug}`}
                  companyCount={industry.companyCount}
                  openJobs={industry.openJobs}
                  imageUrl={getIndustryCardImage(industry.name)}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/companies" prefetch={true}>
                <Button variant="outline" className="whitespace-nowrap">
                  Browse all industries <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top companies by open roles */}
      {topCompanies.length > 0 && (
        <section className="py-10 md:py-12 px-4 bg-gradient-subtle">
          <div className="container mx-auto">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-primary mb-2 font-medium">
                  Employers
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Top companies hiring now
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Employers with the most open roles — explore profiles and apply
                </p>
              </div>
              <Link
                href="/companies/industry/all"
                prefetch={true}
                className="shrink-0 hidden sm:inline-flex"
              >
                <Button variant="outline" className="whitespace-nowrap">
                  Browse all companies <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
              {topCompanies.map((company, index) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/companies/industry/all" prefetch={true}>
                <Button variant="outline" className="whitespace-nowrap">
                  Browse all companies <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-10 md:py-12 px-4">
        <div className="container mx-auto grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why 95% of Our Users Land Interviews Within 3 Months
            </h2>
            <p className="text-muted-foreground mb-5 text-lg">
              Most job boards dump listings and leave you to figure it out. CareerSasa is
              different. We actively match you to employers using AI, not just keywords.
            </p>
            <div className="space-y-3">
              {[
                "Smart AI matching that connects your skills to jobs you'll actually get, not just jobs that exist",
                "Real-time alerts: be among the first to apply when new roles drop in your inbox",
                "Free career tools worth KES 10,000+: CV builder, cover letter generator & LinkedIn optimizer",
                "1,070+ verified jobs from 103+ companies across every county in Kenya",
                "Zero spam, zero ghost listings. Every job is verified and actively hiring",
                "Trusted by Kenyan professionals, built by Kenyans, for Kenya's job market",
                "Our users report 3x more interview callbacks compared to applying on generic job boards",
                "100% free to join, search, and apply. No hidden fees, no catch",
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-base md:text-lg">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/jobs" prefetch={true}>
                <Button variant="gradient" size="lg">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-secondary opacity-10 rounded-3xl blur-3xl" />
            <img
              src="/assets/team-collaboration.jpg"
              alt="Kenyan Professionals Collaborating"
              className="relative rounded-3xl shadow-2xl w-full h-[420px] md:h-[520px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-12 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
            From &quot;No Callbacks&quot; to &quot;When Can You Start?&quot;
          </h2>
          <p className="text-center text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Real Kenyans. Real results. Here&apos;s what happens when your CV meets the right
            platform.
          </p>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                name: "David Kamau",
                role: "Software Developer at Safaricom",
                image: "/assets/testimonial-1.jpg",
                quote:
                  "I'd been applying for 4 months with zero callbacks. Within 2 weeks on CareerSasa, I had 3 interviews. The AI matching actually works. It connected me to roles I would never have found myself.",
              },
              {
                name: "Grace Wanjiru",
                role: "Marketing Manager at KCB",
                image: "/assets/testimonial-2.jpg",
                quote:
                  "I was stuck in a dead-end role for 2 years. CareerSasa's job alerts put a marketing manager position in my inbox that I wasn't even searching for. I applied the same day and got the offer.",
              },
              {
                name: "Brian Ochieng",
                role: "Data Analyst at Equity Bank",
                image: "/assets/testimonial-3.jpg",
                quote:
                  "The free CV builder alone was worth signing up for. But what surprised me was getting 3 interview invitations in my first month. CareerSasa shows you jobs that actually match your skills.",
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-10 md:py-12 px-4">
        <div className="container mx-auto">
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Job Openings</h2>
            <p className="text-muted-foreground">
              Fresh opportunities posted today. Early applicants get 4x more callbacks
            </p>
          </div>

          {loadingLatest ? (
            <div className="text-center py-10">Loading latest jobs...</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-6">
                {latestJobs.map((job) => {
                  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
                  const companyName = homeJobCompanyName(job);
                  return (
                    <Card
                      key={job.id}
                      className={`glass hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                        job.is_featured ? "border-2 border-yellow-500/50 shadow-lg" : ""
                      } ${job.is_promoted ? "border-2 border-blue-500/50" : ""}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            {job.is_featured && (
                              <Badge className="bg-yellow-500 text-white gap-1">
                                <Star className="h-3 w-3 fill-white" />
                                Featured
                              </Badge>
                            )}
                            {job.is_promoted && (
                              <Badge className="bg-blue-500 text-white">Promoted</Badge>
                            )}
                            {!job.is_featured && !job.is_promoted && (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">Just posted</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 line-clamp-1">
                          {formatJobSeoTitle(job.title, companyName, {
                            city: job.job_location_city,
                            county: job.job_location_county,
                            rawLocation: job.location,
                            isRemote: job.job_location_type === "REMOTE",
                          })}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <CompanyLogo
                            name={companyName}
                            logo={company?.logo}
                            website={company?.website}
                            size="sm"
                          />
                          <span className="line-clamp-1">{companyName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="text-primary font-semibold mb-4">{job.salary}</div>
                        )}
                        <Link href={homeJobHref(job)} prefetch={true}>
                          <Button className="w-full">Apply Now</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Link href="/jobs" prefetch={true}>
                  <Button variant="outline" className="whitespace-nowrap">
                    Browse all jobs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-10 md:py-12 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Your Career, Transformed
          </h2>
          <p className="text-center text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            From fresh graduates to senior executives, CareerSasa has helped thousands of
            Kenyans level up.
          </p>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <Card className="glass overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="overflow-hidden h-[22rem] md:h-[26rem]">
                <img
                  src="/assets/success-story-1.jpg"
                  alt="Success Story"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3">
                  From Graduate to Senior Manager in 3 Years
                </h3>
                <p className="text-muted-foreground mb-4">
                  &quot;I started as a fresh graduate with no connections. CareerSasa matched me
                  to my first role, then my second, then my third. In 3 years, I went from intern
                  to Senior Manager at NCBA Bank. Every opportunity was the right next step.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary" />
                  <div>
                    <div className="font-semibold">Sarah Njeri</div>
                    <div className="text-sm text-muted-foreground">
                      Senior Manager, NCBA Bank
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="overflow-hidden h-[22rem] md:h-[26rem]">
                <img
                  src="/assets/success-story-2.jpg"
                  alt="Success Story"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3">
                  Career Change Without Starting Over
                </h3>
                <p className="text-muted-foreground mb-4">
                  &quot;I spent 6 years in finance and wanted to move into tech, but every job
                  board made me feel like I had to start from scratch. CareerSasa&apos;s matching
                  found tech roles that valued my finance background. I&apos;m now a Tech Lead at
                  Andela Kenya.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-secondary" />
                  <div>
                    <div className="font-semibold">Michael Otieno</div>
                    <div className="text-sm text-muted-foreground">
                      Tech Lead, Andela Kenya
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="py-10 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="mb-6 md:mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Career Insights That Actually Get You Hired
              </h2>
              <p className="text-muted-foreground">
                Free expert advice. Knowing what employers want is half the battle
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 md:gap-6 mb-6">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} prefetch={true}>
                  <Card className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    {post.featured_image && (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    )}
                    <CardContent className="p-6">
                      {post.category && (
                        <Badge variant="secondary" className="mb-3">
                          {post.category}
                        </Badge>
                      )}
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/blog" prefetch={true}>
                <Button variant="outline" className="whitespace-nowrap">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-12 md:py-14 px-4 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{ctaTitle}</h2>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto opacity-90">
            {ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center max-w-2xl mx-auto px-4">
            <Link href="/jobs" prefetch={true} className="flex-1 sm:flex-initial">
              <Button
                size="lg"
                variant="secondary"
                className="w-full text-base sm:text-lg px-6 sm:px-10 whitespace-normal sm:whitespace-nowrap"
              >
                <Search className="mr-2 h-5 w-5 shrink-0" />
                <span className="break-words">Find My Next Job — It&apos;s Free</span>
              </Button>
            </Link>
            <Link href="/post-job" prefetch={true} className="flex-1 sm:flex-initial">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-base sm:text-lg px-6 sm:px-10 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent whitespace-normal sm:whitespace-nowrap"
              >
                <Briefcase className="mr-2 h-5 w-5 shrink-0" />
                <span className="break-words">Post a Job — First 3 Free</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
