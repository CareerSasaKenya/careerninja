"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Gift, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STORAGE_KEY = "careersasa_popup_dismissed";
const SUBSCRIBED_KEY = "careersasa_subscribed";
const SHOW_DELAY_MS = 45_000; // Show after 45 seconds if no exit intent

export function LeadMagnetPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  const shouldShow = useCallback(() => {
    if (typeof window === "undefined") return false;
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) return false;
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (dismissed) {
        const dismissedAt = parseInt(dismissed, 10);
        // Don't show again for 7 days after dismissal
        if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const open = useCallback(() => {
    if (!hasBeenShown && shouldShow()) {
      setIsOpen(true);
      setHasBeenShown(true);
    }
  }, [hasBeenShown, shouldShow]);

  const close = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch { /* ignore */ }
  }, []);

  // Exit intent detection (desktop: mouse leaves viewport from top)
  useEffect(() => {
    if (!shouldShow()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasBeenShown) {
        open();
      }
    };

    // Timer fallback for mobile (no exit intent possible)
    const timer = setTimeout(() => {
      if (!hasBeenShown) open();
    }, SHOW_DELAY_MS);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [hasBeenShown, open, shouldShow]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      if (data.already_subscribed) {
        toast.info(data.message);
      } else {
        toast.success("Check your inbox to confirm and get your free toolkit!");
      }

      setIsSuccess(true);
      try { localStorage.setItem(SUBSCRIBED_KEY, "true"); } catch { /* ignore */ }

      // Auto-close after 4 seconds
      setTimeout(() => close(), 4000);
    } catch {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success State */
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Almost There!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Check your inbox for the confirmation email.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Once confirmed, your free toolkit download link will be in the same email.
            </p>
          </div>
        ) : (
          <>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-[#0A66C2] to-[#0077B5] px-8 pt-8 pb-6 text-white text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-4">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Free: The Kenyan Job Seeker&apos;s Toolkit
              </h2>
              <p className="text-blue-100 text-sm">
                Join 1,000+ Kenyan professionals getting weekly jobs, salary insights, and free career tools.
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                What you get inside:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Professional CV template (ATS-friendly)",
                  "Cover letter template that gets read",
                  "Interview prep checklist",
                  "Salary negotiation script",
                  "Weekly job picks before anyone else",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                  autoFocus
                />
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-[#0A66C2] hover:bg-[#004182] text-white"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Get My Free Toolkit"
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
                100% free. Unsubscribe anytime. No spam.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
