import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

const Blog = () => {
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
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
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
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 md:mb-12 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-primary bg-clip-text text-transparent px-4">Career Blog</h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto px-4">
            Latest career insights, job market trends, and company updates
          </p>
        </header>

        <div className="mb-8 md:mb-10 flex flex-col sm:flex-row gap-3 md:gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 md:pl-12 h-11 md:h-12 text-base rounded-xl border-2"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="lg"
              className="text-sm md:text-base"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category as string)}
                size="lg"
                className="text-sm md:text-base"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="inline-flex p-6 rounded-full bg-muted mb-6 animate-pulse">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-xl text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-32 animate-fade-in">
            <div className="inline-flex p-6 rounded-full bg-muted mb-6">
              <Search className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mb-2">No articles found</p>
            <p className="text-muted-foreground text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up">
            {filteredPosts.map((post, index) => (
              <Link key={post.id} to={`/blog/${post.slug}`} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                <Card className="group h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden border-border/50 hover:border-primary/50">
                  {post.featured_image && (
                    <div className="relative overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.category && (
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      )}
                      {post.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  {post.excerpt && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
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
};

export default Blog;
