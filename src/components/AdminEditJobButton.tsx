"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdminEditJobButtonProps {
  jobId: string;
  /** "card" = compact outline button; "page" = larger default button */
  variant?: "card" | "page";
}

/**
 * Renders an "Edit Job" button only when the logged-in user has admin role.
 * Checks user_roles table for 'admin' role.
 */
export function AdminEditJobButton({
  jobId,
  variant = "card",
}: AdminEditJobButtonProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (!cancelled) setIsAdmin(data?.role === "admin");
      } catch {
        // Silently fail — don't show button on error
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (!isAdmin) return null;

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
