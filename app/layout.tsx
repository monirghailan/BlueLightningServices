import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { site } from "@/lib/content";
import { siteStructuredDataGraph } from "@/lib/structured-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Replace your in-house Salesforce development team with an agentic engineering partner. Decades of Salesforce mastery. From £3,499/mo.",
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description:
      "Your entire Salesforce development team — without the headcount. Agentic AI delivery with senior expert review.",
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description:
      "Replace your in-house Salesforce development team with an agentic engineering partner.",
  },
  icons: { icon: "/icon" },
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <ClientProviders>
          <ScrollToTop />
          <ConditionalHeader />
          <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
          <ConditionalFooter />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
        <JsonLd data={siteStructuredDataGraph()} />
      </body>
    </html>
  );
}
