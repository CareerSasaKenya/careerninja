"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "ejumakona@gmail.com";

interface AdminEditJobButtonProps {
  jobId: string;
  /** "card" = compact outline button; "page" = larger default button */
  variant?: "card" | "page";
}

/**
 * Renders an "Edit Job" button only when the logged-in user is the site admin.
 * Safe to drop into any client or server-rendered page.
 */
export function AdminEditJobButton({
  jobId,
  variant = "card",
}: AdminEditJobButtonProps) {
  const { user } = useAuth();

  // Only show for logged-in admin
  if (
    !user?.email ||
    user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {
    return null;
  }

  if (variant === "page") {
    return (
      <Link href={`/post-job/${jobId}`} prefetch={true}>
        <Button size="sm" className="gap-1.5">
          <Edit className="h-4 w-4" />
          Edit This Job
        </Button>
      </Link>
    );
  }

  return (
    <Link href={`/post-job/${jobId}`} prefetch={true}>
      <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
        <Edit className="h-3 w-3" />
        Edit
      </Button>
    </Link>
  );
}
