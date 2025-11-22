"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, featured_image, excerpt, category, tags, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">Career Blog</h1>
          <p className="text-muted-foreground text-xl">
            Latest career insights, job market trends, and company updates
          </p>
        </header>

        <div className="mb-10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category as string)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading articles...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-semibold mb-2">No articles found</p>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-56 object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.category && (
                        <Badge variant="secondary">{post.category}</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      {new Date(post.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  {post.excerpt && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
