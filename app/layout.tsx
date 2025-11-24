import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { Providers } from "./providers";
import { NavigationEvents } from "@/components/NavigationEvents";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = 'https://careersasa.com';
  const defaultTitle = "CareerSasa – Your Career Starts Sasa";
  const defaultDescription = "Discover the latest job opportunities in Kenya. Connect with top employers and advance your career with CareerSasa.";
  const defaultImage = `${siteUrl}/api/og/default`;

  return {
    title: {
      default: defaultTitle,
      template: "%s | CareerSasa"
    },
    description: defaultDescription,
    keywords: "jobs, careers, Kenya, employment, job search, career opportunities, Kenyan jobs",
    authors: [{ name: "CareerSasa" }],
    creator: "CareerSasa",
    publisher: "CareerSasa",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      }
    },
    alternates: {
      canonical: siteUrl
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: siteUrl,
      siteName: 'CareerSasa',
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: 'CareerSasa – Your Career Starts Sasa',
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
      images: [defaultImage],
      creator: '@careersasa',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    metadataBase: new URL(siteUrl),
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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="canonical" href="https://careersasa.com" />
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