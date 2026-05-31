import type { Metadata } from "next";
import { HeadScripts } from "@/components/HeadScripts";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The Rainbow Hub - Quick quizzes. Sharper mind.",
    template: "%s - The Rainbow Hub",
  },
  description: "Fast, mobile-friendly IQ and academic-style quiz tests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `<script src="${siteConfig.assertiveYieldManagerUrl}" type="text/javascript" referrerpolicy="no-referrer-when-downgrade"></script><script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>`,
          }}
        />
        <HeadScripts />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${siteConfig.metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}
