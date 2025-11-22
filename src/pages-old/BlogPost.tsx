import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  content: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  author_id: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      setPost(data);

      if (data?.category) {
        fetchRelatedPosts(data.category, data.id);
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category: string, currentPostId: string) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("category", category)
        .neq("id", currentPostId)
        .limit(3);

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error("Error fetching related posts:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Article not found</p>
          <div className="text-center mt-4">
            <Link to="/blog">
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
        <Link to="/blog">
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
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Author
            </div>
          </div>
        </header>

        <div className="prose prose-slate max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />


        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    {relatedPost.featured_image && (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {relatedPost.title}
                      </CardTitle>
                    </CardHeader>
                    {relatedPost.excerpt && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
