"use client";

// Simplified edit page - redirects to create for now
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EditBlogPostPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/blog/create");
  }, [router]);

  return <div>Redirecting...</div>;
}
