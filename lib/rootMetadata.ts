import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  applicationName: siteConfig.name,
  title: {
    default: "The Rainbow Hub - Quick quizzes. Sharper mind.",
    template: "%s - The Rainbow Hub",
  },
  description: "Fast, mobile-friendly IQ and academic-style quiz tests.",
  openGraph: {
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl("/og-default.svg"),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    siteName: siteConfig.name,
    title: "The Rainbow Hub - Quick quizzes. Sharper mind.",
    type: "website",
    url: siteConfig.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    description: siteConfig.description,
    images: [absoluteUrl("/og-default.svg")],
    title: "The Rainbow Hub - Quick quizzes. Sharper mind.",
  },
};
