import HomePage from "@/components/HomePage";
import {
  getCompanyDirectoryData,
  getHomepageStats,
} from "@/lib/companyDirectory";
import { getActiveJobsByCounty } from "@/lib/jobsByCounty";
import { getActiveJobsByFunction } from "@/lib/jobsByFunction";
import { getActiveJobsByIndustry } from "@/lib/jobsByIndustry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [
    { companies },
    stats,
    jobsByCounty,
    jobsByFunction,
    jobsByIndustry,
  ] = await Promise.all([
    getCompanyDirectoryData(),
    getHomepageStats(),
    getActiveJobsByCounty(),
    getActiveJobsByFunction(),
    getActiveJobsByIndustry(),
  ]);

  const topCompanies = companies
    .filter((company) => company.openJobs > 0)
    .slice(0, 12);

  return (
    <HomePage
      topCompanies={topCompanies}
      activeJobsCount={stats.activeJobs}
      companiesCount={stats.companies}
      jobsByCounty={jobsByCounty}
      jobsByFunction={jobsByFunction}
      jobsByIndustry={jobsByIndustry}
    />
  );
}
