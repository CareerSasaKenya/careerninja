import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { Building2, Users, Target, Heart } from "lucide-react";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About CareerSasa - Kenya's Premier Job Portal</title>
        <meta name="description" content="Learn about CareerSasa, Kenya's leading job portal connecting talented professionals with top employers across the country. Discover our story, mission, and commitment to enriching careers." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <MobileNav />
        
        <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                About CareerSasa
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Kenya's Premier Job Portal - Connecting Talent with Opportunity
              </p>
            </div>

            {/* Our Story */}
            <section className="prose prose-lg max-w-none">
              <div className="bg-card border border-border rounded-lg p-8 space-y-4">
                <h2 className="text-3xl font-bold text-primary">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed">
                  CareerSasa was founded with a simple yet powerful vision: to transform the job market in Kenya by creating meaningful connections between talented professionals and forward-thinking employers. We recognized that finding the right job or the right candidate shouldn't be a struggle—it should be an empowering journey.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Since our launch, we've grown to become Kenya's most trusted job portal, serving thousands of job seekers and hundreds of employers across diverse industries. Our platform combines cutting-edge technology with deep understanding of the local job market to deliver results that matter.
                </p>
              </div>
            </section>

            {/* Core Values */}
            <section>
              <h2 className="text-3xl font-bold text-primary text-center mb-8">Our Core Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Excellence</h3>
                  <p className="text-muted-foreground">
                    We strive for excellence in everything we do, from our platform's user experience to the quality of opportunities we present.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Community</h3>
                  <p className="text-muted-foreground">
                    We believe in building a supportive community where job seekers and employers can thrive together.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Integrity</h3>
                  <p className="text-muted-foreground">
                    Trust is the foundation of our platform. We maintain the highest standards of honesty and transparency.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Innovation</h3>
                  <p className="text-muted-foreground">
                    We continuously evolve our platform with the latest technology to provide the best experience.
                  </p>
                </div>
              </div>
            </section>

            {/* What We Do */}
            <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 space-y-6">
              <h2 className="text-3xl font-bold text-primary text-center">What We Do</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">10,000+</div>
                  <p className="text-muted-foreground">Active Job Seekers</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">500+</div>
                  <p className="text-muted-foreground">Partner Companies</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-primary">1,000+</div>
                  <p className="text-muted-foreground">Jobs Posted Monthly</p>
                </div>
              </div>
            </section>

            {/* Our Commitment */}
            <section className="bg-card border border-border rounded-lg p-8 space-y-4">
              <h2 className="text-3xl font-bold text-primary">Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                At CareerSasa, we're committed to enriching careers across Kenya. Whether you're a job seeker looking for your next opportunity or an employer searching for top talent, we're here to make the process seamless, efficient, and successful.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We invest in understanding industry trends, employer needs, and candidate aspirations to ensure our platform serves as the bridge that connects ambition with opportunity.
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
