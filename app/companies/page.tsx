import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { IndustryCardsGrid } from "@/components/IndustryCard";
import { getCompanyDirectoryData } from "@/lib/companyDirectory";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://www.careersasa.co.ke";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Companies by Industry | CareerSasa",
  description:
    "Browse Kenyan employers by industry on CareerSasa. Pick a sector to see company profiles and open jobs.",
  alternates: {
    canonical: `${SITE_URL.replace(/\/$/, "")}/companies`,
  },
  openGraph: {
    title: "Companies by Industry | CareerSasa",
    description:
      "Browse Kenyan employers by industry on CareerSasa. Pick a sector to see company profiles and open jobs.",
    url: `${SITE_URL.replace(/\/$/, "")}/companies`,
    type: "website",
    siteName: "CareerSasa",
  },
};

export default async function CompaniesPage() {
  const { companies, industryCards } = await getCompanyDirectoryData();
  const totalOpenJobs = companies.reduce((sum, c) => sum + c.openJobs, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-subtle" aria-hidden />
        <div className="container relative mx-auto px-4 py-10 md:py-14">
          <p className="text-sm font-medium text-primary mb-2 tracking-wide">
            Employers on CareerSasa
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Companies
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
            Choose an industry to explore employers hiring in Kenya — or browse all
            companies at once.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
        <IndustryCardsGrid
          industries={industryCards}
          totalCompanies={companies.length}
          totalOpenJobs={totalOpenJobs}
        />
      </main>

      <Footer />
    </div>
  );
}
