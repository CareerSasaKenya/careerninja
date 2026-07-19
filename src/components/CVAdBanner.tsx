import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

/**
 * Inline promotional banner shown on job detail pages.
 * Encourages users to build a CV before applying.
 */
export default function CVAdBanner() {
  return (
    <div className="rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-orange-100 shrink-0">
          <FileText className="h-5 w-5 text-orange-600" />
        </div>
        <p className="min-w-0 text-sm font-semibold text-gray-900 leading-snug">
          Build your CV in minutes! Tailored for the Kenyan job market.
        </p>
      </div>
      <Link
        href="/dashboard/career-tools"
        className="self-start shrink-0 inline-flex w-auto items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-3 py-2 transition-colors sm:self-auto sm:px-4"
      >
        Build My CV
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
