import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free Roofing Estimate | Get Your Quote in 2 Minutes",
  description:
    "Get an instant, accurate roofing estimate. No contractors calling, no pressure. Just honest pricing for your roof repair or replacement.",
  keywords: [
    "roofing estimate",
    "roof repair cost",
    "roof replacement",
    "free roofing quote",
    "roof inspection",
  ],
  openGraph: {
    title: "Free Roofing Estimate | Get Your Quote in 2 Minutes",
    description:
      "Get an instant, accurate roofing estimate. No contractors calling, no pressure. Just honest pricing.",
    type: "website",
    locale: "en_US",
    siteName: "Roofing Estimate Calculator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Roofing Estimate | Get Your Quote in 2 Minutes",
    description:
      "Get an instant, accurate roofing estimate. No contractors calling, no pressure.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
