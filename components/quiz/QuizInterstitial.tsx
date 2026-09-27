"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";

export function useQuizInterstitial() {
  useEffect(() => {
    let active = true;
    let slot: ReturnType<NonNullable<NonNullable<Window["googletag"]>["defineOutOfPageSlot"]>> = null;
    const markLink = (link: HTMLAnchorElement) => {
      if (link.dataset.quizInterstitial === "true" && link.getAttribute("aria-disabled") !== "true") {
        link.removeAttribute("data-google-interstitial");
      } else {
        link.setAttribute("data-google-interstitial", "false");
      }
    };
    const markLinks = () => document.querySelectorAll<HTMLAnchorElement>("a").forEach(markLink);
    const guardLink = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a") : null;
      if (link) markLink(link);
    };
    markLinks();
    document.addEventListener("click", guardLink, true);
    const observer = new MutationObserver(markLinks);
    observer.observe(document.body, { childList: true, subtree: true });
    window.googletag ??= { cmd: [] };
    window.googletag.cmd.push(() => {
      if (!active) return;
      const tag = window.googletag;
      const format = tag?.enums?.OutOfPageFormat?.INTERSTITIAL;
      if (format === undefined || !tag?.defineOutOfPageSlot || !tag.pubads) return;
      try {
        slot = tag.defineOutOfPageSlot(siteConfig.rewardedAdUnitPath, format);
        if (!slot) return;
        if (!slot.setConfig) {
          tag.destroySlots?.([slot]);
          slot = null;
          return;
        }
        slot.setConfig({ interstitial: { requireStorageAccess: true, triggers: {
          navBar: false, unhideWindow: false, inactivity: false,
          endOfArticle: false, continueReading: false, backward: false,
        } } });
        slot.addService(tag.pubads());
        tag.enableServices?.();
        tag.display?.(slot);
      } catch { /* No ad must never block a quiz link. */ }
    });
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("click", guardLink, true);
      if (slot) {
        try { window.googletag?.destroySlots?.([slot]); } catch { /* Best-effort cleanup. */ }
      }
    };
  }, []);
}
