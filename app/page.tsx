import HomePage from "@/components/HomePage";
import {
  getCompanyDirectoryData,
  getHomepageStats,
} from "@/lib/companyDirectory";
import { getActiveJobsByCounty } from "@/lib/jobsByCounty";
import { getActiveJobsByFunction } from "@/lib/jobsByFunction";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [
    { industryCards, companies },
    stats,
    jobsByCounty,
    jobsByFunction,
  ] = await Promise.all([
    getCompanyDirectoryData(),
    getHomepageStats(),
    getActiveJobsByCounty(),
    getActiveJobsByFunction(),
  ]);

  const topIndustries = [...industryCards]
    .filter((industry) => industry.openJobs > 0)
    .sort(
      (a, b) =>
        b.openJobs - a.openJobs || a.name.localeCompare(b.name)
    )
    .slice(0, 6);

  const topCompanies = companies
    .filter((company) => company.openJobs > 0)
    .slice(0, 12);

  return (
    <HomePage
      topIndustries={topIndustries}
      topCompanies={topCompanies}
      activeJobsCount={stats.activeJobs}
      companiesCount={stats.companies}
      jobsByCounty={jobsByCounty}
      jobsByFunction={jobsByFunction}
    />
  );
}
