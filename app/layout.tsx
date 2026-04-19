import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LocalBusinessSchema } from "@/components/seo/json-ld";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/advanced-schema";
import {
  ServiceAreaSchema,
  ProfessionalCredentialsSchema,
  BrandSameAsSchema,
  ServiceAreaGeoSchema,
} from "@/components/seo/regional-schema";
import { MinimalNAPSchema } from "@/components/seo/nap-schema";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getBusinessConfigFromDB } from "@/lib/config/business-loader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.smartroofpricing.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c9a25c" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0f14" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getBusinessConfigFromDB();
  const city = config.address.city;
  const stateCode = config.address.stateCode;
  const region = config.serviceArea.region;
  const name = config.name;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: `${name} | ${city} ${stateCode} Roofing Estimates | Free & Instant`,
      template: `%s | ${name}`,
    },
    description: `Trusted roofing contractor serving ${city} and ${region}. Professional roof replacement, repair, and storm damage restoration. Free estimates available.`,
    keywords: [
      `${city} roofing`,
      `${region} roofing`,
      `roof repair ${city}`,
      `roof replacement ${stateCode}`,
      "storm damage repair",
      "free roofing estimate",
      `${region} roofer`,
    ],
    authors: [{ name, url: BASE_URL }],
    creator: name,
    publisher: name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    category: "Home Services",
    classification: "Roofing Contractor",
    referrer: "origin-when-cross-origin",
    openGraph: {
      title: `${name} | Instant Roofing Estimates in ${stateCode}`,
      description: `Know your roof cost in two minutes. Built from real ${region} material and labor pricing, with guidance on insurance, financing, and assistance.`,
      type: "website",
      locale: "en_US",
      url: BASE_URL,
      siteName: name,
      images: [
        {
          url: "/images/og-default.jpg",
          width: 1200,
          height: 630,
          alt: `${name} - Instant Roofing Estimates for ${region}`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Instant Roofing Estimates in ${stateCode}`,
      description: `Know your roof cost in 2 minutes. Free, instant roofing estimates for ${region}.`,
      images: ["/images/og-default.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/manifest.json",
    alternates: {
      canonical: BASE_URL,
    },
    other: {
      "geo.region": `US-${stateCode}`,
      "geo.placename": city,
      "geo.position": `${config.coordinates.lat};${config.coordinates.lng}`,
      "ICBM": `${config.coordinates.lat}, ${config.coordinates.lng}`,
      "business:contact_data:locality": city,
      "business:contact_data:region": stateCode,
      "business:contact_data:country_name": config.address.country,
      "business:contact_data:postal_code": config.address.zip,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getBusinessConfigFromDB();

  return (
    <html lang="en-US" dir="ltr">
      <head>
        {/* RSS Feed Discovery */}
        <link rel="alternate" type="application/rss+xml" title={`${config.name} Blog`} href="/feed.xml" />

        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload hero LCP image */}
        <link
          rel="preload"
          as="image"
          href="/images/work/replacement-after.webp"
          fetchPriority="high"
          type="image/webp"
        />

        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Schema.org Structured Data - Comprehensive Regional SEO */}
        <OrganizationSchema />
        <WebSiteSchema />
        <LocalBusinessSchema />

        {/* Regional SEO Schemas */}
        <ServiceAreaSchema />
        <ServiceAreaGeoSchema />
        <ProfessionalCredentialsSchema />
        <BrandSameAsSchema />
        <MinimalNAPSchema />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#c9a25c] focus:text-[#0c0f14] focus:rounded-md focus:font-semibold">
          Skip to main content
        </a>
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
        <Providers businessConfig={config}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
