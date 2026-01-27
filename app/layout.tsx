import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://farrellroofing.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c9a25c" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0f14" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Farrell Roofing | Tupelo MS Roofing Contractor | Free Estimates",
    template: "%s | Farrell Roofing",
  },
  description:
    "Trusted roofing contractor serving Tupelo and Northeast Mississippi since 2010. Professional roof replacement, repair, and storm damage restoration. Free estimates available.",
  keywords: [
    "Tupelo roofing",
    "Mississippi roofing contractor",
    "roof repair Tupelo",
    "roof replacement Mississippi",
    "storm damage repair",
    "free roofing estimate",
    "Northeast Mississippi roofer",
    "Lee County roofing",
    "Oxford roofing",
    "Starkville roofing",
  ],
  authors: [{ name: "Farrell Roofing", url: BASE_URL }],
  creator: "Farrell Roofing",
  publisher: "Farrell Roofing",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "Home Services",
  classification: "Roofing Contractor",
  referrer: "origin-when-cross-origin",
  openGraph: {
    title: "Farrell Roofing | Tupelo MS Roofing Contractor",
    description:
      "Trusted roofing contractor serving Tupelo and Northeast Mississippi. Professional roof replacement, repair, and storm damage restoration.",
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Farrell Roofing",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Farrell Roofing - Northeast Mississippi Roofing Experts",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farrell Roofing | Tupelo MS Roofing Contractor",
    description:
      "Trusted roofing contractor serving Northeast Mississippi. Free estimates available.",
    site: "@farrellroofing",
    creator: "@farrellroofing",
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
    "geo.region": "US-MS",
    "geo.placename": "Tupelo",
    "geo.position": "34.2576;-88.7034",
    "ICBM": "34.2576, -88.7034",
    "business:contact_data:locality": "Tupelo",
    "business:contact_data:region": "MS",
    "business:contact_data:country_name": "United States",
    "business:contact_data:postal_code": "38801",
  },
  verification: {
    // Add your verification codes here
    // google: "google-site-verification-code",
    // yandex: "yandex-verification-code",
    // bing: "bing-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" dir="ltr">
      <head>
        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
