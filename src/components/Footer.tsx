import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (email) {
        toast.success("Successfully subscribed to career updates!");
        setEmail("");
      } else {
        toast.error("Please enter a valid email address");
      }
    } catch (error) {
      console.debug('Error during subscription:', error);
      toast.error("Error subscribing to updates");
    }
  };

  return (
    <footer className="w-full bg-background border-t border-border/40 mt-auto">
      {/* Section 1: Subscribe */}
      <div className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Subscribe & Enrich Your Career Now!
            </h2>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 text-base"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Section 2: Footer Columns */}
      <div className="w-full py-12 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
            {/* Column 1: About Us */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">About Us</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    About CareerSasa
                  </Link>
                </li>
                <li>
                  <Link href="/mission" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Mission
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/advertise" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Advertise With Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: For Job Seekers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">For Job Seekers</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/job-alerts" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Job Alerts
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Career Tips
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: For Employers */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">For Employers</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/post-job" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Employer Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Socials */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Follow Us</h3>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                    TikTok
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Legal</h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Bottom Bar */}
      <div className="w-full py-6 bg-muted/30 border-t border-border/40">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 CareerSasa — Enrich Your Career Now!
          </p>
        </div>
      </div>
    </footer>
  );
}