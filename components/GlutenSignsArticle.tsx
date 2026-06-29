"use client";

import { useEffect, useMemo, useState } from "react";

import articleData from "@/data/articles/gluten-signs.json";

type ArticleItem = {
  image: string;
  imageAlt: string;
  paragraphs: string[];
  title: string;
};

type GlutenSignsArticleProps = {
  rewardedAdUnitPath: string;
};

type RewardedStatus = "granted" | "closed_without_reward" | "unavailable";

const articleItems = articleData.items as ArticleItem[];
const articleTrackingName = "gluten_signs_article";
const rewardedGrantedCountKey = "rainbowhub.rewardedGrantedCount";
const rewardedClosedCountKey = "rainbowhub.rewardedClosedCount";
const rewardTrackedKey = "rainbowhub.rewardTracked";
const reward2TrackedKey = "rainbowhub.reward2Tracked";
const rewardClosedTrackedKey = "rainbowhub.rewardClosedTracked";
const rewardClosed2TrackedKey = "rainbowhub.rewardClosed2Tracked";
const articleEngagedTrackedKey = "rainbowhub.articleEngagedTracked:gluten-signs";

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      defineOutOfPageSlot?: (adUnitPath: string, format: unknown) => unknown;
      destroySlots?: (slots: unknown[]) => void;
      display?: (slot: unknown) => void;
      enableServices?: () => void;
      enums?: {
        OutOfPageFormat?: {
          REWARDED?: unknown;
        };
      };
      pubads?: () => {
        addEventListener: (eventName: string, callback: (event: any) => void) => void;
        updateCorrelator?: () => void;
      };
    };
  }
}

type FbqPayload = Record<string, string | number | boolean | null | undefined>;

