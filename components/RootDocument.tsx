import Script from "next/script";
import { Suspense } from "react";

import { FbclidHeaderVisibility } from "@/components/FbclidHeaderVisibility";
import { getAllArticleManifests } from "@/lib/articles";
import type { SupportedLocale } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";
import { getArticlePath } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

type RootDocumentProps = {
  children: React.ReactNode;
  direction: string;
  head?: React.ReactNode;
  locale: SupportedLocale;
};

export function RootDocument({ children, direction, head, locale }: RootDocumentProps) {
  const quizzes = getAllQuizzes(locale);
  const sources = JSON.stringify(Object.fromEntries(quizzes.map(quiz => [quiz.slug, [quiz.themeCssHref, quiz.shellCssHref]]))).replace(/</g, "\\u003c");
  const articlePaths = JSON.stringify(getAllArticleManifests().filter(article => article.locale === locale)
    .map(article => getArticlePath(locale, article.routeSlug ?? article.slug))).replace(/</g, "\\u003c");
  const previewCss = `.article-quiz-previews>[data-article-quiz-preview]{display:none}` + quizzes.map(quiz =>
    `html[data-article-quiz="${quiz.slug}"] .article-quiz-previews>[data-article-quiz-preview="${quiz.slug}"]{display:block}`
  ).join("");
  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: previewCss }} />
        <script id="article-quiz-first-paint" dangerouslySetInnerHTML={{ __html: `(function(){const paths=${articlePaths};if(!paths.some(path=>location.pathname===path||location.pathname.startsWith(path+"/")))return;const sources=${sources};const values=new URLSearchParams(location.search).getAll("q");const slug=values.length===1?values[0]:"";if(!Object.hasOwn(sources,slug))return;document.documentElement.dataset.articleQuiz=slug;for(const href of sources[slug]){if(!href)continue;const link=document.createElement("link");link.rel="stylesheet";link.href=href;link.setAttribute("blocking","render");document.head.appendChild(link)}})()` }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `const hasFbclid=new URLSearchParams(location.search).has("fbclid");if(hasFbclid)document.documentElement.classList.add("fbclid-traffic");try{const key="rainbowhub:fbclid-traffic";if(hasFbclid)sessionStorage.setItem(key,"1");if(sessionStorage.getItem(key)==="1")document.documentElement.classList.add("fbclid-traffic");const backgroundKey="rainbowhub:navigation-background";const navigationBackground=sessionStorage.getItem(backgroundKey);if(navigationBackground){document.documentElement.style.setProperty("--navigation-background",navigationBackground);sessionStorage.removeItem(backgroundKey)}}catch{}`,
          }}
        />
        {head}
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
