import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { Providers } from "./providers";
import { NavigationEvents } from "@/components/NavigationEvents";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = 'https://careersasa.co.ke';
  const defaultImage = `${siteUrl}/og-image.svg`;
  
  return {
    title: "CareerSasa - Find Your Dream Job",
    description: "Discover the latest job opportunities in Kenya. Connect with top employers and advance your career.",
    keywords: "jobs, careers, Kenya, employment, job search",
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      title: "CareerSasa - Find Your Dream Job",
      description: "Discover the latest job opportunities in Kenya. Connect with top employers and advance your career.",
      url: siteUrl,
      siteName: 'CareerSasa',
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: 'CareerSasa - Find Your Dream Job in Kenya',
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: "CareerSasa - Find Your Dream Job",
      description: "Discover the latest job opportunities in Kenya. Connect with top employers and advance your career.",
      images: [defaultImage],
    },
  };
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
        <Providers>
          {children}
          <Suspense fallback={null}>
            <NavigationEvents />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}