function loadGooglePublisherTag() {
  if (typeof window === "undefined") return;
  if (typeof window.googletag?.defineOutOfPageSlot === "function") return;
  if (document.querySelector('script[data-rainbow-gpt-loader="true"], script[src*="securepubads.g.doubleclick.net/tag/js/gpt.js"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
  script.setAttribute("data-rainbow-gpt-loader", "true");
  document.head.appendChild(script);
}

function readSessionNumber(key: string, fallback: number) {
  try {
    const parsed = Number(window.sessionStorage.getItem(key));
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function readSessionFlag(key: string) {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionValue(key: string, value: string | number) {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {}
}

function trackFbqCustomEventOnce(eventName: string, data: FbqPayload, trackedKey: string) {
  if (readSessionFlag(trackedKey)) return true;
  writeSessionValue(trackedKey, "1");
  try {
    console.log("fbq custom event: " + eventName, data);
  } catch {}
  try {
    window.fbq?.("trackCustom", eventName, data);
  } catch {}
  return true;
}

function trackArticleEngaged(placement: string, adUnitPath: string) {
  trackFbqCustomEventOnce(
    "Engaged",
    {
      content_name: articleTrackingName,
      content_type: "article",
      engagement_source: "rewarded_ad_initiated",
      placement,
      ad_unit_path: adUnitPath,
    },
    articleEngagedTrackedKey,
  );
}

function trackRewardGranted(placement: string, adUnitPath: string) {
  const rewardCount = readSessionNumber(rewardedGrantedCountKey, 0) + 1;
  writeSessionValue(rewardedGrantedCountKey, rewardCount);
  const data = {
    content_name: articleTrackingName,
    content_type: "article",
    placement,
    fallback: false,
    ad_unit_path: adUnitPath,
    reward_count: rewardCount,
  };

  trackFbqCustomEventOnce("Reward", data, rewardTrackedKey);
  if (rewardCount >= 2) {
    trackFbqCustomEventOnce("Reward2", data, reward2TrackedKey);
  }
}

function trackRewardClosed(placement: string, adUnitPath: string, granted: boolean, reason: string) {
  if (!granted || reason !== "reward_granted") return;

  const rewardCount = readSessionNumber(rewardedGrantedCountKey, 0);
  const closedCount = readSessionNumber(rewardedClosedCountKey, 0) + 1;
  writeSessionValue(rewardedClosedCountKey, closedCount);
  const data = {
    content_name: articleTrackingName,
    content_type: "article",
    placement,
    fallback: false,
    granted,
    reason,
    ad_unit_path: adUnitPath,
    reward_count: rewardCount,
    reward_closed_count: closedCount,
  };

  trackFbqCustomEventOnce("RewardClosed", data, rewardClosedTrackedKey);
  if (closedCount >= 2) {
    trackFbqCustomEventOnce("RewardClosed2", data, rewardClosed2TrackedKey);
  }
}

function requestRewardedAd(adUnitPath: string, placement: string) {
  if (!adUnitPath || typeof window === "undefined") {
    return Promise.resolve<RewardedStatus>("unavailable");
  }

  return new Promise<RewardedStatus>((resolve) => {
    let slot: unknown = null;
    let settled = false;
    let granted = false;

    function destroyRewardedSlot() {
      if (!slot || !window.googletag?.cmd || !window.googletag.destroySlots) return;
      try {
        window.googletag.cmd.push(() => {
          try {
            window.googletag?.destroySlots?.([slot]);
          } catch {}
        });
      } catch {}
    }

    function settle(status: RewardedStatus, reason: string) {
      if (settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      trackRewardClosed(placement, adUnitPath, status === "granted", reason);
      destroyRewardedSlot();
      resolve(status);
    }

    const failTimer = window.setTimeout(() => settle("unavailable", "no_rewarded_ad"), 8000);

    window.googletag = window.googletag || { cmd: [] };
    loadGooglePublisherTag();

    try {
      window.googletag.cmd.push(() => {
        try {
          const rewardedFormat = window.googletag?.enums?.OutOfPageFormat?.REWARDED;
          const outOfPageSlot = window.googletag?.defineOutOfPageSlot?.(adUnitPath, rewardedFormat);

          if (!outOfPageSlot || !window.googletag?.pubads) {
            settle("unavailable", "slot_unavailable");
            return;
          }

          slot = outOfPageSlot;
          const pubads = window.googletag.pubads();
          const rewardedSlot = outOfPageSlot as { addService?: (service: unknown) => void };

          pubads.addEventListener("rewardedSlotReady", (event) => {
            if (event.slot !== slot || settled) return;
            window.clearTimeout(failTimer);

            try {
              event.makeRewardedVisible();
              trackArticleEngaged(placement, adUnitPath);
            } catch {
              settle("unavailable", "make_visible_failed");
            }
          });

          pubads.addEventListener("rewardedSlotGranted", (event) => {
            if (event.slot !== slot || settled) return;
            granted = true;
            trackRewardGranted(placement, adUnitPath);
            destroyRewardedSlot();
            settle("granted", "reward_granted");
          });

          pubads.addEventListener("rewardedSlotClosed", (event) => {
            if (event.slot !== slot || settled) return;
            settle(granted ? "granted" : "closed_without_reward", granted ? "reward_granted" : "closed_without_reward");
          });

          try {
            pubads.updateCorrelator?.();
          } catch {}

          rewardedSlot.addService?.(pubads);
          window.googletag?.enableServices?.();
          window.googletag?.display?.(slot);
        } catch {
          settle("unavailable", "request_error");
        }
      });
    } catch {
      settle("unavailable", "gpt_queue_error");
    }
  });
}

export function GlutenSignsArticle({ rewardedAdUnitPath }: GlutenSignsArticleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [status, setStatus] = useState("");

  const totalSlides = articleItems.length;
  const currentItem = articleItems[currentIndex];
  const hasMore = currentIndex < totalSlides - 1;

  useEffect(() => {
    const nextImage = articleItems[currentIndex + 1]?.image;
    if (!nextImage || typeof window === "undefined") return;
    const image = new window.Image();
    image.src = nextImage;
  }, [currentIndex]);

  const nextSlideLabel = useMemo(() => `Next Slide >`, []);

  async function goToNextSlide() {
    if (unlocking || !hasMore) return;
    setUnlocking(true);
    setStatus("");

    let result: RewardedStatus = "unavailable";
    const nextSlideNumber = currentIndex + 2;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      result = await requestRewardedAd(rewardedAdUnitPath, `gluten_signs_slide_${nextSlideNumber}`);
      if (result === "granted") break;
      if (result === "closed_without_reward") {
        setStatus("The ad was closed early. Try again to unlock the next slide.");
        setUnlocking(false);
        return;
      }
      setStatus(attempt < 2 ? "Still looking for an ad..." : "No ad available, continuing.");
    }

    setCurrentIndex((index) => Math.min(index + 1, totalSlides - 1));
    setStatus(result === "granted" ? "" : "Unlocked.");
    setUnlocking(false);

    window.setTimeout(() => {
      document.getElementById("gluten-signs-current-slide")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <article className="timed-demo legacy-quiz timed-brand-article timed-life-article timed-gluten-article">
      <section id="gluten-signs-start" className="timed-gallery timed-article" aria-label="Gluten sensitivity signs article">
        <header className="timed-gallery__intro timed-article-header timed-life-intro">
          <h2>{articleData.title}</h2>
          <p className="timed-life-summary">{articleData.summary}</p>
        </header>

        <article
          className="timed-photo-card timed-article-section timed-single-slide"
          id="gluten-signs-current-slide"
          key={`${currentItem.title}-${currentIndex}`}
        >
          <header className="timed-section-heading">
            <h3>{`${currentIndex + 1}. ${currentItem.title}`}</h3>
          </header>
          <figure className="timed-article-figure">
            <div className="timed-photo timed-real-photo" role="img" aria-label={currentItem.imageAlt}>
              <img src={currentItem.image} alt={currentItem.imageAlt} loading="eager" />
            </div>
          </figure>
          <div className="timed-card-copy">
            {currentItem.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        {hasMore ? (
          <div className="timed-gluten-nav" aria-live="polite">
            <button className="legacy-primary" type="button" onClick={goToNextSlide} disabled={unlocking}>
              {unlocking ? "Loading Ad.." : nextSlideLabel}
            </button>
            <span className="timed-ad-note">
              <>✓ <b>Short ad first</b> — then article continues.</>
            </span>
            {status ? <span className="timed-status">{status}</span> : null}
          </div>
        ) : (
          <aside className="timed-finished timed-gluten-finished">
            <p className="timed-kicker">Article complete</p>
            <h2>You have reached the end.</h2>
            <p>{articleData.disclaimer}</p>
          </aside>
        )}
      </section>
    </article>
  );
}
