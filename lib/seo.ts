import type { Metadata } from "next";
import { site } from "@/lib/content";

type PageMetadataInput = {
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
};

export function pageUrl(path: string): string {
  return path === "/" || path === "" ? site.url : `${site.url}${path}`;
}

export function buildPageMetadata({
  path,
  title,
  description,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = pageUrl(path);
  const isHome = path === "/" || path === "";
  const ogTitle = isHome ? `${site.name} — ${site.tagline}` : `${title} | ${site.name}`;

  return {
    ...(isHome
      ? { title: { absolute: `${site.name} — ${site.tagline}` } }
      : { title }),
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
