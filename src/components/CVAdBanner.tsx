import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

/**
 * Inline promotional banner shown on job detail pages.
 * Encourages users to build a CV before applying.
 */
export default function CVAdBanner() {
  return (
    <div className="rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-orange-100 shrink-0">
          <FileText className="h-5 w-5 text-orange-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Stand out with a professional CV
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            Build a job-ready CV in minutes using our free templates — tailored for the Kenyan job market.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/career-tools"
        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
      >
        Build My CV
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
