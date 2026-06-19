"use client";

import { useMemo, useState } from "react";

type ArticleItem = {
  accentIcon: string;
  caption: string;
  icon: string;
  kicker: string;
  question: string;
  style: string;
  title: string;
};

type TimedPhotosDemoProps = {
  rewardedAdUnitPath: string;
};

type RewardedStatus = "granted" | "closed_without_reward" | "unavailable";

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

const articleTrackingName = "procedures_after_70_article";
const rewardedGrantedCountKey = "rainbowhub.rewardedGrantedCount";
const rewardedClosedCountKey = "rainbowhub.rewardedClosedCount";
const rewardTrackedKey = "rainbowhub.rewardTracked";
const reward2TrackedKey = "rainbowhub.reward2Tracked";
const rewardClosedTrackedKey = "rainbowhub.rewardClosedTracked";
const rewardClosed2TrackedKey = "rainbowhub.rewardClosed2Tracked";
const articleEngagedTrackedKey = "rainbowhub.articleEngagedTracked:medical-procedures";

const articleItems: ArticleItem[] = [
  {
    accentIcon: "🚶",
    kicker: "Procedure 1",
    icon: "🦴",
    title: "Elective back surgery",
    caption: "Back surgery can be demanding because recovery may be slow, pain relief is not always guaranteed, and a short setback can affect walking, sleep, and independence.",
    question: "What improvement should I realistically expect, and what happens if recovery takes longer than planned?",
    style: "sun-jump",
  },
  {
    accentIcon: "🩼",
    kicker: "Procedure 2",
    icon: "🦿",
    title: "Joint replacement revisions",
    caption: "A repeat joint operation can carry more risk than the first one because scar tissue, weaker bone, longer rehab, and infection concerns may make recovery harder.",
    question: "Is this likely to restore daily movement, or mainly reduce one specific problem?",
    style: "fountain",
  },
  {
    accentIcon: "✨",
    kicker: "Procedure 3",
    icon: "💤",
    title: "Cosmetic surgery under general anesthesia",
    caption: "The main concern is not the cosmetic change itself, but the anesthesia, bruising, wound healing, and recovery stress that may outweigh the benefit.",
    question: "Is the expected benefit worth the anesthesia and healing time at my age?",
    style: "shadow",
  },
  {
    accentIcon: "💧",
    kicker: "Procedure 4",
    icon: "🔎",
    title: "Routine screening colonoscopy",
    caption: "For some older adults, the bowel preparation, sedation, dehydration risk, and chance of a follow-up procedure may matter more if the screening benefit is small.",
    question: "If this test finds something, would the next step actually change my care?",
    style: "cloud",
  },
  {
    accentIcon: "👁️",
    kicker: "Procedure 5",
    icon: "👓",
    title: "Cataract surgery timing",
    caption: "Cataract surgery is often useful, but timing matters because dry eye, other eye disease, medication issues, and fall risk during recovery can affect the decision.",
    question: "Is my vision problem clearly from cataracts, or is something else also affecting my sight?",
    style: "reflection",
  },
  {
    accentIcon: "🦷",
    kicker: "Procedure 6",
    icon: "😁",
    title: "Dental implants",
    caption: "Implants can involve surgery, healing time, infection risk, bone strength questions, and several visits, so the overall burden can be higher than expected.",
    question: "What is the simpler option, and how many visits would each path take?",
    style: "bird",
  },
  {
    accentIcon: "💓",
    kicker: "Procedure 7",
    icon: "🫀",
    title: "Heart stent decisions",
    caption: "Stents can be important in the right situation, but the risk-benefit balance depends on symptoms, medications, bleeding risk, and whether the procedure will clearly improve life.",
    question: "Is this for symptom relief, emergency risk, or a scan finding that may not bother me?",
    style: "pose",
  },
  {
    accentIcon: "🛏️",
    kicker: "Procedure 8",
    icon: "🏥",
    title: "Major abdominal surgery",
    caption: "Large abdominal operations can be risky because they may involve infection, blood clots, confusion after anesthesia, reduced strength, and a long recovery window.",
    question: "What would recovery look like in week one, month one, and month three?",
    style: "wave",
  },
  {
    accentIcon: "⚖️",
    kicker: "Procedure 9",
    icon: "🧭",
    title: "Prostate procedures",
    caption: "These procedures can affect comfort, urinary control, sexual function, and recovery time, so the possible benefit should be weighed against quality-of-life changes.",
    question: "Which side effects are most common, and which ones might last?",
    style: "sign",
  },
  {
    accentIcon: "❓",
    kicker: "Procedure 10",
    icon: "🖥️",
    title: "Preventive scans with unclear benefit",
    caption: "Extra scans can lead to false alarms, more tests, worry, and procedures that may not improve health, especially when the result would not change care.",
    question: "What decision would this scan help us make?",
    style: "impossible",
  },
  {
    accentIcon: "🌙",
    kicker: "Procedure 11",
    icon: "😴",
    title: "Sleep apnea procedures",
    caption: "Surgical sleep treatments can be uncomfortable and may not fully solve the problem, so testing, recovery time, and non-surgical options are worth comparing.",
    question: "Have the less invasive options been tried properly first?",
    style: "foreground",
  },
  {
    accentIcon: "🦵",
    kicker: "Procedure 12",
    icon: "🧦",
    title: "Varicose vein treatments",
    caption: "Vein treatments are often minor, but bruising, skin irritation, clot concerns, circulation problems, and blood-thinning medicines can make planning important.",
    question: "Is this mainly for comfort, appearance, circulation, or a medical concern?",
    style: "poster",
  },
  {
    accentIcon: "🍽️",
    kicker: "Procedure 13",
    icon: "🟡",
    title: "Gallbladder surgery",
    caption: "Gallbladder surgery can be necessary, but it may carry extra risk if symptoms are mild, other health issues are present, or anesthesia and digestion changes are concerns.",
    question: "Are my symptoms strong enough to justify surgery now, or is watchful waiting reasonable?",
    style: "mirror",
  },
  {
    accentIcon: "📦",
    kicker: "Procedure 14",
    icon: "🩹",
    title: "Hernia repair",
    caption: "Some hernias can be watched, while surgery may bring anesthesia risk, pain, lifting limits, and recurrence concerns, especially if the hernia is not causing much trouble.",
    question: "What signs would make this urgent instead of something to monitor?",
    style: "collision",
  },
  {
    accentIcon: "⚡",
    kicker: "Procedure 15",
    icon: "💉",
    title: "Spinal injections",
    caption: "Spinal injections may only help temporarily and can involve bleeding, infection, medication side effects, or repeated visits without solving the underlying problem.",
    question: "How long does the benefit usually last, and what is the plan if it fades?",
    style: "detail",
  },
  {
    accentIcon: "🚶",
    kicker: "Procedure 16",
    icon: "🦵",
    title: "Knee arthroscopy",
    caption: "For age-related knee pain, the benefit can be limited, while swelling, infection risk, anesthesia, and rehab time can still affect daily movement.",
    question: "Is this likely to beat physical therapy or other non-surgical options for my type of knee problem?",
    style: "sun-jump",
  },
  {
    accentIcon: "🔬",
    kicker: "Procedure 17",
    icon: "🎗️",
    title: "Aggressive cancer screening",
    caption: "Screening can be valuable, but aggressive testing may find slow-growing issues that lead to biopsies, anxiety, or treatment that may not improve quality of life.",
    question: "Would finding something lead to treatment I would actually choose?",
    style: "fountain",
  },
  {
    accentIcon: "👟",
    kicker: "Procedure 18",
    icon: "🦶",
    title: "Complex foot surgery",
    caption: "Foot surgery can be risky because even a small recovery problem may affect balance, walking, wound healing, and the ability to manage safely at home.",
    question: "How long would I need help walking, dressing, bathing, or getting around the house?",
    style: "shadow",
  },
  {
    accentIcon: "🥗",
    kicker: "Procedure 19",
    icon: "⚖️",
    title: "Weight-loss surgery",
    caption: "Later in life, weight-loss surgery can raise concerns around nutrition, muscle loss, medication changes, dehydration, and the need for long-term follow-up.",
    question: "How will nutrition, strength, and medication routines be protected afterward?",
    style: "cloud",
  },
  {
    accentIcon: "🎯",
    kicker: "Procedure 20",
    icon: "❔",
    title: "Any procedure without a clear goal",
    caption: "If the goal is unclear, the risk is taking on anesthesia, recovery, cost, stress, or complications without knowing what meaningful improvement is expected.",
    question: "What exact problem are we solving, and how will we know it worked?",
    style: "reflection",
  },
  {
    accentIcon: "🧠",
    kicker: "Procedure 21",
    icon: "🩸",
    title: "Carotid artery procedures",
    caption: "These procedures can reduce risk for some people, but they may also involve stroke, bleeding, nerve injury, or unclear benefit when symptoms are absent.",
    question: "Am I having symptoms, or is this based only on a scan result?",
    style: "mirror",
  },
  {
    accentIcon: "🔋",
    kicker: "Procedure 22",
    icon: "💗",
    title: "Pacemaker replacement timing",
    caption: "Device replacement can be routine, but infection, bleeding, lead issues, and changing health goals make timing and expected benefit worth reviewing.",
    question: "What happens if we replace it now, and what happens if we wait?",
    style: "collision",
  },
  {
    accentIcon: "👕",
    kicker: "Procedure 23",
    icon: "💪",
    title: "Shoulder replacement surgery",
    caption: "Shoulder replacement can limit dressing, bathing, lifting, and balance during recovery, so the risk includes temporary dependence as well as surgical complications.",
    question: "Who will help during the first weeks when that arm cannot do much?",
    style: "detail",
  },
  {
    accentIcon: "🍲",
    kicker: "Procedure 24",
    icon: "🦷",
    title: "Complex dental extractions",
    caption: "Dental extractions can be harder with blood thinners, fragile gums, slower healing, infection concerns, and eating problems during recovery.",
    question: "How will eating, medications, bleeding risk, and healing be managed afterward?",
    style: "sun-jump",
  },
  {
    accentIcon: "🛣️",
    kicker: "Procedure 25",
    icon: "🩸",
    title: "Vascular bypass surgery",
    caption: "Bypass surgery can be a major strain on the body, with risks around wounds, clots, infection, heart stress, and a recovery that may take significant energy.",
    question: "Is the goal pain relief, wound healing, limb protection, or improved walking?",
    style: "fountain",
  },
  {
    accentIcon: "🚻",
    kicker: "Procedure 26",
    icon: "💧",
    title: "Bladder procedures",
    caption: "Bladder procedures may affect comfort, urination patterns, infection risk, and daily confidence, so side effects can matter as much as symptom relief.",
    question: "What side effect would be most likely to affect my normal day?",
    style: "shadow",
  },
  {
    accentIcon: "🧴",
    kicker: "Procedure 27",
    icon: "✨",
    title: "Intensive skin treatments",
    caption: "Skin treatments can seem simple, but fragile skin, slow healing, infection risk, scarring, and repeated visits may make them more burdensome.",
    question: "How much aftercare is needed, and what would slow healing down?",
    style: "cloud",
  },
  {
    accentIcon: "🧪",
    kicker: "Procedure 28",
    icon: "💡",
    title: "Experimental procedures",
    caption: "Experimental options can sound hopeful, but the risk is uncertainty: benefits may be unproven, side effects may be less understood, and costs can be high.",
    question: "What proof exists, what is unknown, and what standard option are we comparing it with?",
    style: "reflection",
  },
  {
    accentIcon: "⏳",
    kicker: "Procedure 29",
    icon: "💤",
    title: "Procedures requiring long sedation",
    caption: "Longer sedation can increase concerns around confusion, breathing, falls after discharge, medication interactions, and slower recovery afterward.",
    question: "Can this be done with less sedation, or is the long sedation essential?",
    style: "bird",
  },
  {
    accentIcon: "🔁",
    kicker: "Procedure 30",
    icon: "📋",
    title: "Repeat procedures with limited benefit",
    caption: "When earlier attempts helped only a little, repeating the same approach may add more recovery time, cost, and complication risk without a clear gain.",
    question: "What is different this time that makes a better outcome more likely?",
    style: "pose",
  },
];

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

