import Script from "next/script";
import { siteConfig } from "@/lib/siteConfig";

export function HeadScripts() {
  return (
    <>
      <Script
        src={siteConfig.assertiveYieldManagerUrl}
        strategy="afterInteractive"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Meta Pixel Code: replace siteConfig.metaPixelId when changing accounts. */}
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
          fbq('track', 'PageView');
        `}
      </Script>

      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.googleTagId}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag("js", new Date());
          gtag("config", "${siteConfig.googleTagId}");
        `}
      </Script>
    </>
  );
}
