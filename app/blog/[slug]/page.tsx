"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast.error("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, fetchPost]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center mb-4">Article not found</p>
          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/blog">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-6"
          />
        )}

        <header className="mb-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            {post.category && (
              <Badge variant="secondary">{post.category}</Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Author
            </div>
          </div>
        </header>

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}