export function TimedPhotosDemo({ rewardedAdUnitPath }: TimedPhotosDemoProps) {
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
      result = await requestRewardedAd(rewardedAdUnitPath, "procedures_after_70_start");
      if (result === "granted") break;
      if (result === "closed_without_reward") {
        setStartUnlocking(false);
        return;
      }
    }

    setStarted(true);
    setStartUnlocking(false);
    window.setTimeout(() => {
      document.getElementById("timed-gallery-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  async function unlockNextSet() {
    if (unlocking) return;
    setUnlocking(true);
    setStatus("Loading a short ad...");

    let result: RewardedStatus = "unavailable";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      result = await requestRewardedAd(rewardedAdUnitPath, `procedures_after_70_unlock_${visibleCount}`);
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
    <article className="timed-demo legacy-quiz">
      <div className="legacy-main">
        <section className="legacy-card legacy-start">
          <div className="legacy-badge" aria-hidden="true">
            <span>⚠️</span>
          </div>
          <h1>Doctors Often Warn Against These Procedures After 70</h1>
          <p className="legacy-sub">Some of these procedures are more common than you think.</p>
          <div className="timed-meta-row" aria-label="Article details">
            <span>
              <span aria-hidden="true">⏱️</span>
              <strong>3 minute<br />read</strong>
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
            {startUnlocking ? "Loading Ad.." : <><span aria-hidden="true">▶</span> Reveal The List</>}
          </button>
          <div className="legacy-ad-note">
            <span className="legacy-shield" aria-hidden="true">✓</span>
            <span>{startUnlocking ? <>When the ad ends, <b>tap the X</b> in the top right to continue.</> : <>Short ad first - <b>then article starts</b></>}</span>
          </div>
        </section>
      </div>

      {started ? (
        <section id="timed-gallery-start" className="timed-gallery timed-article" aria-label="Procedures after age 70 article">
          <header className="timed-gallery__intro timed-article-header timed-life-intro">
            <h2>Procedures That Should Be Avoided After Age 70</h2>
            <p className="timed-article-byline">By The Rainbow Hub</p>
            <p className="timed-life-summary">
              Some choices sound simple until recovery, side effects, sedation, and daily independence enter the picture. Here is what to pause over - and the question worth asking first.
            </p>
          </header>

          {visibleItems.map((item, index) => (
            <article className="timed-photo-card timed-article-section" id={`timed-photo-${index + 1}`} key={item.kicker}>
              <header className="timed-section-heading">
                <span className="timed-section-number" aria-hidden="true">{index + 1}</span>
                <h3>{item.title}</h3>
              </header>
              <figure className="timed-article-figure">
                <div className={`timed-photo timed-photo--${item.style}`} role="img" aria-label={item.title}>
                <span className="timed-visual-glow" />
                <span className="timed-visual-card">
                  <span className="timed-visual-icon" aria-hidden="true">{item.icon}</span>
                </span>
                <span className="timed-visual-bubble timed-visual-bubble--one" aria-hidden="true">?</span>
                <span className="timed-visual-bubble timed-visual-bubble--two" aria-hidden="true">{item.accentIcon}</span>
                </div>
              </figure>
              <div className="timed-card-copy">
                <div className="timed-risk-box">
                  <strong>Why it can be risky</strong>
                  <p>{item.caption}</p>
                </div>
              </div>
            </article>
          ))}

          {hasMore ? (
            <aside className="timed-unlock" aria-live="polite">
              <p className="timed-kicker">Keep reading</p>
              <h2>Unlock the next {nextCount} procedures</h2>
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
              <p>Use this list as a starting point for questions to ask, not as personal medical advice. For decisions about your own care, speak with a qualified healthcare professional.</p>
            </aside>
          )}
        </section>
      ) : null}
    </article>
  );
}
