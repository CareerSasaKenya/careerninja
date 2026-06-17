"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  reading_time: number | null;
}

function estimateReadingTime(text: string): number {
  const words = text.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    }>
      <BlogPageInner />
    </Suspense>
  );
}

function BlogPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlCategory = searchParams?.get("category") || null;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(urlCategory);

  // Sync URL category with state
  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Filter: only show published posts (gracefully handle missing status column)
      const published = (data || []).filter((p: any) => !p.status || p.status === "published");
      // Compute reading_time client-side if not set
      const enriched = published.map((p: any) => ({
        ...p,
        reading_time: p.reading_time ?? estimateReadingTime(p.content || ""),
        content: undefined,
      }));
      setPosts(enriched);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));
  const featuredPost = filteredPosts.length > 0 && !searchTerm && !selectedCategory ? filteredPosts[0] : null;
  const restPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container mx-auto px-4 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <BookOpen className="h-4 w-4" />
                CareerSasa Blog
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                Insights That{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Move Your Career
                </span>{" "}
                Forward
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Expert career advice, job market analysis, and insider tips from top employers — all in one place.
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles by topic, title, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-14 text-base rounded-xl bg-background/80 backdrop-blur border-border/60 shadow-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills */}
        {categories.length > 0 && (
          <section className="border-b border-border/40 bg-card/40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                  Browse:
                </span>
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedCategory(null); router.push("/blog", { scroll: false }); }}
                  className="rounded-full shrink-0"
                >
                  All Posts
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setSelectedCategory(category as string); router.push(`/blog?category=${encodeURIComponent(category as string)}`, { scroll: false }); }}
                    className="rounded-full shrink-0"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">No articles found</h2>
              <p className="text-muted-foreground mb-6">Try adjusting your search or category filters</p>
              <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory(null); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Post (first post, full-width) */}
              {featuredPost && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Featured</span>
                  </div>
                  <Link href={`/blog/${featuredPost.slug}`} prefetch={true}>
                    <article className="group grid md:grid-cols-2 gap-6 md:gap-10 rounded-2xl border border-border/60 bg-card hover:shadow-2xl hover:border-primary/20 transition-all duration-300 overflow-hidden">
                      <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                        {featuredPost.featured_image ? (
                          <img
                            src={featuredPost.featured_image}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <BookOpen className="h-16 w-16 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center py-6 pr-8">
                        {featuredPost.category && (
                          <Badge variant="secondary" className="w-fit mb-3">
                            {featuredPost.category}
                          </Badge>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                        {featuredPost.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-3 text-base leading-relaxed">
                            {featuredPost.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                          <span>{new Date(featuredPost.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {featuredPost.reading_time} min read
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                          Read article <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </div>
              )}

              {/* Rest of the posts in a grid */}
              {restPosts.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {restPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} prefetch={true}>
                      <article className="group h-full rounded-xl border border-border/60 bg-card hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                        {/* Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          {post.featured_image ? (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                              <BookOpen className="h-10 w-10 text-primary/15" />
                            </div>
                          )}
                          {post.category && (
                            <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur text-foreground border-0 text-xs">
                              {post.category}
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 p-5">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed flex-1">
                              {post.excerpt}
                            </p>
                          )}
                          {!post.excerpt && <div className="flex-1" />}
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                            <span>
                              {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time} min
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
