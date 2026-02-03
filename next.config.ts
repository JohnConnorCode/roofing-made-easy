import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // County roofing pages: /lee-county-roofing -> /county/lee
      // Must come before city pattern to avoid matching "lee-county" as a city
      {
        source: '/:county(\\w+)-county-roofing',
        destination: '/county/:county',
      },
      // City roofing pages: /tupelo-roofing -> /city/tupelo
      {
        source: '/:city(\\w+)-roofing',
        destination: '/city/:city',
      },
      // Comparison pages: /best-roofers-in-tupelo-ms -> /compare/tupelo/ms
      {
        source: '/best-roofers-in-:city(\\w+)-:state(\\w+)',
        destination: '/compare/:city/:state',
      },
      // Service-city pages: /roof-replacement-tupelo-ms -> /service-city/roof-replacement/tupelo
      {
        source: '/:service([\\w-]+)-:city(\\w+)-ms',
        destination: '/service-city/:service/:city',
      },
    ];
  },
  async headers() {
    // Build CSP directives - sanitize URL to prevent invalid header characters
    // HTTP headers cannot contain control characters (0x00-0x1F, 0x7F)
    const sanitizeForHeader = (str: string) => str.trim().replace(/[\x00-\x1F\x7F\r\n]/g, '')
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://*.supabase.co'
    const supabaseUrl = sanitizeForHeader(rawSupabaseUrl)
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://vercel.live`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data: blob: ${supabaseUrl} https://*.unsplash.com https://*.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `connect-src 'self' ${supabaseUrl} wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com https://vercel.live`,
      `frame-src 'self' https://js.stripe.com https://hooks.stripe.com`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].map(sanitizeForHeader)

    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives.join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
export default process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
