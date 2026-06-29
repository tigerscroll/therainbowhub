"use client";

import { useMemo, useState } from "react";

import articleData from "@/data/articles/scandal";

type Chapter = {
  paragraphs: readonly string[];
  title: string;
};

type ScandalNovelProps = {
  rewardedAdUnitPath: string;
};

type RewardedStatus = "granted" | "closed_without_reward" | "unavailable";

const chapters = articleData.chapters as readonly Chapter[];
const articleTrackingName = "she_was_meant_to_be_the_scandal";
const rewardedGrantedCountKey = "rainbowhub.rewardedGrantedCount";
const rewardedClosedCountKey = "rainbowhub.rewardedClosedCount";
const rewardTrackedKey = "rainbowhub.rewardTracked";
const reward2TrackedKey = "rainbowhub.reward2Tracked";
const rewardClosedTrackedKey = "rainbowhub.rewardClosedTracked";
const rewardClosed2TrackedKey = "rainbowhub.rewardClosed2Tracked";
const articleEngagedTrackedKey = "rainbowhub.articleEngagedTracked:scandal";
const chapterTeasers = [
  "A dead phone. A fake message. And proof the scandal started before sunrise.",
  "The missing file turns the night from embarrassment into sabotage.",
  "A grainy photo puts Sienna closer to the setup than Ava can explain away.",
  "Sienna shows up at Luca's door with the phone and a story that doesn't fit.",
  "A public leak hits before Ava can even get dressed and back in control.",
  "A shattered memory returns: Sienna, the rooftop, and a fight over the file.",
  "At the firm, sympathy feels rehearsed and someone is already treating Ava like a liability.",
  "Luca finally explains why he was watching the same people Ava was about to expose.",
  "Luca's sister's story reveals a name Ava has already seen inside the stolen file.",
  "Sienna offers the missing phone back, but only if Ava comes alone.",
  "One wrong detail gives Sienna away and turns doubt into betrayal.",
  "Back at the venue, Ava remembers what really happened on the rooftop.",
  "The room was staged and the morning-after story was built on purpose.",
  "Ava learns why Luca took her home and why that truth hurts almost as much as the setup.",
  "Trying to fix everything without Luca only reveals how much bigger the sabotage is.",
  "The corporate version of the trap comes into focus and Sienna is no longer acting alone.",
  "Ava goes back to Luca and the final missing proof finally comes within reach.",
  "At a glittering public event, the wrong people start to panic.",
  "A recovered voice memo changes the meaning of the entire night.",
  "The sabotage collapses, the truth comes out, and Ava chooses her real ending."
] as const;

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

export function ScandalNovel({ rewardedAdUnitPath }: ScandalNovelProps) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [unlocking, setUnlocking] = useState(false);
  const [status, setStatus] = useState("");

  const visibleChapters = useMemo(() => chapters.slice(0, visibleCount), [visibleCount]);
  const hasMore = visibleCount < chapters.length;
  const nextChapterNumber = visibleCount + 1;
  const nextChapterTeaser = chapterTeasers[nextChapterNumber - 1] ?? "";

  async function unlockNextChapter() {
    if (unlocking || !hasMore) return;
    setUnlocking(true);
    setStatus("Loading Ad..");

    let result: RewardedStatus = "unavailable";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      result = await requestRewardedAd(rewardedAdUnitPath, `scandal_unlock_${nextChapterNumber}`);
      if (result === "granted") break;
      if (result === "closed_without_reward") {
        setStatus("The ad was closed early. Try again to unlock the next chapter.");
        setUnlocking(false);
        return;
      }
      setStatus(attempt < 2 ? "Still looking for an ad..." : "No ad available, continuing.");
    }

    setVisibleCount((count) => Math.min(count + 1, chapters.length));
    setStatus(result === "granted" ? "Unlocked." : "");
    setUnlocking(false);
    window.setTimeout(() => {
      document.getElementById(`scandal-chapter-${nextChapterNumber}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <article className="timed-demo legacy-quiz timed-brand-article timed-article serial-novel">
      <section id="scandal-start" className="timed-gallery timed-article" aria-label="Serial romance mystery novel">
        <header className="timed-gallery__intro timed-article-header timed-life-intro serial-novel__intro">
          <p className="timed-kicker serial-novel__eyebrow">A serial romance mystery</p>
          <h2>{articleData.title}</h2>
          <p className="timed-life-summary">{articleData.intro}</p>
          <div className="serial-novel__divider" aria-hidden="true">
            <span />
          </div>
        </header>

        {visibleChapters.map((chapter, index) => (
          <article
            className="timed-photo-card timed-article-section serial-chapter-card"
            id={`scandal-chapter-${index + 1}`}
            key={`${chapter.title}-${index}`}
          >
            <header className="timed-section-heading">
              <span className="timed-section-number" aria-hidden="true">{index + 1}</span>
              <div>
                <p className="timed-kicker serial-chapter-kicker">Chapter {index + 1}</p>
                <h3>{chapter.title}</h3>
              </div>
            </header>
            {chapter.paragraphs[0] ? <p className="timed-article-lead">{chapter.paragraphs[0]}</p> : null}
            <div className="timed-card-copy">
              {chapter.paragraphs.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}

        {hasMore ? (
          <aside className="timed-unlock serial-novel__unlock" aria-live="polite">
            <p className="timed-kicker">Keep reading</p>
            <h2>Unlock Chapter {nextChapterNumber}</h2>
            <p>One short ad unlocks the next chapter.</p>
            {nextChapterTeaser ? <p className="serial-novel__teaser">{nextChapterTeaser}</p> : null}
            <button className="legacy-primary" type="button" onClick={unlockNextChapter} disabled={unlocking}>
              {unlocking ? "Loading Ad.." : `Read Chapter ${nextChapterNumber}`}
            </button>
            <span className="timed-ad-note">
              {unlocking ? <>When the ad ends, <b>tap the X</b> in the top right to continue.</> : ""}
            </span>
            {status ? <span className="timed-status">{status}</span> : null}
          </aside>
        ) : (
          <aside className="timed-finished serial-novel__finished">
            <p className="timed-kicker">Story complete</p>
            <h2>The real story is finally out.</h2>
            <p>Ava's name is restored, the sabotage collapses, and the night that was meant to ruin her becomes the night someone chose to protect her.</p>
          </aside>
        )}
      </section>
    </article>
  );
}
