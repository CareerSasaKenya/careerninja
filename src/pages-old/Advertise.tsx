import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Users, Target, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Advertise() {
  return (
    <>
      <Helmet>
        <title>Advertise With Us - Reach Top Talent in Kenya | CareerSasa</title>
        <meta name="description" content="Partner with CareerSasa to advertise your jobs to thousands of qualified professionals across Kenya. Flexible packages, targeted reach, and proven results." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <MobileNav />
        
        <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Advertise With CareerSasa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Connect with Kenya's Top Talent - Maximize Your Recruitment ROI
              </p>
            </div>

            {/* Why Advertise */}
            <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 md:p-12">
              <h2 className="text-3xl font-bold text-primary text-center mb-8">Why Advertise With Us?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">10,000+</h3>
                  <p className="text-sm text-muted-foreground">Active Job Seekers</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">85%</h3>
                  <p className="text-sm text-muted-foreground">Match Success Rate</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">500+</h3>
                  <p className="text-sm text-muted-foreground">Partner Companies</p>
                </div>

                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <BarChart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">14 Days</h3>
                  <p className="text-sm text-muted-foreground">Avg. Time to Hire</p>
                </div>
              </div>
            </section>

            {/* Advertising Packages */}
            <section>
              <h2 className="text-3xl font-bold text-primary text-center mb-8">Advertising Packages</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Basic Package */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Basic</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">KSh 5,000</span>
                      <span className="text-muted-foreground">/post</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">30-day job listing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Basic job visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Email notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Application tracking</span>
                    </li>
                  </ul>

                  <Link to="/post-job">
                    <Button className="w-full" variant="outline">Get Started</Button>
                  </Link>
                </div>

                {/* Premium Package */}
                <div className="bg-card border-2 border-primary rounded-lg p-6 space-y-6 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">KSh 12,000</span>
                      <span className="text-muted-foreground">/post</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">60-day job listing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Featured placement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Priority in search</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Social media promotion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Advanced analytics</span>
                    </li>
                  </ul>

                  <Link to="/post-job">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>

                {/* Enterprise Package */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">Custom</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Unlimited job postings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Custom branding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Candidate sourcing</span>
                    </li>
                  </ul>

                  <Link to="/contact">
                    <Button className="w-full" variant="outline">Contact Sales</Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Additional Services */}
            <section className="bg-card border border-border rounded-lg p-8 space-y-6">
              <h2 className="text-3xl font-bold text-primary text-center">Additional Services</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Banner Advertising</h3>
                  <p className="text-muted-foreground">
                    Increase brand visibility with strategically placed banner ads across our platform. Perfect for employer branding and recruitment campaigns.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Email Campaigns</h3>
                  <p className="text-muted-foreground">
                    Reach our entire database of qualified job seekers with targeted email campaigns. High open rates and excellent conversion.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">Company Profile Pages</h3>
                  <p className="text-muted-foreground">
                    Create a dedicated company profile to showcase your culture, values, and open positions. Build your employer brand.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">CV Database Access</h3>
                  <p className="text-muted-foreground">
                    Search our extensive database of qualified candidates. Proactively recruit top talent even before they apply.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 text-center space-y-4">
              <h2 className="text-3xl font-bold text-primary">Ready to Get Started?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of companies already finding top talent on CareerSasa. Post your first job today or contact our sales team for a custom package.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/post-job">
                  <Button size="lg" className="min-w-[200px]">Post a Job</Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="min-w-[200px]">Contact Sales</Button>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
