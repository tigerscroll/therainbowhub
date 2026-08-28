import Script from "next/script";
import { Suspense } from "react";

import { FbclidHeaderVisibility } from "@/components/FbclidHeaderVisibility";
import type { SupportedLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/siteConfig";

type RootDocumentProps = {
  children: React.ReactNode;
  direction: string;
  locale: SupportedLocale;
};

export function RootDocument({ children, direction, locale }: RootDocumentProps) {
  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const key="rainbowhub:fbclid-traffic";const hasFbclid=new URLSearchParams(location.search).has("fbclid");if(hasFbclid)sessionStorage.setItem(key,"1");if(hasFbclid||sessionStorage.getItem(key)==="1")document.documentElement.classList.add("fbclid-traffic")}catch{}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Suspense fallback={null}>
          <FbclidHeaderVisibility />
        </Suspense>
        <Script
          referrerPolicy="no-referrer-when-downgrade"
          src={siteConfig.assertiveYieldManagerUrl}
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
          strategy="afterInteractive"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-44LV753KWN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){dataLayer.push(arguments);};
            gtag('js', new Date());
            gtag('config', 'G-44LV753KWN', { send_page_view: false });
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${siteConfig.metaPixelId}');
          `}
        </Script>
        <noscript>
          <img
            alt=""
            height="1"
            src={`https://www.facebook.com/tr?id=${siteConfig.metaPixelId}&ev=PageView&noscript=1`}
            style={{ display: "none" }}
            width="1"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
