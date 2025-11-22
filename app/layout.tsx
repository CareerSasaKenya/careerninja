import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { Providers } from "./providers";
import { supabase } from "@/integrations/supabase/client";

const inter = Inter({ subsets: ["latin"] });

async function getBranding() {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .single();
    return data;
  } catch (error) {
    console.debug('Error fetching branding:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const branding = await getBranding();
    
    return {
      title: `${branding?.site_name || "CareerSasa"} - Find Your Dream Job`,
      description: "Discover the latest job opportunities in Kenya. Connect with top employers and advance your career.",
      keywords: "jobs, careers, Kenya, employment, job search",
      icons: {
        icon: branding?.favicon_url || '/favicon.ico',
      },
    };
  } catch (error) {
    console.debug('Error generating metadata:', error);
    return {
      title: "CareerSasa - Find Your Dream Job",
      description: "Discover the latest job opportunities in Kenya. Connect with top employers and advance your career.",
      keywords: "jobs, careers, Kenya, employment, job search",
      icons: {
        icon: '/favicon.ico',
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}