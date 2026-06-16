import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to subscribe");
        return;
      }
      if (data.already_subscribed) {
        toast.info(data.message);
      } else {
        toast.success("Check your email to confirm your subscription!");
      }
      setEmail("");
    } catch {
      toast.error("Error subscribing to updates");
    } finally {
      setSubscribing(false);
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
                disabled={subscribing}
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
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
                  <Link href="/newsletter" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Career Tips
                  </Link>
                </li>
                <li>
                  <Link href="/services/linkedin" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    LinkedIn Services
                  </Link>
                </li>
                <li>
                  <Link href="/services/cv" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    CV Services
                  </Link>
                </li>
                <li>
                  <Link href="/services/cover-letter" className="text-muted-foreground hover:text-foreground transition-colors" prefetch={true}>
                    Cover Letter Services
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
                    href="https://www.facebook.com/CareerSasa"
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
                    href="https://www.linkedin.com/company/careersasa-jobs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
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