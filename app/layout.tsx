import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
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
            __html: `<script src="${siteConfig.assertiveYieldManagerUrl}" type="text/javascript" referrerpolicy="no-referrer-when-downgrade"></script><script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script><script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${siteConfig.metaPixelId}');
</script>`,
          }}
        />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.addEventListener("assertive_predictedRevenue", function (e) {
  var sessionRPM = e?.data?.predictedRevenueCPM?.session;

  if (typeof sessionRPM === "number") {
    var sessionValue = sessionRPM / 1000;

    if (sessionRPM >= 10 && !window.__rps10cTracked) {
      window.__rps10cTracked = true;

      if (typeof window.fbq === "function") {
        window.fbq("trackCustom", "RPS_1_0C", {
          currency: "USD",
          predicted_session_rpm: sessionRPM,
          value: 0.01
        });
      }

      console.log("RPS_1_0C fired:", {
        predicted_session_rpm: sessionRPM,
        predicted_session_value: sessionValue
      });
    }
  } else {
    console.log("No session RPM found:", e.data);
  }
});
`,
          }}
        />
      </body>
    </html>
  );
}
