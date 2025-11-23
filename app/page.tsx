"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, ArrowRight, Clock, MapPin, Building2, CheckCircle2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Images are now in public folder

export default function Home() {
  // Fetch featured jobs (most recent 6)
  const { data: featuredJobs = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch latest jobs (most recent 6, different from featured)
  const { data: latestJobs = [], isLoading: loadingLatest } = useQuery({
    queryKey: ["latest-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("date_posted", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent blog posts
  const { data: blogPosts = [] } = useQuery({
    queryKey: ["recent-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <Navbar />
      
      {/* Hero Section with Image */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto grid lg:grid-cols-2 gap-8 items-center py-16 md:py-24 px-4">
          <div className="animate-fade-in z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Your Dream Career<br />Starts Here
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Join thousands of Kenyan professionals who've found their perfect role. Connect with top employers and unlock your potential.
            </p>
            
            {/* Search Bar */}
            <div className="glass p-6 rounded-2xl mb-6 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Job title or keyword"
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Location"
                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button variant="gradient" size="lg" className="sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Search Jobs
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">850+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-3xl blur-3xl"></div>
            <img 
              src="/assets/hero-professional.jpg" 
              alt="Professional Kenyan Business Woman" 
              className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Featured Jobs Carousel */}
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured Opportunities</h2>
              <p className="text-muted-foreground">Hand-picked roles from top employers</p>
            </div>
            <Link href="/jobs" prefetch={true}>
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="text-center py-12">Loading featured jobs...</div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredJobs.map((job) => (
                  <CarouselItem key={job.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="glass hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className="bg-gradient-primary text-primary-foreground">Featured</Badge>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary && (
                          <div className="text-primary font-semibold mb-4">{job.salary}</div>
                        )}
                        <Link href={`/jobs/${job.id}`} prefetch={true}>
                          <Button className="w-full" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </div>
      </section>

      {/* Why Choose Us - Checklist Style */}
      <section className="py-16 px-4">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Kenyan Professionals Choose CareerSasa</h2>
            <div className="space-y-4">
              {[
                "Access to 2,500+ verified job opportunities across Kenya",
                "Direct connections with 850+ top-tier employers",
                "Smart job matching based on your skills and experience",
                "Real-time notifications for new opportunities",
                "Free career resources and interview preparation",
                "Dedicated support from our Kenyan team",
                "95% of users find their ideal role within 3 months",
                "Zero spam - only relevant, quality job listings"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/jobs" prefetch={true}>
                <Button variant="gradient" size="lg">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-secondary opacity-10 rounded-3xl blur-3xl"></div>
            <img 
              src="/assets/team-collaboration.jpg" 
              alt="Kenyan Professionals Collaborating" 
              className="relative rounded-3xl shadow-2xl w-full h-[600px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials from Kenyans */}
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Success Stories from Kenyans</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Hear from professionals who transformed their careers with CareerSasa
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "David Kamau",
                role: "Software Developer at Safaricom",
                image: "/assets/testimonial-1.jpg",
                quote: "I landed my dream role at Safaricom within two weeks of signing up. The job matching was incredibly accurate!"
              },
              {
                name: "Grace Wanjiru",
                role: "Marketing Manager at KCB",
                image: "/assets/testimonial-2.jpg",
                quote: "CareerSasa connected me with opportunities I never knew existed. Now I'm leading marketing at one of Kenya's top banks."
              },
              {
                name: "Brian Ochieng",
                role: "Data Analyst at Equity Bank",
                image: "/assets/testimonial-3.jpg",
                quote: "The platform is so easy to use, and the job quality is exceptional. I got three interview offers in my first month!"
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Latest Job Openings</h2>
              <p className="text-muted-foreground">Fresh opportunities posted today</p>
            </div>
            <Link href="/jobs" prefetch={true}>
              <Button variant="outline">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingLatest ? (
            <div className="text-center py-12">Loading latest jobs...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <Card key={job.id} className="glass hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary">New</Badge>
                      <span className="text-xs text-muted-foreground">Just posted</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{job.title}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="text-primary font-semibold mb-4">{job.salary}</div>
                    )}
                    <Link href={`/jobs/${job.id}`} prefetch={true}>
                      <Button className="w-full">
                        Apply Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Success Stories with Images */}
      <section className="py-16 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Transforming Careers Across Kenya</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass overflow-hidden hover:shadow-xl transition-all duration-300">
              <img 
                src="/assets/success-story-1.jpg" 
                alt="Success Story"
                className="w-full h-64 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3">From Graduate to Senior Manager</h3>
                <p className="text-muted-foreground mb-4">
                  &quot;I started as a fresh graduate and within 3 years, CareerSasa helped me progress to a senior management role. The opportunities here are unmatched.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary"></div>
                  <div>
                    <div className="font-semibold">Sarah Njeri</div>
                    <div className="text-sm text-muted-foreground">Senior Manager, NCBA Bank</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden hover:shadow-xl transition-all duration-300">
              <img 
                src="/assets/success-story-2.jpg" 
                alt="Success Story"
                className="w-full h-64 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3">Career Change Made Easy</h3>
                <p className="text-muted-foreground mb-4">
                  &quot;I transitioned from finance to tech with confidence, thanks to the diverse opportunities on CareerSasa. The platform truly understands career growth.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-secondary"></div>
                  <div>
                    <div className="font-semibold">Michael Otieno</div>
                    <div className="text-sm text-muted-foreground">Tech Lead, Andela Kenya</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Highlights */}
      {blogPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Career Insights & Tips</h2>
                <p className="text-muted-foreground">Expert advice to boost your career</p>
              </div>
              <Link href="/blog" prefetch={true}>
                <Button variant="outline">
                  Read More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} prefetch={true}>
                  <Card className="glass hover:shadow-xl transition-all duration-300 hover:scale-105 h-full">
                    {post.featured_image && (
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                    )}
                    <CardContent className="p-6">
                      {post.category && (
                        <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                      )}
                      <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of Kenyan professionals who've found their dream jobs through CareerSasa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs" prefetch={true}>
              <Button size="lg" variant="secondary" className="text-lg px-10">
                <Search className="mr-2 h-5 w-5" />
                Find Your Dream Job
              </Button>
            </Link>
            <Link href="/post-job" prefetch={true}>
              <Button size="lg" variant="outline" className="text-lg px-10 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                <Briefcase className="mr-2 h-5 w-5" />
                Post a Job Opening
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}