import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { Rocket, Eye, Lightbulb, TrendingUp, Users, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Mission - Enriching Careers Across Kenya | CareerSasa",
  description: "Discover CareerSasa's mission to transform Kenya's job market by connecting talent with opportunity, fostering career growth, and empowering both job seekers and employers.",
};

export default function MissionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <MobileNav />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Our Mission
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Enrich Your Career Now - Empowering Kenya&apos;s Workforce
            </p>
          </div>

          {/* Mission Statement */}
          <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 md:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">Our Core Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              To revolutionize Kenya&apos;s job market by creating a transparent, efficient, and inclusive platform that connects talented professionals with meaningful career opportunities, while empowering employers to build exceptional teams.
            </p>
          </section>

          {/* Vision */}
          <section className="bg-card border border-border rounded-lg p-8 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We envision a Kenya where every professional has access to opportunities that match their skills and aspirations, and where every employer can effortlessly find the right talent to drive their business forward. CareerSasa aims to be the catalyst that transforms career journeys and organizational success stories across the nation.
            </p>
          </section>

          {/* What Drives Us */}
          <section>
            <h2 className="text-3xl font-bold text-primary text-center mb-8">What Drives Us</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Innovation in Job Matching</h3>
                <p className="text-muted-foreground">
                  We leverage cutting-edge technology and data-driven insights to create smarter connections between candidates and opportunities, reducing time-to-hire and improving placement quality.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Career Development</h3>
                <p className="text-muted-foreground">
                  Beyond job listings, we provide resources, career tips, and industry insights to help professionals continuously grow and advance in their chosen fields.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Inclusive Access</h3>
                <p className="text-muted-foreground">
                  We believe opportunity should be accessible to all. Our platform is designed to serve professionals across all industries, experience levels, and backgrounds throughout Kenya.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Employer Success</h3>
                <p className="text-muted-foreground">
                  We partner with employers to understand their unique needs and provide tools that streamline recruitment, saving time and resources while improving hiring outcomes.
                </p>
              </div>
            </div>
          </section>

          {/* Our Commitments */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-primary text-center">Our Commitments</h2>
            <div className="grid gap-4">
              <div className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary p-6 rounded-r-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">To Job Seekers</h3>
                <p className="text-muted-foreground">
                  We commit to providing genuine job opportunities, protecting your data, and offering tools and resources that support your career growth at every stage.
                </p>
              </div>

              <div className="bg-gradient-to-r from-secondary/5 to-transparent border-l-4 border-secondary p-6 rounded-r-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">To Employers</h3>
                <p className="text-muted-foreground">
                  We commit to delivering qualified candidates, maintaining platform quality, and providing exceptional support to make your recruitment process efficient and successful.
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary p-6 rounded-r-lg">
                <h3 className="text-lg font-semibold text-foreground mb-2">To Our Community</h3>
                <p className="text-muted-foreground">
                  We commit to fostering a respectful, transparent, and supportive ecosystem where all stakeholders can thrive and contribute to Kenya&apos;s economic growth.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">Join Us in Our Mission</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re looking to enrich your career or find exceptional talent, CareerSasa is your partner in success. Together, we&apos;re building a brighter future for Kenya&apos;s workforce.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
