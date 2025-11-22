"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFavicon } from "@/hooks/useFavicon";

interface BrandingSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
}

interface BrandingContextType {
  branding: BrandingSettings | null;
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply favicon whenever branding changes
  useFavicon(branding?.favicon_url);

  const hexToHSL = (hex: string) => {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const fetchBranding = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (!error && data) {
        // Only update branding if it's different to avoid infinite loops
        setBranding(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data)) {
            return prev;
          }
          return data;
        });
        
        // Apply CSS variables for colors
        if (typeof document !== "undefined") {
          try {
            const primaryHSL = hexToHSL(data.primary_color);
            const secondaryHSL = hexToHSL(data.secondary_color);
            
            document.documentElement.style.setProperty("--primary", primaryHSL);
            document.documentElement.style.setProperty("--secondary", secondaryHSL);
            
            // Update gradients
            const gradientPrimary = `linear-gradient(135deg, ${data.primary_color}, ${data.secondary_color})`;
            document.documentElement.style.setProperty("--gradient-primary", gradientPrimary);
            document.documentElement.style.setProperty("--gradient-hero", gradientPrimary);
          } catch (error) {
            console.debug('Error applying CSS variables:', error);
          }
        }
      }
    } catch (error) {
      console.debug('Error fetching branding:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();

    // Subscribe to changes with better error handling
    try {
      const channel = supabase
        .channel("site_settings_changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "site_settings",
          },
          (payload) => {
            console.log("Branding settings updated:", payload);
            fetchBranding();
          }
        )
        .subscribe((status) => {
          console.log("Real-time subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to branding changes");
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to branding changes");
          }
        });

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.debug('Error removing branding channel:', error);
        }
      };
    } catch (error) {
      console.debug('Error setting up branding subscription:', error);
    }
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};