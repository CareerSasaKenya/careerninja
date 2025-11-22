"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { Footer } from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    try {
      return new QueryClient();
    } catch (error) {
      console.debug('Error creating QueryClient:', error);
      return new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrandingProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {children}
              <Footer />
              <WhatsAppButton />
            </TooltipProvider>
          </AuthProvider>
        </BrandingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}