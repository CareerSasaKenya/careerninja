/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qxuvqrfqkdpfjfwkqatf.supabase.co',
      },
    ],
  },
  // Enable React strict mode
  reactStrictMode: true,
  // Disable x-powered-by header
  poweredByHeader: false,
  // Add empty turbopack config to resolve conflict
  turbopack: {},
  // Exclude old pages from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  // Handle trailing slashes consistently
  trailingSlash: false,
  // Skip trailing slash redirect for better compatibility
  skipTrailingSlashRedirect: false,
  // Add headers to prevent Facebook WebView caching issues
  async headers() {
    return [
      {
        source: '/jobs/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'Vary',
            value: 'User-Agent',
          },
        ],
      },
    ];
  },
}

export default nextConfig;