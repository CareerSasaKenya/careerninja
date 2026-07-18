/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qxuvqrfqkdpfjfwkqatf.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 't1.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
    ],
  },
  // PDF parsing (server-only). Keep canvas external so the native binary
  // is available at runtime on Vercel (needed for pdfjs DOMMatrix polyfill).
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
  // Ensure native canvas binaries are traced into serverless functions that
  // may parse PSC PDFs (process routes). Discover no longer loads pdf-parse.
  outputFileTracingIncludes: {
    '/api/admin/scraper-sources/**/*': [
      './node_modules/@napi-rs/canvas/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-gnu/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-musl/**/*',
    ],
    '/api/cron/scrape-process/**/*': [
      './node_modules/@napi-rs/canvas/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-gnu/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-musl/**/*',
    ],
    '/api/scrape-jobs/**/*': [
      './node_modules/@napi-rs/canvas/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-gnu/**/*',
      './node_modules/@napi-rs/canvas-linux-x64-musl/**/*',
    ],
  },
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