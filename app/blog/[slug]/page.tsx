"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchPost = useCallback(async () => {
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
  }, [slug]);

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
            <Link href="/blog" prefetch={true}>
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

  const ogImageUrl = `https://www.careersasa.co.ke/api/og/blog/${slug}`;
  const pageUrl = `https://www.careersasa.co.ke/blog/${slug}`;

  return (
    <>
      <head>
        <title>{post.title} - CareerSasa Blog</title>
        <meta name="description" content={post.excerpt || post.title} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:image" content={ogImageUrl} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={post.excerpt || post.title} />
        <meta property="twitter:image" content={ogImageUrl} />
      </head>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <article className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/blog" prefetch={true}>
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

        <div className="richtext-content text-muted-foreground" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          <CommentsSection postId={post.id} />
        </div>
      </article>
    </div>
    </>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ name: '', email: '', comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.name || !newComment.email || !newComment.comment) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await (supabase as any)
        .from('blog_comments')
        .insert([{
          post_id: postId,
          author_name: newComment.name,
          author_email: newComment.email,
          content: newComment.comment,
          approved: false, // Comments need approval
        }]);

      if (error) throw error;
      
      toast.success('Comment submitted! It will appear after approval.');
      setNewComment({ name: '', email: '', comment: '' });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              value={newComment.name}
              onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={newComment.email}
              onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Comment *</label>
          <textarea
            value={newComment.comment}
            onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{comment.author_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
