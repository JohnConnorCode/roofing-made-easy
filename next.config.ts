import type { NextConfig } from "next";

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
            value: 'camera=(), microphone=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
