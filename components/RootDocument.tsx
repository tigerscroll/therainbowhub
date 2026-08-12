import Script from "next/script";

import { getLocaleDirection, getSupportedLocales, type SupportedLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/siteConfig";

type RootDocumentProps = {
  children: React.ReactNode;
  direction: string;
  locale: SupportedLocale;
};

export function RootDocument({ children, direction, locale }: RootDocumentProps) {
  const localeDirections = Object.fromEntries(
    getSupportedLocales().map((supportedLocale) => [supportedLocale, getLocaleDirection(supportedLocale)]),
  );
  const documentLocaleScript = `(function(){var locales=${JSON.stringify(localeDirections)};var segment=location.pathname.split('/').filter(Boolean)[0];var locale=Object.prototype.hasOwnProperty.call(locales,segment)?segment:${JSON.stringify(locale)};document.documentElement.lang=locale;document.documentElement.dir=locales[locale]||${JSON.stringify(direction)};}());`;

  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: documentLocaleScript }} />
      </head>
      <body suppressHydrationWarning>
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
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-44LV753KWN');
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
