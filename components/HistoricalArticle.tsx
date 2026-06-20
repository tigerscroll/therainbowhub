"use client";

import { useMemo, useState } from "react";

import articleData from "@/data/articles/historical.json";

type ArticleItem = {
  image: string;
  imageAlt: string;
  paragraphs: string[];
  title: string;
};

type HistoricalArticleProps = {
  rewardedAdUnitPath: string;
};

type RewardedStatus = "granted" | "closed_without_reward" | "unavailable";

const articleItems = articleData.items as ArticleItem[];
const articleTrackingName = "historical_photos_article";
const rewardedGrantedCountKey = "rainbowhub.rewardedGrantedCount";
const rewardedClosedCountKey = "rainbowhub.rewardedClosedCount";
const rewardTrackedKey = "rainbowhub.rewardTracked";
const reward2TrackedKey = "rainbowhub.reward2Tracked";
const rewardClosedTrackedKey = "rainbowhub.rewardClosedTracked";
const rewardClosed2TrackedKey = "rainbowhub.rewardClosed2Tracked";
const articleEngagedTrackedKey = "rainbowhub.articleEngagedTracked:historical";

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
  trackFbqCustomEventOnce("Engaged", {
    content_name: articleTrackingName,
    content_type: "article",
    engagement_source: "rewarded_ad_initiated",
    placement,
    ad_unit_path: adUnitPath,
  }, articleEngagedTrackedKey);
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

    function settle(status: RewardedStatus, reason: string) {
      if (settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      trackRewardClosed(placement, adUnitPath, status === "granted", reason);

      if (slot && window.googletag?.cmd && window.googletag.destroySlots) {
        try {
          window.googletag.cmd.push(() => {
            try {
              window.googletag?.destroySlots?.([slot]);
            } catch {}
          });
        } catch {}
      }

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

export function HistoricalArticle({ rewardedAdUnitPath }: HistoricalArticleProps) {
  const [started, setStarted] = useState(false);
  const [startUnlocking, setStartUnlocking] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [unlocking, setUnlocking] = useState(false);
  const [status, setStatus] = useState("");

  const visibleItems = useMemo(() => articleItems.slice(0, visibleCount), [visibleCount]);
  const hasMore = visibleCount < articleItems.length;
  const nextCount = Math.min(5, articleItems.length - visibleCount);

  async function startArticle() {
    if (startUnlocking || started) return;
    setStartUnlocking(true);

    let result: RewardedStatus = "unavailable";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      result = await requestRewardedAd(rewardedAdUnitPath, "historical_start");
      if (result === "granted") break;
      if (result === "closed_without_reward") {
        setStartUnlocking(false);
        return;
      }
    }

    setStarted(true);
    setStartUnlocking(false);
    window.setTimeout(() => {
      document.getElementById("historical-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function unlockNextSet() {
    if (unlocking) return;
    setUnlocking(true);
    setStatus("Loading a short ad...");

    let result: RewardedStatus = "unavailable";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      result = await requestRewardedAd(rewardedAdUnitPath, `historical_unlock_${visibleCount}`);
      if (result === "granted") break;
      if (result === "closed_without_reward") {
        setStatus("The ad was closed early. Try again to unlock the next section.");
        setUnlocking(false);
        return;
      }
      setStatus(attempt < 2 ? "Still looking for an ad..." : "No ad available, continuing.");
    }

    setVisibleCount((count) => Math.min(count + 5, articleItems.length));
    setStatus(result === "granted" ? "Unlocked." : "");
    setUnlocking(false);
  }

  return (
    <article className="timed-demo legacy-quiz timed-brand-article timed-historical-article">
      <div className="legacy-main">
        <section className="legacy-card legacy-start">
          <div className="legacy-badge" aria-hidden="true">
            <span>📸</span>
          </div>
          <h1>{articleData.landingTitle}</h1>
          <p className="legacy-sub">{articleData.summary}</p>
          <div className="timed-meta-row" aria-label="Article details">
            <span>
              <span aria-hidden="true">⏱️</span>
              <strong>5 minute<br />read</strong>
            </span>
            <span>
              <span aria-hidden="true">📅</span>
              <strong>Updated<br />this month</strong>
            </span>
            <span>
              <span aria-hidden="true">👥</span>
              <strong>64,000+<br />readers this week</strong>
            </span>
          </div>
          <button className="legacy-primary" type="button" onClick={startArticle} disabled={startUnlocking}>
            {startUnlocking ? "Loading Ad.." : <><span aria-hidden="true">▶</span> See The Photos</>}
          </button>
          <div className="legacy-ad-note">
            <span className="legacy-shield" aria-hidden="true">✓</span>
            <span>{startUnlocking ? <>When the ad ends, <b>tap the X</b> in the top right to continue.</> : <>Short ad first - <b>then article starts</b></>}</span>
          </div>
        </section>
      </div>

      {started ? (
        <section id="historical-start" className="timed-gallery timed-article" aria-label="Historical photos article">
          <header className="timed-gallery__intro timed-article-header timed-life-intro">
            <h2>{articleData.title}</h2>
            <p className="timed-article-byline">By The Rainbow Hub</p>
          </header>

          {visibleItems.map((item, index) => (
            <article className="timed-photo-card timed-article-section" id={`historical-photo-${index + 1}`} key={`${item.title}-${index}`}>
              <header className="timed-section-heading">
                <span className="timed-section-number" aria-hidden="true">{index + 1}</span>
                <h3>{item.title}</h3>
              </header>
              {item.paragraphs[0] ? <p className="timed-article-lead">{item.paragraphs[0]}</p> : null}
              <figure className="timed-article-figure">
                <div className="timed-photo timed-real-photo" role="img" aria-label={item.imageAlt}>
                  <img src={item.image} alt={item.imageAlt} loading={index < 5 ? "eager" : "lazy"} />
                </div>
              </figure>
              <div className="timed-card-copy">
                {item.paragraphs.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}

          {hasMore ? (
            <aside className="timed-unlock" aria-live="polite">
              <p className="timed-kicker">Keep reading</p>
              <h2>Unlock the next {nextCount} photos</h2>
              <p>View a short ad to continue.</p>
              <button className="legacy-primary" type="button" onClick={unlockNextSet} disabled={unlocking}>
                {unlocking ? "Loading Ad.." : "Continue Reading"}
              </button>
              <span className="timed-ad-note">{unlocking ? <>When the ad ends, <b>tap the X</b> in the top right to continue.</> : "Short ad first — then reading continues."}</span>
              {status ? <span className="timed-status">{status}</span> : null}
            </aside>
          ) : (
            <aside className="timed-finished">
              <p className="timed-kicker">Article complete</p>
              <h2>You have reached the end.</h2>
              <p>That is the full collection. These rewritten historical-photo stories are made for curious reading, using the permitted source images with fresh captions for this version.</p>
            </aside>
          )}
        </section>
      ) : null}
    </article>
  );
}
