"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    featured_image: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean) : null,
        author_id: user?.id,
      };

      const { error } = await supabase
        .from("blog_posts")
        .insert([postData]);
      
      if (error) throw error;
      toast.success("Blog post created successfully!");
      router.push("/blog");
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error("Failed to create blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Blog Post</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value, slug: formData.slug || generateSlug(e.target.value)})}
                  placeholder="Enter blog post title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief summary"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({...formData, content: value})}
                  placeholder="Write your blog post content..."
                  className="min-h-[300px]"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Post"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push("/blog")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
