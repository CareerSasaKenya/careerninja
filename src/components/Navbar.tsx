"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MobileNav from "./MobileNav";
import { useEffect, useCallback } from "react";

const Navbar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Use static branding values
  const siteName = "CareerSasa";
  const logoUrl = "/logo.png"; // Change this to your logo filename (e.g., "/logo.svg")

  // Close any open mobile menu when route changes
  useEffect(() => {
    // This will trigger on route changes to close mobile menu if open
    const closeEvent = new CustomEvent('close-mobile-menu');
    window.dispatchEvent(closeEvent);
  }, [pathname]);

  const handleSignOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Error signing out");
      } else {
        toast.success("Signed out successfully");
        router.push("/");
      }
    } catch (error) {
      console.debug('Error during sign out:', error);
      toast.error("Error signing out");
    }
  }, [router]);

  return (
    <nav className="border-b border-border/50 bg-card/80 sticky top-0 z-40 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 md:gap-4 group" prefetch={true}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={siteName}
              className="h-12 w-12 md:h-16 md:w-16 object-contain transition-all duration-300 group-hover:scale-105"
              onError={(e) => {
                // Handle image loading errors
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="p-2 md:p-2.5 rounded-xl bg-gradient-primary shadow-glow transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
              <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
          )}
          <span className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {siteName}
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/jobs" prefetch={true}>
            <Button variant="ghost">Browse Jobs</Button>
          </Link>
          <Link href="/blog" prefetch={true}>
            <Button variant="ghost">Blog</Button>
          </Link>
          <Link href="/services/linkedin" prefetch={true}>
            <Button variant="ghost">Boost Your LinkedIn</Button>
          </Link>
          <Link href="/services/cv" prefetch={true}>
            <Button variant="ghost">Power Your CV & Resume</Button>
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" prefetch={true}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
                className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth" prefetch={true}>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth" prefetch={true}>
                <Button variant="gradient" size="lg" className="hidden lg:flex">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;