"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MobileNav = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  // Use static branding values
  const siteName = "CareerSasa";
  const logoUrl = "/logo.png"; // Change this to your logo filename (e.g., "/logo.svg")

  // Listen for close event from Navbar
  useEffect(() => {
    const closeMenu = () => setOpen(false);
    window.addEventListener('close-mobile-menu', closeMenu);
    return () => window.removeEventListener('close-mobile-menu', closeMenu);
  }, []);

  const handleSignOut = async () => {
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
    setOpen(false);
  };

  const closeMenu = () => {
    try {
      setOpen(false);
    } catch (error) {
      console.debug('Error closing menu:', error);
    }
  };

  if (!open) {
    return (
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="fixed inset-0 bg-black/60" onClick={closeMenu} />
      <div className="fixed right-4 top-4 w-3/4 max-w-[300px] rounded-xl border border-border bg-background shadow-lg animate-in slide-in-from-right duration-300">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName}
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    // Handle image loading errors
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="p-1.5 rounded-lg bg-gradient-primary shadow-glow">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                {siteName}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeMenu} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex flex-col gap-1">
            <Link href="/jobs" onClick={closeMenu} prefetch={true}>
              <Button variant="ghost" className="w-full justify-start text-base">
                Browse Jobs
              </Button>
            </Link>
            <Link href="/blog" onClick={closeMenu} prefetch={true}>
              <Button variant="ghost" className="w-full justify-start text-base">
                Blog
              </Button>
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" onClick={closeMenu} prefetch={true}>
                  <Button variant="ghost" className="w-full justify-start text-base">
                    Dashboard
                  </Button>
                </Link>
                <div className="pt-3 mt-2 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-base hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 mt-2 border-t">
                <Link href="/auth" onClick={closeMenu} prefetch={true}>
                  <Button variant="ghost" className="w-full text-base mb-2">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth" onClick={closeMenu} prefetch={true}>
                  <Button variant="gradient" className="w-full text-base">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;