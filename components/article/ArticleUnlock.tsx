"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { requestArticleReward } from "./articleAds";
import type { ArticleManifest } from "./articleSchema";

export function ArticleUnlock({ children, slug, locale, settings, teaser }: {
  children: ReactNode;
  teaser: ReactNode;
  slug: string;
  locale: string;
  settings: NonNullable<ArticleManifest["monetization"]>;
}) {
  const storageKey = `rainbowhub:article-unlock:v1:${locale}:${slug}`;
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { setUnlocked(localStorage.getItem(storageKey) === "1"); } catch { /* Reading still works without storage. */ }
    setReady(true);
    return () => request.current?.abort();
  }, [storageKey]);

  async function unlock() {
    if (request.current || unlocked) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setMessage("");
    const result = await requestArticleReward({ adUnitPath: siteConfig.articleDisplayAdUnitPath, signal: controller.signal });
    if (controller.signal.aborted) return;
    setBusy(false);
    if (result === "closed") {
      request.current = null;
      setMessage("The ad was closed before the article unlocked. You can try again or keep browsing.");
      return;
    }
    try { localStorage.setItem(storageKey, "1"); } catch { /* Keep the current page unlocked regardless. */ }
    setUnlocked(true);
    setMessage(result === "unavailable" ? "No ad is available. You can read the full guide." : "The full guide is unlocked.");
    if (result === "unavailable") window.requestAnimationFrame(() => content.current?.focus({ preventScroll: true }));
  }

  return (
    <>
      {!unlocked ? <div className="article-unlock" aria-label={settings.title}>
        <div aria-hidden="true" className="article-unlock__teaser">{teaser}</div>
        {settings.copy ? <p className="article-unlock__copy">{settings.copy}</p> : null}
        <button aria-controls="article-unlocked-content" aria-describedby="article-ad-note" disabled={!ready || busy} onClick={unlock} type="button">
          {busy ? "Opening ad…" : settings.cta}
        </button>
        <p className="article-unlock__note" id="article-ad-note">{settings.adNote}</p>
        <noscript><p>Enable JavaScript to use the article unlock. The preview and sources remain available below.</p></noscript>
      </div> : null}
      <p aria-live="polite" className="article-unlock__status" role="status">{message}</p>
      <div className="article-unlocked-content" hidden={!unlocked} id="article-unlocked-content" ref={content} tabIndex={-1}>
        {children}
      </div>
    </>
  );
}
