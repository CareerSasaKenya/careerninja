import HomePage from "@/components/HomePage";
import { getCompanyDirectoryData } from "@/lib/companyDirectory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const { industryCards, companies } = await getCompanyDirectoryData();

  const topIndustries = [...industryCards]
    .filter((industry) => industry.openJobs > 0)
    .sort(
      (a, b) =>
        b.openJobs - a.openJobs || a.name.localeCompare(b.name)
    )
    .slice(0, 6);

  const topCompanies = companies
    .filter((company) => company.openJobs > 0)
    .slice(0, 6);

  return (
    <HomePage topIndustries={topIndustries} topCompanies={topCompanies} />
  );
}
