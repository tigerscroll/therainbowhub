import type { CSSProperties } from "react";
import { getQuizFooterContent, QuizFooter } from "@/components/QuizFooter";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";
import { siteConfig } from "@/lib/siteConfig";

type QuizRunnerProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  relatedQuizzes?: RelatedQuiz[];
  translations: Translations;
};

type RelatedQuiz = {
  accent: string;
  duration: string;
  href: string;
  icon: string;
  passRate: string;
  summary: string;
  thumbnailAlt?: string;
  thumbnailUrl?: string;
  title: string;
};

const titleAccentTokenPattern = /^(?:\d+(?:\.\d+)?%|\d+\/\d+)$/;
const socialAvatarCount = 50;

function getSocialAvatarUrls(slug: string) {
  const hash = Array.from(slug).reduce((total, char) => total + char.charCodeAt(0), 0);

  return Array.from({ length: 4 }, (_, index) => {
    const avatarNumber = ((hash + index * 11) % socialAvatarCount) + 1;
    return `/images/avatars/social-${String(avatarNumber).padStart(2, "0")}.jpg`;
  });
}

function escapeHtml(value: unknown) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTitleWithAccent(title: string, slug: string) {
  const parts = title.split(/(\d+(?:\.\d+)?%|\d+\/\d+|Country)/g);

  return parts
    .map((part) => (titleAccentTokenPattern.test(part) || (slug === "country-match" && part === "Country") ? `<span>${escapeHtml(part)}</span>` : escapeHtml(part)))
    .join("");
}

function renderSocialProof(value: string) {
  const text = value.trim();
  const countMatch = text.match(/\d[\d\s,.\u00a0'’]*\+?/);

  if (!countMatch || countMatch.index === undefined) {
    return `<strong class="legacy-social__primary">${escapeHtml(text)}</strong>`;
  }

  const personTerms = [
    "people", "personas", "pessoas", "persone", "personnes", "Menschen", "mensen",
    "mennesker", "personer", "ihmistä", "ember", "orang", "người", "kişi",
    "oameni", "osób", "lidí", "žmonių", "cilvēku", "души", "άτομα", "людей",
    "אנשים", "लोगों", "คน", "人以上", "人", "명 이상의 사람들이", "사람들이", "شخص",
  ];
  const qualifierTerms = [
    "Más de ", "Mais de ", "Plus de ", "Oltre ", "Über ", "Yli ", "Hơn ", "Peste ",
    "Ruim ", "ponad ", "понад ", "більше ніж ", "יותר מ-", "أكثر من ", "กว่า ", "超过 ",
  ];
  const numberStart = countMatch.index;
  const numberEnd = numberStart + countMatch[0].length;
  const before = text.slice(0, numberStart);
  const afterNumber = text.slice(numberEnd);
  const qualifier = qualifierTerms.find((term) => before.endsWith(term)) ?? "";
  const boldStart = numberStart - qualifier.length;
  const nearbyAfterNumber = afterNumber.slice(0, 48);
  const personMatch = personTerms
    .map((term) => {
      const index = nearbyAfterNumber.indexOf(term);
      return index >= 0 ? { index, term } : null;
    })
    .filter((item): item is { index: number; term: string } => item !== null)
    .sort((a, b) => a.index - b.index)[0];
  const boldEnd = personMatch ? numberEnd + personMatch.index + personMatch.term.length : numberEnd;
  const bold = text.slice(boldStart, boldEnd).trim();
  const mutedBefore = text.slice(0, boldStart).trim();
  const mutedAfter = text.slice(boldEnd).trim();

  if (!mutedBefore && !mutedAfter) {
    return `<strong class="legacy-social__primary">${escapeHtml(bold)}</strong>`;
  }

  if (!mutedBefore) {
    return `<strong class="legacy-social__primary">${escapeHtml(bold)}</strong> <span class="legacy-social__muted">${escapeHtml(mutedAfter)}</span>`;
  }

  return `<span class="legacy-social__muted">${escapeHtml(mutedBefore)} </span><strong class="legacy-social__primary">${escapeHtml(bold)}</strong>${mutedAfter ? `<span class="legacy-social__muted"> ${escapeHtml(mutedAfter)}</span>` : ""}`;
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function createQuizRunnerHtml(config: {
  quiz: Quiz;
  relatedQuizzes: RelatedQuiz[];
  translations: Translations;
}) {
  const { quiz, relatedQuizzes, translations } = config;
  const displayAdHtml = quiz.slug === "paramedic"
    ? `<div data-js="question-display-ad" class="legacy-display-ad legacy-hidden" aria-hidden="true">
          <div data-js="question-display-ad-slot" class="legacy-display-ad__slot"></div>
        </div>`
    : "";
  const nursingResultStoryHtml = "";
  const landingLines = [quiz.landing.quickStartText, quiz.landing.challengeText]
    .filter((line) => line && line.trim().length > 0)
    .map((line) => escapeHtml(line))
    .join("<br />");
  const startCtaLabel = quiz.landing.ctaLabel ?? translations.quiz.startTest;
  const adGateCopy = {
    beforeTitle: translations.rewardedAd.gate?.beforeTitle ?? translations.quiz.shortAd,
    stepOne: translations.rewardedAd.gate?.stepOne ?? translations.rewardedAd.helper,
    stepTwo: translations.rewardedAd.gate?.stepTwo ?? translations.quiz.thenBegins,
  };
  const avatarHtml = getSocialAvatarUrls(quiz.slug)
    .map(
      (url) =>
        `<span class="legacy-avatar" style="background-image:url('${escapeHtml(url)}')"></span>`,
    )
    .join("");
  const relatedHtml = relatedQuizzes.length
    ? `<div data-js="related-quizzes" class="legacy-related">
          <h3>${escapeHtml(translations.quiz.tryAnotherChallenge)}</h3>
          <div class="legacy-related-grid">
            ${relatedQuizzes
              .map((item) => {
                const media = item.thumbnailUrl
                  ? `<img data-related-src="${escapeHtml(item.thumbnailUrl)}" alt="${escapeHtml(item.thumbnailAlt ?? item.title)}" loading="lazy" decoding="async" />`
                  : `<span aria-hidden="true">${escapeHtml(item.icon)}</span>`;

                return `<a class="legacy-related-card" href="${escapeHtml(item.href)}" style="--related-accent:${escapeHtml(item.accent)}">
                  <div class="legacy-related-card__media">${media}</div>
                  <strong>${escapeHtml(item.title)}</strong>
                  <em>${escapeHtml(item.duration)} • ${escapeHtml(translations.home.passRate)} ${escapeHtml(item.passRate)}</em>
                </a>`;
              })
              .join("")}
          </div>
        </div>`
    : "";

  return `<section data-screen="start" class="legacy-card legacy-start">
        <div class="legacy-badge" aria-hidden="true"><span>${escapeHtml(quiz.cardIcon)}</span></div>
        <h1>${renderTitleWithAccent(quiz.pageTitle, quiz.slug)}</h1>
        <p class="legacy-sub">${landingLines}</p>
        <div class="legacy-social">
          <div class="legacy-avatars" aria-hidden="true">
            ${avatarHtml}
          </div>
          <div class="legacy-social__text">${renderSocialProof(quiz.landing.socialProof)}</div>
        </div>
        <button class="legacy-primary" type="button" data-action="start">
          <span aria-hidden="true">▶</span> ${escapeHtml(startCtaLabel)}
        </button>
        <div class="legacy-ad-status" data-js="start-ad-status" aria-live="polite"></div>
        <div class="legacy-ad-note" data-js="start-ad-note">
          <span class="legacy-shield" aria-hidden="true">✓</span>
          <span>${escapeHtml(translations.quiz.shortAd)} — <b>${escapeHtml(translations.quiz.thenBegins)}</b></span>
        </div>
      </section>

      <section data-screen="start-ad-gate" class="legacy-card legacy-start-ad-gate legacy-hidden">
        <div class="legacy-start-ad-gate__play" aria-hidden="true"><span>▶</span></div>
        <h2>${escapeHtml(adGateCopy.beforeTitle)}</h2>
        <div class="legacy-start-ad-gate__steps">
          <div class="legacy-start-ad-gate__step">
            <span>1</span>
            <p>${escapeHtml(adGateCopy.stepOne)}</p>
          </div>
          <div class="legacy-start-ad-gate__step">
            <span>2</span>
            <p>${escapeHtml(adGateCopy.stepTwo)}</p>
          </div>
        </div>
        <button type="button" data-action="start-gate-continue" class="legacy-primary">
          ${escapeHtml(translations.quiz.continue)} →
        </button>
        <div class="legacy-ad-status" data-js="start-gate-ad-status" aria-live="polite"></div>
      </section>

      <section data-screen="question" class="legacy-hidden">
        <div class="legacy-progress">
          <div class="legacy-progress__row">
            <strong data-js="round-label"></strong>
            <span data-js="count-label"></span>
          </div>
          <div data-js="progress-dots" class="legacy-progress-dots" aria-hidden="true"></div>
        </div>

        <article class="legacy-card legacy-question">
          <h2 data-js="question-card" class="legacy-question-prompt legacy-bg-blue">
            <span data-js="question-text" class="legacy-question-text"></span>
          </h2>
          <div data-js="visual" class="legacy-visual legacy-hidden"></div>
          ${displayAdHtml}
          <div data-js="answers" class="legacy-answers"></div>
        </article>
      </section>

      <section data-screen="stage-gate" class="legacy-card legacy-result legacy-stage-result legacy-hidden">
        <div class="legacy-stage-heading">
          <span data-js="stage-icon" class="legacy-stage-emoji" aria-hidden="true">✅</span>
          <h2 data-js="stage-title"></h2>
        </div>
        <p data-js="stage-copy" class="legacy-stage-copy"></p>
        <div data-js="stage-next" class="legacy-stage-next">
          <span data-js="stage-next-label"></span>
          <strong data-js="stage-next-name"></strong>
        </div>
        <div class="legacy-stage-stats">
          <div>
            <span><strong data-js="stage-round-score"></strong><em data-js="stage-round-score-label">${escapeHtml(translations.results.roundResult)}</em></span>
            <span><strong data-js="stage-score"></strong><em data-js="stage-score-label">${escapeHtml(translations.results.scoreSoFar)}</em></span>
          </div>
        </div>
        <div data-js="stage-trail" class="legacy-stage-trail" aria-hidden="true"></div>
        <button type="button" data-js="stage-button" data-action="stage-continue" class="legacy-primary legacy-stage-button"></button>
        <div class="legacy-ad-status" data-js="stage-ad-status" aria-live="polite"></div>
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">i</span>
          <span>${escapeHtml(translations.rewardedAd.helper)}</span>
        </div>
      </section>

      <section data-screen="result-gate" class="legacy-card legacy-result legacy-result-gate legacy-hidden">
        <div class="legacy-result-celebration" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <span data-js="result-gate-badge" class="legacy-profile-badge">${escapeHtml(translations.quiz.profileReady)}</span>
        <h2 data-js="result-gate-title"></h2>
        <p data-js="result-gate-copy" class="legacy-result-gate-copy legacy-hidden"></p>
        <button type="button" data-js="result-gate-button" data-action="reveal-results" class="legacy-primary"></button>
        <div class="legacy-ad-status" data-js="result-ad-status" aria-live="polite"></div>
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">i</span>
          <span>${escapeHtml(translations.rewardedAd.helper)}</span>
        </div>
      </section>

      <section data-screen="results" class="legacy-card legacy-result legacy-hidden">
        <div class="legacy-result-hero">
          <div class="legacy-result-medal" aria-hidden="true">
            <span>🏆</span>
          </div>
          <span data-js="result-profile-badge" class="legacy-profile-badge"></span>
          <h2 data-js="result-title"></h2>
          <p data-js="result-copy" class="legacy-sub"></p>
        </div>
        <div class="legacy-result-scoreboard">
          <div class="legacy-score legacy-score-primary">
            <strong data-js="final-score"></strong>
            <span data-js="final-score-label">${escapeHtml(translations.quiz.finalScore)}</span>
          </div>
          <div class="legacy-score">
            <strong data-js="percentile"></strong>
            <span data-js="percentile-label">${escapeHtml(translations.quiz.profile)}</span>
          </div>
        </div>
        <div class="legacy-result-meter" aria-hidden="true"><span data-js="result-meter-fill"></span></div>
        <div data-js="cognitive-scores" class="legacy-cognitive-scores"></div>
        <div data-js="stage-breakdown" class="legacy-stage-breakdown"></div>
        ${nursingResultStoryHtml}
        <div class="legacy-unlock-panel">
          <h3 data-js="unlock-title"></h3>
          <p data-js="unlock-copy"></p>
          <button type="button" data-js="unlock-button" data-action="unlock-review" class="legacy-primary"></button>
          <div class="legacy-ad-status" data-js="unlock-ad-status" aria-live="polite"></div>
        </div>
        <div data-js="review" class="legacy-review"></div>
        ${relatedHtml}
      </section>
      <div data-js="ad-early-close-modal" class="legacy-ad-modal legacy-hidden" role="dialog" aria-modal="true" aria-labelledby="ad-early-close-title">
        <div class="legacy-ad-modal__panel">
          <h3 id="ad-early-close-title">${escapeHtml(translations.rewardedAd.earlyClose.title)}</h3>
          <p>${escapeHtml(translations.rewardedAd.earlyClose.body)}</p>
          <button type="button" data-action="ad-early-close-retry" class="legacy-primary">${escapeHtml(translations.rewardedAd.earlyClose.retry)}</button>
        </div>
      </div>`;
}

function createQuizRunnerScript(config: {
  locale: SupportedLocale;
  displayAdUnitPath: string;
  progressKey: string;
  rewardedAdUnitPath: string;
  relatedQuizzes: RelatedQuiz[];
  rootId: string;
  quiz: Quiz;
  translations: Translations;
}) {
  return `
(function () {
  var config = ${safeJson(config)};
  var correctAnswerDelayMs = 950;
  var wrongAnswerDelayMs = 1150;
  var questionBackgrounds = [
    "legacy-bg-blue",
    "legacy-bg-mint",
    "legacy-bg-lavender",
    "legacy-bg-peach",
    "legacy-bg-teal",
    "legacy-bg-yellow",
    "legacy-bg-pink",
    "legacy-bg-sage",
    "legacy-bg-powder",
    "legacy-bg-ivory"
  ];

  function boot() {
    var root = document.getElementById(config.rootId);
    if (!root || root.dataset.booted === "true") return;
    root.dataset.booted = "true";

    var quiz = config.quiz;
    var t = config.translations;
    var isPersonalityQuiz = quiz.mode === "personality";
    var isHarvard2Quiz = quiz.slug === "harvard2";
    var isOxford2Quiz = quiz.slug === "oxford2";
    var isCambridge2Quiz = quiz.slug === "cambridge2";
    var isAirforceQuiz = quiz.slug === "airforce";
    var isNavyQuiz = quiz.slug === "navy";
    var isMemoryQuiz = quiz.slug === "memory";
    var isConnectionQuiz = quiz.slug === "connection";
    var isParamedicQuiz = quiz.slug === "paramedic";
    var isUniversityEntranceQuiz = isHarvard2Quiz || isOxford2Quiz || isCambridge2Quiz || isAirforceQuiz || isNavyQuiz;
    var usesRoundCheckpointFlow = isUniversityEntranceQuiz || isMemoryQuiz || isConnectionQuiz || quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic";
    var isShortLockedScoreQuiz = quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || isUniversityEntranceQuiz || isMemoryQuiz || isConnectionQuiz;
    var usesCompactProgress = isShortLockedScoreQuiz;
    var autoStartQuiz = false;
    var hideAnswerFeedback = isShortLockedScoreQuiz;
    var skipFinalRewardedGate = false;
    var skipStageRewardedGates = false;
    var autoCloseRewardedOnGrant = isUniversityEntranceQuiz || isMemoryQuiz || isConnectionQuiz || quiz.slug === "anatomy2" || isParamedicQuiz;
    var useQuestionDisplayAd = isParamedicQuiz;
    var useDisplayAds = useQuestionDisplayAd;
    var isLargeQuestionDisplayVariant = isParamedicQuiz;
    var current = 0;
    var answers = {};
    var advanceTimer = null;
    var hasUnlockedReview = false;
    var harvardStageResultPending = false;
    var harvardStageResultReady = false;
    var useStartAdGate = false;
    var activeRewardedAd = null;
    var rewardedListenersInstalled = false;
    var displayAdRequestLimit = 8;
    var displayAdRequestWindowMs = 60000;
    var displayAdRequestTimestampsKey = "rainbowhub.displayAdRequests";
    var questionDisplayAdLastRefreshStep = -1;
    var questionDisplayAdSlot = null;
    var questionDisplayAdLoaded = false;
    var googlePublisherServicesEnabled = false;
    var rewardedRequestId = 0;
    var rewardedGrantedCountKey = "rainbowhub.rewardedGrantedCount";
    var rewardedClosedCountKey = "rainbowhub.rewardedClosedCount";
    var rewardTrackedKey = "rainbowhub.rewardTracked";
    var reward2TrackedKey = "rainbowhub.reward2Tracked";
    var rewardClosedTrackedKey = "rainbowhub.rewardClosedTracked";
    var rewardClosed2TrackedKey = "rainbowhub.rewardClosed2Tracked";
    var quizStartTrackedKey = "rainbowhub.quizStartTracked:" + quiz.slug;
    var quizRewardPlacementsKey = "rainbowhub.quizRewardPlacements:" + quiz.slug;
    var quizResultsTrackedKey = "rainbowhub.quizResultsTracked:" + quiz.slug;
    var rewardedGrantedCount = readSessionNumber(rewardedGrantedCountKey, 0);
    var rewardedClosedCount = readSessionNumber(rewardedClosedCountKey, 0);
    var rewardTracked = readSessionFlag(rewardTrackedKey);
    var reward2Tracked = readSessionFlag(reward2TrackedKey);
    var rewardClosedTracked = readSessionFlag(rewardClosedTrackedKey);
    var rewardClosed2Tracked = readSessionFlag(rewardClosed2TrackedKey);
    var quizStartTracked = readSessionFlag(quizStartTrackedKey);
    var quizResultsTracked = readSessionFlag(quizResultsTrackedKey);
    var googlePublisherTagUrl = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    var preloadedVisuals = {};
    var retryRewardedAction = null;

    if (config.rewardedAdUnitPath || useDisplayAds) {
      window.googletag = window.googletag || { cmd: [] };
    }

    try {
      useStartAdGate = Boolean(config.rewardedAdUnitPath) && new URLSearchParams(window.location.search).get("gate") === "1";
    } catch (error) {}

    var screens = {
      start: root.querySelector('[data-screen="start"]'),
      startAdGate: root.querySelector('[data-screen="start-ad-gate"]'),
      question: root.querySelector('[data-screen="question"]'),
      stageGate: root.querySelector('[data-screen="stage-gate"]'),
      resultGate: root.querySelector('[data-screen="result-gate"]'),
      results: root.querySelector('[data-screen="results"]')
    };

    function byData(name) {
      return root.querySelector('[data-js="' + name + '"]');
    }

    function setAdStatus(name, message) {
      var status = byData(name);
      if (status) {
        status.textContent = message || "";
      }
    }

    function clearAdStatuses(exceptName) {
      ["start-ad-status", "start-gate-ad-status", "stage-ad-status", "result-ad-status", "unlock-ad-status"].forEach(function (name) {
        if (name === exceptName) return;
        setAdStatus(name, "");
      });
    }

    function canUseEarlyCloseModal() {
      return Boolean(byData("ad-early-close-modal"));
    }

    function showEarlyCloseModal() {
      var modal = byData("ad-early-close-modal");
      if (!modal) return false;
      modal.classList.remove("legacy-hidden");
      var retryButton = root.querySelector('[data-action="ad-early-close-retry"]');
      if (retryButton && retryButton.focus) {
        window.setTimeout(function () {
          retryButton.focus();
        }, 0);
      }
      return true;
    }

    function hideEarlyCloseModal() {
      var modal = byData("ad-early-close-modal");
      if (modal) modal.classList.add("legacy-hidden");
    }

    if (useStartAdGate && byData("start-ad-note")) {
      byData("start-ad-note").classList.add("legacy-hidden");
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function clearAdvanceTimer() {
      if (advanceTimer) {
        window.clearTimeout(advanceTimer);
        advanceTimer = null;
      }
    }

    function show(screenName, shouldScroll) {
      Object.keys(screens).forEach(function (key) {
        if (screens[key]) {
          screens[key].classList.toggle("legacy-hidden", key !== screenName);
        }
      });

      if (screenName === "stageGate" && screens.stageGate) {
        screens.stageGate.classList.remove("legacy-stage-result");
        void screens.stageGate.offsetWidth;
        screens.stageGate.classList.add("legacy-stage-result");
      }

      void shouldScroll;
    }

    function scrollToPageTop() {
      window.requestAnimationFrame(function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    function normalizeAnswers(savedAnswers) {
      var nextAnswers = {};
      if (!savedAnswers || typeof savedAnswers !== "object") return nextAnswers;
      Object.keys(savedAnswers).forEach(function (key) {
        var index = Number(key);
        var value = savedAnswers[key];
        if (Number.isInteger(index) && typeof value === "number") {
          nextAnswers[index] = value;
        }
      });
      return nextAnswers;
    }

    function saveProgress(nextScreen) {
      try {
        window.localStorage.setItem(config.progressKey, JSON.stringify({
          answers: answers,
          currentQuestion: current,
          screen: nextScreen,
          timestamp: Date.now()
        }));
      } catch (error) {}
    }

    function clearProgress() {
      try {
        window.localStorage.removeItem(config.progressKey);
      } catch (error) {}
    }

    function getResumePointAfterAnsweredQuestion(questionIndex) {
      var answeredQuestion = quiz.questions[questionIndex];
      var nextQuestion = quiz.questions[questionIndex + 1];

      if (!answeredQuestion || !nextQuestion) {
        return { currentQuestion: questionIndex, screen: "resultGate" };
      }

      if ((nextQuestion.stage || 0) !== (answeredQuestion.stage || 0)) {
        return { currentQuestion: questionIndex + 1, screen: "stageGate" };
      }

      return { currentQuestion: questionIndex + 1, screen: "question" };
    }

    function readSessionNumber(key, fallback) {
      try {
        var stored = window.sessionStorage.getItem(key);
        var parsed = Number(stored);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
      } catch (error) {
        return fallback;
      }
    }

    function readSessionFlag(key) {
      try {
        return window.sessionStorage.getItem(key) === "1";
      } catch (error) {
        return false;
      }
    }

    function writeSessionValue(key, value) {
      try {
        window.sessionStorage.setItem(key, String(value));
      } catch (error) {}
    }

    function readSessionJsonArray(key) {
      try {
        var parsed = JSON.parse(window.sessionStorage.getItem(key) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }

    function canRequestDisplayAd() {
      if (!useDisplayAds) return false;

      var now = Date.now();
      var recent = readSessionJsonArray(displayAdRequestTimestampsKey).filter(function (timestamp) {
        return typeof timestamp === "number" && Number.isFinite(timestamp) && now - timestamp < displayAdRequestWindowMs;
      });

      if (recent.length >= displayAdRequestLimit) {
        writeSessionValue(displayAdRequestTimestampsKey, JSON.stringify(recent));
        return false;
      }

      recent.push(now);
      writeSessionValue(displayAdRequestTimestampsKey, JSON.stringify(recent));
      return true;
    }

    function trackFbqCustomEventOnce(eventName, data, trackedKey) {
      if (readSessionFlag(trackedKey)) return true;
      writeSessionValue(trackedKey, "1");
      try { console.log("fbq custom event: " + eventName, data); } catch (error) {}
      try { window.fbq?.("trackCustom", eventName, data); } catch (error) {}
      return true;
    }

    function readQuizRewardPlacements() {
      var placements = readSessionJsonArray(quizRewardPlacementsKey);
      return placements.filter(function (placement) {
        return typeof placement === "string" && placement.length > 0;
      });
    }

    function writeQuizRewardPlacements(placements) {
      try {
        window.sessionStorage.setItem(quizRewardPlacementsKey, JSON.stringify(placements));
      } catch (error) {}
    }

    function rememberQuizRewardPlacement(placement) {
      if (!placement) return;
      var placements = readQuizRewardPlacements();
      if (placements.indexOf(placement) !== -1) return;
      placements.push(placement);
      writeQuizRewardPlacements(placements);
    }

    function hasRequiredResultsRewards() {
      var placements = readQuizRewardPlacements();
      return placements.indexOf("before_start") !== -1 && placements.indexOf("before_final_results") !== -1;
    }

    function trackResultsEvent() {
      if (quizResultsTracked || !hasRequiredResultsRewards()) return;
      quizResultsTracked = trackFbqCustomEventOnce("Results", {
        quiz_slug: quiz.slug,
        quiz_title: quiz.title,
        question_count: quiz.questions.length,
        rewarded_before_results: 2,
        rewarded_placements: readQuizRewardPlacements()
      }, quizResultsTrackedKey);
    }

    function trackRewardGranted(payload) {
      var data = payload || {};
      rewardedGrantedCount += 1;
      writeSessionValue(rewardedGrantedCountKey, rewardedGrantedCount);
      rememberQuizRewardPlacement(data.placement);
      data.reward_count = rewardedGrantedCount;
      if (!rewardTracked) {
        rewardTracked = trackFbqCustomEventOnce("Reward", data, rewardTrackedKey);
      }

      if (rewardedGrantedCount >= 2 && !reward2Tracked) {
        reward2Tracked = true;
        trackFbqCustomEventOnce("Reward2", data, reward2TrackedKey);
      }
    }

    function trackRewardClosed(payload) {
      var data = payload || {};
      if (data.granted === true && data.reason === "reward_granted") {
        rewardedClosedCount += 1;
        writeSessionValue(rewardedClosedCountKey, rewardedClosedCount);
        data.reward_count = rewardedGrantedCount;
        data.reward_closed_count = rewardedClosedCount;
        if (!rewardClosedTracked) {
          rewardClosedTracked = trackFbqCustomEventOnce("RewardClosed", data, rewardClosedTrackedKey);
        }

        if (rewardedClosedCount >= 2 && !rewardClosed2Tracked) {
          rewardClosed2Tracked = true;
          trackFbqCustomEventOnce("RewardClosed2", data, rewardClosed2TrackedKey);
        }
      }
    }

    function trackEngaged(source, payload) {
      if (quizStartTracked) return;
      var data = payload || {};
      data.engagement_source = source;
      data.quiz_slug = quiz.slug;
      data.quiz_title = quiz.title;
      data.question_count = quiz.questions.length;
      quizStartTracked = trackFbqCustomEventOnce("Engaged", data, quizStartTrackedKey);
    }

    function trackQuizStart() {
      trackEngaged("question_1_completed", {
        quiz_slug: quiz.slug,
        quiz_title: quiz.title,
        question_count: quiz.questions.length
      });
    }

    function finishRewardedAd(status, reason) {
      var request = activeRewardedAd;
      if (!request) return;
      var granted = status === "granted";
      var closedWithoutReward = status === "closed_without_reward";
      var unavailable = status === "unavailable";

      activeRewardedAd = null;
      window.clearTimeout(request.failTimer);

      if (request.slot && window.googletag?.cmd) {
        try {
          window.googletag.cmd.push(function () {
            try { window.googletag.destroySlots([request.slot]); } catch (error) {}
          });
        } catch (error) {}
      }

      trackRewardClosed({
        placement: request.placement,
        fallback: unavailable,
        granted: granted,
        reason: reason,
        ad_unit_path: config.rewardedAdUnitPath
      });

      request.resolve({
        reason: reason,
        status: granted ? "granted" : closedWithoutReward ? "closed_without_reward" : "unavailable"
      });
    }

    function ensureRewardedListeners() {
      if (rewardedListenersInstalled || !window.googletag?.pubads) return;

      var pubads = window.googletag.pubads();

      pubads.addEventListener("rewardedSlotReady", function (event) {
        var request = activeRewardedAd;
        if (!request || event.slot !== request.slot) return;

        request.ready = true;
        window.clearTimeout(request.failTimer);

        try {
          event.makeRewardedVisible();
          trackEngaged("rewarded_ad_initiated", {
            placement: request.placement,
            fallback: false,
            ad_unit_path: config.rewardedAdUnitPath
          });
        } catch (error) {
          finishRewardedAd("unavailable", "make_visible_failed");
        }
      });

      pubads.addEventListener("rewardedSlotGranted", function (event) {
        var request = activeRewardedAd;
        if (!request || event.slot !== request.slot) return;

        request.granted = true;
        trackRewardGranted({
          placement: request.placement,
          fallback: false,
          ad_unit_path: config.rewardedAdUnitPath
        });

        if (autoCloseRewardedOnGrant) {
          finishRewardedAd("granted", "reward_granted");
        }
      });

      pubads.addEventListener("rewardedSlotClosed", function (event) {
        var request = activeRewardedAd;
        if (!request || event.slot !== request.slot) return;

        finishRewardedAd(request.granted ? "granted" : "closed_without_reward", request.granted ? "reward_granted" : "closed_without_reward");
      });

      rewardedListenersInstalled = true;
    }

    function loadGooglePublisherTag() {
      if (typeof window.googletag?.defineOutOfPageSlot === "function") return;
      if (document.querySelector('script[data-rainbow-gpt-loader="true"], script[src*="securepubads.g.doubleclick.net/tag/js/gpt.js"]')) return;

      var script = document.createElement("script");
      script.async = true;
      script.src = googlePublisherTagUrl;
      script.setAttribute("data-rainbow-gpt-loader", "true");
      document.head.appendChild(script);
    }

    function ensureGooglePublisherServices() {
      if (googlePublisherServicesEnabled) return;
      window.googletag.enableServices();
      googlePublisherServicesEnabled = true;
    }

    function ensureQuestionDisplayAd() {
      if (!useQuestionDisplayAd || questionDisplayAdLoaded) return;

      var displayWrap = byData("question-display-ad");
      var slotElement = byData("question-display-ad-slot");
      if (!displayWrap || !slotElement) return;

      var slotId = config.rootId + "-question-display-ad";
      slotElement.id = slotId;

      window.googletag = window.googletag || { cmd: [] };
      loadGooglePublisherTag();

      try {
        window.googletag.cmd.push(function () {
          if (questionDisplayAdLoaded || !window.googletag?.defineSlot) return;

          try {
            if (!canRequestDisplayAd()) return;

            var questionDisplayAdSizes = isLargeQuestionDisplayVariant ? [[336, 280], [300, 250]] : [300, 250];
            questionDisplayAdSlot = window.googletag.defineSlot(config.displayAdUnitPath, questionDisplayAdSizes, slotId);
            if (!questionDisplayAdSlot) return;

            questionDisplayAdSlot.addService(window.googletag.pubads());
            ensureGooglePublisherServices();
            window.googletag.display(slotId);
            questionDisplayAdLoaded = true;
            displayWrap.classList.add("is-loaded");
          } catch (error) {}
        });
      } catch (error) {}
    }

    function refreshQuestionDisplayAdForQuestion(questionIndex) {
      if (!useQuestionDisplayAd) return;
      var displayWrap = byData("question-display-ad");
      var shouldShowDisplayAd = !isLargeQuestionDisplayVariant || questionIndex >= 1;
      if (displayWrap) displayWrap.classList.toggle("legacy-hidden", !shouldShowDisplayAd);
      if (!shouldShowDisplayAd) return;

      ensureQuestionDisplayAd();
      if (!questionDisplayAdLoaded || !questionDisplayAdSlot || questionIndex < 2) return;

      var refreshStep = questionIndex;
      if (questionDisplayAdLastRefreshStep === refreshStep) return;
      questionDisplayAdLastRefreshStep = refreshStep;

      try {
        window.googletag.cmd.push(function () {
          try {
            if (!canRequestDisplayAd()) return;
            window.googletag.pubads().refresh([questionDisplayAdSlot]);
          } catch (error) {}
        });
      } catch (error) {}
    }

    function requestRewardedAdOnce(placement) {
      if (!config.rewardedAdUnitPath) {
        return Promise.resolve({ status: "unavailable", reason: "missing_ad_unit_path" });
      }

      if (activeRewardedAd) {
        return Promise.resolve({ status: "unavailable", reason: "ad_request_already_active" });
      }

      return new Promise(function (resolve) {
        var requestId = ++rewardedRequestId;

        window.googletag = window.googletag || { cmd: [] };
        loadGooglePublisherTag();
        activeRewardedAd = {
          granted: false,
          placement: placement,
          ready: false,
          requestId: requestId,
          resolve: resolve,
          slot: null,
          failTimer: window.setTimeout(function () {
            if (activeRewardedAd && activeRewardedAd.requestId === requestId && !activeRewardedAd.ready) {
              finishRewardedAd("unavailable", "no_rewarded_ad");
            }
          }, 8000)
        };

        try {
          window.googletag.cmd.push(function () {
            var request = activeRewardedAd;
            if (!request || request.requestId !== requestId) return;

            try {
              ensureRewardedListeners();

              try { window.googletag.pubads()?.updateCorrelator?.(); } catch (error) {}

              var slot = window.googletag.defineOutOfPageSlot(
                config.rewardedAdUnitPath,
                window.googletag.enums.OutOfPageFormat.REWARDED
              );

              if (!slot) {
                finishRewardedAd("unavailable", "slot_unavailable");
                return;
              }

              request.slot = slot;
              slot.addService(window.googletag.pubads());

              ensureGooglePublisherServices();

              window.googletag.display(slot);
            } catch (error) {
              finishRewardedAd("unavailable", "request_error");
            }
          });
        } catch (error) {
          finishRewardedAd("unavailable", "gpt_queue_error");
        }
      });
    }

    function requestRewardedAd(placement, onStatus) {
      var maxUnavailableAttempts = 3;
      var unavailableAttempts = 0;

      return new Promise(function (resolve) {
        function setStatus(message) {
          if (typeof onStatus === "function") {
            onStatus(message);
          }
        }

        function proceedWithoutAd(reason) {
          resolve(true);
        }

        function tryAd() {
          requestRewardedAdOnce(placement).then(function (result) {
            if (result.status === "granted") {
              resolve(true);
              return;
            }

            if (result.status === "closed_without_reward") {
              if (!canUseEarlyCloseModal() || !showEarlyCloseModal()) {
                setStatus(t.rewardedAd.status.closedWithoutReward);
              }
              resolve(false);
              return;
            }

            unavailableAttempts += 1;
            if (unavailableAttempts >= maxUnavailableAttempts) {
              proceedWithoutAd("no_rewarded_ad_after_3_attempts");
              return;
            }

            setStatus(formatTemplate(t.rewardedAd.status.retryUnavailable, {
              attempt: unavailableAttempts + 1,
              max: maxUnavailableAttempts
            }));
            window.setTimeout(tryAd, 450);
          });
        }

        tryAd();
      });
    }

    function getVisualImageSrc(visualHtml) {
      if (!visualHtml || typeof window.Image !== "function") return "";
      var match = String(visualHtml).match(/<img\\b[^>]*\\bsrc=(["'])(.*?)\\1/i);
      return match ? match[2] : "";
    }

    function getSafeVisualImage(visualHtml) {
      if (!visualHtml) return null;
      var source = String(visualHtml).trim();
      var match = source.match(/^<img\\s+class=(["'])legacy-question-image\\1\\s+src=(["'])(\\/quizzes\\/[a-z0-9-]+\\/images\\/[a-z0-9._-]+\\.(?:png|jpg|jpeg|webp))\\2\\s+alt=(["'])([^"']*)\\4\\s*\\/>$/i);
      if (!match) return null;
      return { src: match[3], alt: match[5] };
    }

    function renderQuestionVisual(visualBox, visualHtml) {
      var imageData = getSafeVisualImage(visualHtml);
      visualBox.replaceChildren();

      if (!imageData) {
        visualBox.classList.add("legacy-hidden");
        return;
      }

      var image = document.createElement("img");
      image.className = "legacy-question-image";
      image.src = imageData.src;
      image.alt = imageData.alt;
      image.loading = "eager";
      image.decoding = "async";
      visualBox.appendChild(image);
      visualBox.classList.remove("legacy-hidden");
    }

    function preloadQuestionVisual(questionIndex) {
      var question = quiz.questions[questionIndex];
      var src = question ? getVisualImageSrc(question.visual) : "";
      if (!src || preloadedVisuals[src]) return;
      preloadedVisuals[src] = true;
      var image = new Image();
      image.src = src;
    }

    function preloadUpcomingQuestionVisuals(startIndex, count) {
      for (var offset = 0; offset < count; offset += 1) {
        preloadQuestionVisual(startIndex + offset);
      }
    }

    function getStageIndexes() {
      return Array.from(new Set(quiz.questions.map(function (question) {
        return question.stage || 0;
      }))).sort(function (a, b) { return a - b; });
    }

    function getQuestionStage(questionIndex) {
      return quiz.questions[questionIndex]?.stage || 0;
    }

    function getStageName(stage) {
      return quiz.stages[stage] || quiz.stages[0] || quiz.title;
    }

    function titleCaseCategory(category) {
      return category.split("-").map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }).join(" ");
    }

    function getShortLockedCategoryLabel(category) {
      if (!category) return "";
      var labels = {
        nursing2: {
          en: {
            "hand-hygiene": "Hand hygiene",
            "fall-safety": "Fall safety",
            "privacy": "Privacy",
            "identity-check": "Identity check",
            "reading-check": "Reading check",
            "medicine-check": "Medicine check",
            "condition-change": "Condition change",
            "confidentiality": "Confidentiality",
            "urgent-priority": "Urgent priority",
            "breathing-priority": "Breathing priority"
          },
          nl: {
            "hand-hygiene": "Handhygiene",
            "fall-safety": "Valveiligheid",
            "privacy": "Privacy",
            "identity-check": "Identiteitscontrole",
            "reading-check": "Meting controleren",
            "medicine-check": "Medicatiecontrole",
            "condition-change": "Verandering in toestand",
            "confidentiality": "Vertrouwelijkheid",
            "urgent-priority": "Urgente prioriteit",
            "breathing-priority": "Ademhalingsprioriteit"
          },
          de: {
            "hand-hygiene": "Handhygiene",
            "fall-safety": "Sturzsicherheit",
            "privacy": "Datenschutz",
            "identity-check": "Identitätskontrolle",
            "reading-check": "Messwert prüfen",
            "medicine-check": "Medikamentencheck",
            "condition-change": "Zustandsänderung",
            "confidentiality": "Vertraulichkeit",
            "urgent-priority": "Dringende Priorität",
            "breathing-priority": "Atempriorität"
          }
        },
        anatomy2: {
          en: {
            "body-basics": "Body basics",
            "skeletal": "Bones",
            "muscular": "Muscles",
            "circulatory": "Heart and blood",
            "respiratory": "Breathing",
            "nervous": "Brain and nerves",
            "digestive": "Digestion",
            "sensory": "Senses",
            "organ-systems": "Organs and systems",
            "terminology": "Anatomy terms"
          }
        },
        harvard2: {
          en: {
            "pattern": "Patterns",
            "number": "Numbers",
            "probability": "Probability",
            "logic": "Logic",
            "deduction": "Deduction",
            "ordering": "Ordering",
            "verbal": "Words",
            "coding": "Code clues",
            "analogy": "Analogies",
            "calendar": "Calendar",
            "time": "Time",
            "geometry": "Geometry",
            "spatial": "Spatial"
          }
        },
        oxford2: {
          en: {
            "pattern": "Patterns",
            "number": "Numbers",
            "probability": "Probability",
            "logic": "Logic",
            "deduction": "Deduction",
            "ordering": "Ordering",
            "verbal": "Words",
            "coding": "Code clues",
            "analogy": "Analogies",
            "calendar": "Calendar",
            "time": "Time",
            "geometry": "Geometry",
            "spatial": "Spatial"
          }
        },
        cambridge2: {
          en: {
            "pattern": "Patterns",
            "number": "Numbers",
            "probability": "Probability",
            "logic": "Logic",
            "deduction": "Deduction",
            "ordering": "Ordering",
            "verbal": "Words",
            "coding": "Code clues",
            "analogy": "Analogies",
            "calendar": "Calendar",
            "time": "Time",
            "geometry": "Geometry",
            "spatial": "Spatial"
          }
        },
        airforce: {
          en: {
            "flight-logic": "Flight logic",
            "aviation-maths": "Air maths",
            "fuel-time": "Fuel and time",
            "map-reading": "Map reading",
            "direction": "Direction",
            "spatial": "Spatial",
            "instrument-focus": "Instruments",
            "attention": "Focus",
            "sequence": "Sequence",
            "priority": "Priority",
            "weather": "Weather",
            "safety": "Safety",
            "analogy": "Analogies"
          }
        },
        navy: {
          en: {
            "navigation": "Navigation",
            "bearing": "Bearings",
            "signals": "Signals",
            "ship-logic": "Ship logic",
            "time-distance": "Time and distance",
            "sequence": "Sequence",
            "attention": "Focus",
            "weather": "Weather",
            "priority": "Priority",
            "spatial": "Spatial",
            "code-clue": "Code clues",
            "safety": "Safety"
          }
        },
        connection: {
          en: {
            "first-pull": "First pull",
            "recognition": "Recognition",
            "safety": "Safety",
            "chemistry": "Chemistry",
            "meaning": "Meaning",
            "trust": "Trust",
            "communication": "Communication",
            "intensity": "Intensity",
            "future": "Future",
            "lessons": "Lessons",
            "conflict": "Conflict",
            "timing": "Timing",
            "growth": "Growth",
            "balance": "Balance",
            "mystery": "Mystery",
            "devotion": "Devotion",
            "intuition": "Intuition",
            "purpose": "Purpose",
            "emotion": "Emotion",
            "best-self": "Best self",
            "bond": "Bond",
            "question": "Question",
            "reveal": "Reveal"
          }
        },
        memory: {
          en: {
            "fact-recall": "Fact recall",
            "general-knowledge": "Quick facts",
            "recent-recall": "Recent recall",
            "detail-recall": "Detail recall",
            "category-memory": "Categories",
            "pattern-memory": "Patterns",
            "long-recall": "Long recall",
            "exclusion-recall": "Memory check"
          },
          ar: {
            "fact-recall": "تذكّر الحقائق",
            "general-knowledge": "حقائق سريعة",
            "recent-recall": "تذكّر حديث",
            "detail-recall": "تذكّر التفاصيل",
            "category-memory": "فئات",
            "pattern-memory": "أنماط",
            "long-recall": "تذكّر بعيد",
            "exclusion-recall": "فحص الذاكرة"
          },
          bg: {
            "fact-recall": "Факти",
            "general-knowledge": "Бързи факти",
            "recent-recall": "Скорошен спомен",
            "detail-recall": "Детайли",
            "category-memory": "Категории",
            "pattern-memory": "Модели",
            "long-recall": "Дълъг спомен",
            "exclusion-recall": "Проверка"
          },
          cs: {
            "fact-recall": "Fakta",
            "general-knowledge": "Rychlá fakta",
            "recent-recall": "Nedávná paměť",
            "detail-recall": "Detaily",
            "category-memory": "Kategorie",
            "pattern-memory": "Vzorce",
            "long-recall": "Dlouhá paměť",
            "exclusion-recall": "Kontrola paměti"
          },
          da: {
            "fact-recall": "Fakta",
            "general-knowledge": "Hurtige fakta",
            "recent-recall": "Nylig hukommelse",
            "detail-recall": "Detaljer",
            "category-memory": "Kategorier",
            "pattern-memory": "Mønstre",
            "long-recall": "Lang hukommelse",
            "exclusion-recall": "Hukommelsestjek"
          },
          de: {
            "fact-recall": "Fakten",
            "general-knowledge": "Schnellwissen",
            "recent-recall": "Kurzzeit-Erinnerung",
            "detail-recall": "Details",
            "category-memory": "Kategorien",
            "pattern-memory": "Muster",
            "long-recall": "Langzeit-Erinnerung",
            "exclusion-recall": "Gedächtnischeck"
          },
          el: {
            "fact-recall": "Γεγονότα",
            "general-knowledge": "Γρήγορες γνώσεις",
            "recent-recall": "Πρόσφατη μνήμη",
            "detail-recall": "Λεπτομέρειες",
            "category-memory": "Κατηγορίες",
            "pattern-memory": "Μοτίβα",
            "long-recall": "Μακρά ανάκληση",
            "exclusion-recall": "Έλεγχος μνήμης"
          },
          es: {
            "fact-recall": "Datos",
            "general-knowledge": "Datos rápidos",
            "recent-recall": "Recuerdo reciente",
            "detail-recall": "Detalles",
            "category-memory": "Categorías",
            "pattern-memory": "Patrones",
            "long-recall": "Recuerdo largo",
            "exclusion-recall": "Comprobación"
          },
          fi: {
            "fact-recall": "Faktat",
            "general-knowledge": "Pikafaktat",
            "recent-recall": "Tuore muisti",
            "detail-recall": "Yksityiskohdat",
            "category-memory": "Kategoriat",
            "pattern-memory": "Kuviot",
            "long-recall": "Pitkä muisti",
            "exclusion-recall": "Muistitarkistus"
          },
          fr: {
            "fact-recall": "Faits",
            "general-knowledge": "Faits rapides",
            "recent-recall": "Mémoire récente",
            "detail-recall": "Détails",
            "category-memory": "Catégories",
            "pattern-memory": "Motifs",
            "long-recall": "Rappel long",
            "exclusion-recall": "Vérification"
          },
          he: {
            "fact-recall": "זכירת עובדות",
            "general-knowledge": "עובדות מהירות",
            "recent-recall": "זיכרון קרוב",
            "detail-recall": "פרטים",
            "category-memory": "קטגוריות",
            "pattern-memory": "דפוסים",
            "long-recall": "זיכרון ארוך",
            "exclusion-recall": "בדיקת זיכרון"
          },
          hi: {
            "fact-recall": "तथ्य याद",
            "general-knowledge": "त्वरित तथ्य",
            "recent-recall": "हाल की याद",
            "detail-recall": "विवरण",
            "category-memory": "श्रेणियां",
            "pattern-memory": "पैटर्न",
            "long-recall": "लंबी याद",
            "exclusion-recall": "स्मृति जांच"
          },
          hu: {
            "fact-recall": "Tények",
            "general-knowledge": "Gyors tények",
            "recent-recall": "Friss emlék",
            "detail-recall": "Részletek",
            "category-memory": "Kategóriák",
            "pattern-memory": "Minták",
            "long-recall": "Hosszú emlék",
            "exclusion-recall": "Memóriaellenőrzés"
          },
          id: {
            "fact-recall": "Ingat fakta",
            "general-knowledge": "Fakta cepat",
            "recent-recall": "Ingat baru",
            "detail-recall": "Detail",
            "category-memory": "Kategori",
            "pattern-memory": "Pola",
            "long-recall": "Ingat lama",
            "exclusion-recall": "Cek memori"
          },
          it: {
            "fact-recall": "Fatti",
            "general-knowledge": "Fatti rapidi",
            "recent-recall": "Ricordo recente",
            "detail-recall": "Dettagli",
            "category-memory": "Categorie",
            "pattern-memory": "Schemi",
            "long-recall": "Ricordo lungo",
            "exclusion-recall": "Controllo memoria"
          },
          ja: {
            "fact-recall": "事実の記憶",
            "general-knowledge": "クイック知識",
            "recent-recall": "直前の記憶",
            "detail-recall": "詳細記憶",
            "category-memory": "カテゴリー",
            "pattern-memory": "パターン",
            "long-recall": "長期記憶",
            "exclusion-recall": "記憶チェック"
          },
          ko: {
            "fact-recall": "사실 기억",
            "general-knowledge": "빠른 상식",
            "recent-recall": "최근 회상",
            "detail-recall": "세부 기억",
            "category-memory": "범주",
            "pattern-memory": "패턴",
            "long-recall": "장기 회상",
            "exclusion-recall": "기억 확인"
          },
          lt: {
            "fact-recall": "Faktai",
            "general-knowledge": "Greiti faktai",
            "recent-recall": "Nauja atmintis",
            "detail-recall": "Detalės",
            "category-memory": "Kategorijos",
            "pattern-memory": "Šablonai",
            "long-recall": "Ilga atmintis",
            "exclusion-recall": "Atminties patikra"
          },
          lv: {
            "fact-recall": "Fakti",
            "general-knowledge": "Ātrie fakti",
            "recent-recall": "Nesenā atmiņa",
            "detail-recall": "Detaļas",
            "category-memory": "Kategorijas",
            "pattern-memory": "Modeļi",
            "long-recall": "Ilgā atmiņa",
            "exclusion-recall": "Atmiņas pārbaude"
          },
          ms: {
            "fact-recall": "Ingat fakta",
            "general-knowledge": "Fakta pantas",
            "recent-recall": "Ingatan baru",
            "detail-recall": "Butiran",
            "category-memory": "Kategori",
            "pattern-memory": "Corak",
            "long-recall": "Ingatan lama",
            "exclusion-recall": "Semakan ingatan"
          },
          nl: {
            "fact-recall": "Feiten",
            "general-knowledge": "Snelle feiten",
            "recent-recall": "Recente herinnering",
            "detail-recall": "Details",
            "category-memory": "Categorieën",
            "pattern-memory": "Patronen",
            "long-recall": "Lang geheugen",
            "exclusion-recall": "Geheugencheck"
          },
          no: {
            "fact-recall": "Fakta",
            "general-knowledge": "Raske fakta",
            "recent-recall": "Nylig minne",
            "detail-recall": "Detaljer",
            "category-memory": "Kategorier",
            "pattern-memory": "Mønstre",
            "long-recall": "Langt minne",
            "exclusion-recall": "Minnesjekk"
          },
          pl: {
            "fact-recall": "Fakty",
            "general-knowledge": "Szybkie fakty",
            "recent-recall": "Świeża pamięć",
            "detail-recall": "Szczegóły",
            "category-memory": "Kategorie",
            "pattern-memory": "Wzory",
            "long-recall": "Długa pamięć",
            "exclusion-recall": "Test pamięci"
          },
          pt: {
            "fact-recall": "Factos",
            "general-knowledge": "Factos rápidos",
            "recent-recall": "Memória recente",
            "detail-recall": "Detalhes",
            "category-memory": "Categorias",
            "pattern-memory": "Padrões",
            "long-recall": "Recordação longa",
            "exclusion-recall": "Verificação"
          },
          "pt-br": {
            "fact-recall": "Fatos",
            "general-knowledge": "Fatos rápidos",
            "recent-recall": "Memória recente",
            "detail-recall": "Detalhes",
            "category-memory": "Categorias",
            "pattern-memory": "Padrões",
            "long-recall": "Recordação longa",
            "exclusion-recall": "Verificação"
          },
          ro: {
            "fact-recall": "Fapte",
            "general-knowledge": "Fapte rapide",
            "recent-recall": "Memorie recentă",
            "detail-recall": "Detalii",
            "category-memory": "Categorii",
            "pattern-memory": "Tipare",
            "long-recall": "Memorie lungă",
            "exclusion-recall": "Verificare"
          },
          sv: {
            "fact-recall": "Fakta",
            "general-knowledge": "Snabba fakta",
            "recent-recall": "Nyligt minne",
            "detail-recall": "Detaljer",
            "category-memory": "Kategorier",
            "pattern-memory": "Mönster",
            "long-recall": "Långt minne",
            "exclusion-recall": "Minneskoll"
          },
          th: {
            "fact-recall": "จำข้อเท็จจริง",
            "general-knowledge": "ความรู้เร็ว",
            "recent-recall": "จำล่าสุด",
            "detail-recall": "จำรายละเอียด",
            "category-memory": "หมวดหมู่",
            "pattern-memory": "รูปแบบ",
            "long-recall": "จำระยะยาว",
            "exclusion-recall": "เช็กความจำ"
          },
          tr: {
            "fact-recall": "Bilgi hatırlama",
            "general-knowledge": "Hızlı bilgiler",
            "recent-recall": "Yakın hafıza",
            "detail-recall": "Detaylar",
            "category-memory": "Kategoriler",
            "pattern-memory": "Desenler",
            "long-recall": "Uzun hatırlama",
            "exclusion-recall": "Hafıza kontrolü"
          },
          uk: {
            "fact-recall": "Факти",
            "general-knowledge": "Швидкі факти",
            "recent-recall": "Нещодавня пам’ять",
            "detail-recall": "Деталі",
            "category-memory": "Категорії",
            "pattern-memory": "Шаблони",
            "long-recall": "Довга пам’ять",
            "exclusion-recall": "Перевірка"
          },
          vi: {
            "fact-recall": "Nhớ sự thật",
            "general-knowledge": "Kiến thức nhanh",
            "recent-recall": "Nhớ gần đây",
            "detail-recall": "Chi tiết",
            "category-memory": "Danh mục",
            "pattern-memory": "Mẫu",
            "long-recall": "Nhớ lâu",
            "exclusion-recall": "Kiểm tra trí nhớ"
          },
          zh: {
            "fact-recall": "事实记忆",
            "general-knowledge": "快速知识",
            "recent-recall": "近期回忆",
            "detail-recall": "细节记忆",
            "category-memory": "类别",
            "pattern-memory": "模式",
            "long-recall": "长期回忆",
            "exclusion-recall": "记忆检查"
          }
        },
        pilot2: {
          en: {
            "checklist": "Checklist",
            "focus": "Focus",
            "navigation": "Navigation",
            "weather": "Weather",
            "instrument-check": "Instrument check",
            "time-planning": "Time planning",
            "route-choice": "Route choice",
            "priority": "Priority",
            "fuel-planning": "Fuel planning",
            "verification": "Verification"
          },
          nl: {
            "checklist": "Checklist",
            "focus": "Focus",
            "navigation": "Navigatie",
            "weather": "Weer",
            "instrument-check": "Instrumentcheck",
            "time-planning": "Tijdplanning",
            "route-choice": "Routekeuze",
            "priority": "Prioriteit",
            "fuel-planning": "Brandstofplanning",
            "verification": "Verificatie"
          },
          de: {
            "checklist": "Checkliste",
            "focus": "Fokus",
            "navigation": "Navigation",
            "weather": "Wetter",
            "instrument-check": "Instrumentencheck",
            "time-planning": "Zeitplanung",
            "route-choice": "Routenwahl",
            "priority": "Priorität",
            "fuel-planning": "Treibstoffplanung",
            "verification": "Prüfung"
          },
          fr: {
            "checklist": "Checklist",
            "focus": "Concentration",
            "navigation": "Navigation",
            "weather": "Météo",
            "instrument-check": "Instruments",
            "time-planning": "Temps",
            "route-choice": "Route",
            "priority": "Priorité",
            "fuel-planning": "Carburant",
            "verification": "Vérification"
          },
          es: {
            "checklist": "Checklist",
            "focus": "Concentración",
            "navigation": "Navegación",
            "weather": "Clima",
            "instrument-check": "Instrumentos",
            "time-planning": "Tiempo",
            "route-choice": "Ruta",
            "priority": "Prioridad",
            "fuel-planning": "Combustible",
            "verification": "Verificación"
          }
        },
        bible: {
          en: {
            "story": "Stories",
            "person": "People",
            "timeline": "Timeline",
            "place": "Places",
            "attention": "Careful clues",
            "deduction": "Clues",
            "book": "Books",
            "parable": "Parables",
            "teaching": "Teachings"
          }
        }
      };
      var quizLabels = labels[quiz.slug] || {};
      var localeLabels = quizLabels[t.locale && t.locale.code] || quizLabels.en || {};
      return localeLabels[category] || titleCaseCategory(category);
    }

    function getStageQuestions(stage) {
      return quiz.questions
        .map(function (question, index) { return { question: question, index: index }; })
        .filter(function (item) { return (item.question.stage || 0) === stage; });
    }

    function getCurrentStagePosition(stage) {
      var stageQuestions = getStageQuestions(stage);
      return stageQuestions.findIndex(function (item) { return item.index === current; }) + 1;
    }

    function getScore() {
      if (isPersonalityQuiz) {
        return getAnsweredCount();
      }

      return quiz.questions.reduce(function (total, question, index) {
        return total + (answers[index] === question.answerIndex ? 1 : 0);
      }, 0);
    }

    function getStageScore(stage) {
      if (isPersonalityQuiz) {
        return getStageQuestions(stage).reduce(function (total, item) {
          return total + (answers[item.index] !== undefined ? 1 : 0);
        }, 0);
      }

      return getStageQuestions(stage).reduce(function (total, item) {
        return total + (answers[item.index] === item.question.answerIndex ? 1 : 0);
      }, 0);
    }

    function getAnsweredCount() {
      return Object.keys(answers).length;
    }

    function setButtonLoading(button, loadingText, isLoading) {
      if (!button) return;
      if (isLoading) {
        button.disabled = true;
        button.dataset.readyText = button.innerHTML;
        button.textContent = loadingText;
        return;
      }
      button.disabled = false;
      if (button.dataset.readyText) {
        button.innerHTML = button.dataset.readyText;
      }
    }

    function applyAnswerState(choiceIndex) {
      var question = quiz.questions[current];
      var isCorrect = question.answerIndex === choiceIndex;

      root.querySelectorAll('[data-js="answers"] .legacy-answer').forEach(function (button) {
        var index = Number(button.dataset.choiceIndex);
        var isSelected = index === choiceIndex;

        button.disabled = true;
        button.classList.toggle("selected", isSelected);
        button.classList.toggle("personality-selected", isPersonalityQuiz && isSelected);
        button.classList.toggle("correct", !hideAnswerFeedback && !isPersonalityQuiz && isSelected && isCorrect);
        button.classList.toggle("wrong", !hideAnswerFeedback && !isPersonalityQuiz && isSelected && !isCorrect);
        button.classList.toggle("is-dimmed", !isSelected);
      });
    }

    function renderQuestion(shouldScroll) {
      var question = quiz.questions[current];
      if (!question) {
        show("start", shouldScroll);
        return;
      }

      var currentStage = getQuestionStage(current);
      var stagePosition = getCurrentStagePosition(currentStage);
      var stageTotal = getStageQuestions(currentStage).length || 8;
      var stageIndexes = getStageIndexes();
      var stageNumber = stageIndexes.indexOf(currentStage) + 1;
      var visualBox = byData("visual");
      var answersBox = byData("answers");
      var progressDots = byData("progress-dots");
      var questionCard = byData("question-card");
      var previousProgressPosition = progressDots.dataset.stagePosition || "";
      var nextProgressPosition = currentStage + ":" + stagePosition;
      var questionBackgroundClass = questionBackgrounds[currentStage % questionBackgrounds.length];

      questionBackgrounds.forEach(function (className) {
        questionCard.classList.remove(className);
      });
      questionCard.classList.add(questionBackgroundClass);
      byData("round-label").textContent = usesCompactProgress ? t.quiz.question + " " + (usesRoundCheckpointFlow ? stagePosition : current + 1) + "/" + (usesRoundCheckpointFlow ? stageTotal : quiz.questions.length) : t.quiz.round + " " + stageNumber;
      byData("count-label").textContent = usesCompactProgress && question.category ? getShortLockedCategoryLabel(question.category) : getStageName(currentStage);
      progressDots.style.setProperty("--progress-count", stageTotal);
      progressDots.style.setProperty("--progress-ratio", usesCompactProgress ? stagePosition / stageTotal : stageTotal > 1 ? (stagePosition - 1) / (stageTotal - 1) : 1);
      progressDots.innerHTML = Array.from({ length: stageTotal }).map(function (_, index) {
        var state = index + 1 < stagePosition ? "is-complete" : index + 1 === stagePosition ? "is-current" : "";
        var label = state === "is-complete" ? "✓" : index + 1;
        return '<span class="' + state + '" aria-label="' + escapeHtml(t.quiz.step) + ' ' + (index + 1) + '">' + label + '</span>';
      }).join("");
      progressDots.classList.remove("is-advancing");
      if (previousProgressPosition && previousProgressPosition !== nextProgressPosition) {
        void progressDots.offsetWidth;
        progressDots.classList.add("is-advancing");
      }
      progressDots.dataset.stagePosition = nextProgressPosition;
      byData("question-text").textContent = question.prompt;

      renderQuestionVisual(visualBox, question.visual);
      refreshQuestionDisplayAdForQuestion(current);

      answersBox.innerHTML = question.choices.map(function (choice, index) {
        return '<button class="legacy-answer" type="button" data-choice-index="' + index + '">' +
          '<small>' + String.fromCharCode(65 + index) + '</small>' +
          escapeHtml(choice) +
          '</button>';
      }).join("");

      answersBox.querySelectorAll(".legacy-answer").forEach(function (button) {
        button.addEventListener("click", function () {
          answerQuestion(Number(button.dataset.choiceIndex));
        });
      });

      preloadUpcomingQuestionVisuals(current + 1, 2);
      show("question", shouldScroll);
    }

    function answerQuestion(choiceIndex) {
      if (answers[current] !== undefined) return;

      clearAdvanceTimer();
      var question = quiz.questions[current];
      var isCorrect = question.answerIndex === choiceIndex;
      answers[current] = choiceIndex;
      saveProgress("question");
      if (current === 0) {
        trackQuizStart();
      }
      applyAnswerState(choiceIndex);

      advanceTimer = window.setTimeout(function () {
        advanceAfterAnswer(choiceIndex);
      }, hideAnswerFeedback || isPersonalityQuiz || isCorrect ? correctAnswerDelayMs : wrongAnswerDelayMs);
    }

    function advanceAfterAnswer(choiceIndex) {
      var question = quiz.questions[current];
      var currentStage = question.stage || 0;
      var nextQuestion = quiz.questions[current + 1];
      var nextStage = nextQuestion ? (nextQuestion.stage || 0) : currentStage;

      if (!nextQuestion) {
        if (skipFinalRewardedGate) {
          saveProgress("results");
          renderResults();
          scrollToPageTop();
          return;
        }

        saveProgress("result-gate");
        showResultGate();
        scrollToPageTop();
        return;
      }

      if (nextStage !== currentStage) {
        current += 1;
        if (skipStageRewardedGates) {
          saveProgress("question");
          renderQuestion();
          scrollToPageTop();
          return;
        }

        saveProgress("stage-gate");
        showStageGate();
        scrollToPageTop();
        return;
      }

      current += 1;
      saveProgress("question");
      renderQuestion();
      scrollToPageTop();
    }

    function showStageGate(shouldScroll) {
      clearAdStatuses();
      harvardStageResultPending = false;
      harvardStageResultReady = false;
      byData("stage-trail").classList.remove("legacy-stage-trail--bar");
      var completedStage = Math.max(0, getQuestionStage(Math.max(0, current - 1)));
      var stageIndexes = getStageIndexes();
      var nextStage = stageIndexes.find(function (stage) { return stage > completedStage; });
      var nextStageName = nextStage !== undefined ? getStageName(nextStage) : null;
      var buttonLabel = nextStageName
        ? t.quiz.continue + " →"
        : t.results.viewResults + " →";
      var copy = quiz.stageEncouragement[Math.min(completedStage, quiz.stageEncouragement.length - 1)] || "";
      var stageTotal = getStageQuestions(completedStage).length;
      var stageScore = getStageScore(completedStage);
      var stageIcons = ["✅", "⭐", "🧠", "🧩", "🔎", "🎯", "🚀", "🏆", "💎", "🎉"];
      var stageStats = root.querySelector(".legacy-stage-stats");
      var stageAdNote = screens.stageGate ? screens.stageGate.querySelector(".legacy-ad-note") : null;

      if (usesRoundCheckpointFlow) {
        harvardStageResultPending = true;
        showResultGate(shouldScroll);
        return;
      }

      byData("stage-title").textContent = t.quiz.round + " " + (completedStage + 1) + " " + t.results.complete;
      byData("stage-icon").textContent = stageIcons[completedStage % stageIcons.length];
      byData("stage-copy").textContent = copy;
      byData("stage-next").classList.toggle("legacy-hidden", !nextStageName);
      byData("stage-next-label").textContent = nextStageName ? t.results.nextStage : "";
      byData("stage-next-name").textContent = nextStageName || "";
      if (stageStats) stageStats.classList.remove("legacy-hidden");
      if (stageAdNote) stageAdNote.classList.remove("legacy-hidden");
      root.querySelector(".legacy-stage-stats").classList.toggle("legacy-stage-stats--single", isPersonalityQuiz);
      byData("stage-round-score").parentElement.classList.toggle("legacy-hidden", isPersonalityQuiz);
      byData("stage-round-score").textContent = stageScore + "/" + stageTotal;
      byData("stage-round-score-label").textContent = isPersonalityQuiz ? t.results.stageComplete : t.results.roundResult;
      var personalityStageStatus = isPersonalityQuiz ? getPersonalityClarityStatus(completedStage) : null;
      byData("stage-score").textContent = personalityStageStatus ? personalityStageStatus.title : getScore() + "/" + current;
      byData("stage-score-label").textContent = personalityStageStatus ? personalityStageStatus.label : t.results.scoreSoFar;
      byData("stage-trail").innerHTML = stageIndexes.map(function (stage, index) {
        var status = stage <= completedStage ? "complete" : stage === nextStage ? "next" : "locked";
        var label = stage === nextStage ? getStageName(stage) : t.quiz.round + " " + (index + 1);
        return '<span class="legacy-stage-trail__dot legacy-stage-trail__dot--' + status + '" title="' + escapeHtml(label) + '">' + (status === "complete" ? "✓" : "") + '</span>';
      }).join("");
      byData("stage-button").textContent = buttonLabel;
      byData("stage-button").dataset.readyText = buttonLabel;
      preloadQuestionVisual(current);
      show("stageGate", shouldScroll);
    }

    function getRoundCheckpointText() {
      var defaults = {
        round: "Round",
        results: "results",
        lockedNext: "Your score is locked in. Start the next stage when you're ready.",
        lockedFinal: "Your score is locked in. The final result is next.",
        nextStage: "Next stage",
        roundScore: "Round score",
        scoreSoFar: "Score so far",
        complete: "complete",
        startNext: "Start Next Stage →",
        seeFinal: "See Final Results →",
        roundUnlock: "One short unlock reveals your round score."
      };

      var labels = {
        ar: { round: "الجولة", results: "النتائج", lockedNext: "تم تسجيل نتيجتك. ابدأ الجولة التالية عندما تكون جاهزًا.", lockedFinal: "تم تسجيل نتيجتك. النتيجة النهائية هي التالية.", nextStage: "الجولة التالية", roundScore: "نتيجة الجولة", scoreSoFar: "النتيجة حتى الآن", complete: "مكتمل", startNext: "ابدأ الجولة التالية →", seeFinal: "اعرض النتيجة النهائية →", roundUnlock: "يفتح إعلان قصير نتيجة هذه الجولة." },
        bg: { round: "Рунд", results: "резултати", lockedNext: "Резултатът ти е запазен. Започни следващия рунд, когато си готов.", lockedFinal: "Резултатът ти е запазен. Следва крайният резултат.", nextStage: "Следващ рунд", roundScore: "Резултат от рунда", scoreSoFar: "Резултат досега", complete: "завършено", startNext: "Започни следващия рунд →", seeFinal: "Виж крайния резултат →", roundUnlock: "Кратко отключване показва резултата от рунда." },
        cs: { round: "Kolo", results: "výsledky", lockedNext: "Tvé skóre je uloženo. Až budeš připravený, spusť další kolo.", lockedFinal: "Tvé skóre je uloženo. Teď přijde finální výsledek.", nextStage: "Další kolo", roundScore: "Skóre kola", scoreSoFar: "Skóre zatím", complete: "hotovo", startNext: "Spustit další kolo →", seeFinal: "Zobrazit finální výsledek →", roundUnlock: "Krátké odemčení ukáže skóre kola." },
        da: { round: "Runde", results: "resultater", lockedNext: "Din score er gemt. Start næste runde, når du er klar.", lockedFinal: "Din score er gemt. Det endelige resultat er næste.", nextStage: "Næste runde", roundScore: "Rundescore", scoreSoFar: "Score indtil nu", complete: "fuldført", startNext: "Start næste runde →", seeFinal: "Se endeligt resultat →", roundUnlock: "En kort oplåsning viser din rundescore." },
        de: { round: "Runde", results: "Ergebnisse", lockedNext: "Deine Punktzahl ist gespeichert. Starte die nächste Runde, wenn du bereit bist.", lockedFinal: "Deine Punktzahl ist gespeichert. Jetzt folgt das Endergebnis.", nextStage: "Nächste Runde", roundScore: "Rundenergebnis", scoreSoFar: "Punktzahl bisher", complete: "abgeschlossen", startNext: "Nächste Runde starten →", seeFinal: "Endergebnis ansehen →", roundUnlock: "Eine kurze Freischaltung zeigt deine Punktzahl für diese Runde." },
        el: { round: "Γύρος", results: "αποτελέσματα", lockedNext: "Το σκορ σου αποθηκεύτηκε. Ξεκίνα τον επόμενο γύρο όταν είσαι έτοιμος.", lockedFinal: "Το σκορ σου αποθηκεύτηκε. Ακολουθεί το τελικό αποτέλεσμα.", nextStage: "Επόμενος γύρος", roundScore: "Σκορ γύρου", scoreSoFar: "Σκορ μέχρι τώρα", complete: "ολοκληρώθηκε", startNext: "Ξεκίνα τον επόμενο γύρο →", seeFinal: "Δες το τελικό αποτέλεσμα →", roundUnlock: "Ένα σύντομο ξεκλείδωμα αποκαλύπτει το σκορ του γύρου." },
        es: { round: "Ronda", results: "resultados", lockedNext: "Tu puntuación está guardada. Empieza la siguiente ronda cuando quieras.", lockedFinal: "Tu puntuación está guardada. Ahora viene el resultado final.", nextStage: "Siguiente ronda", roundScore: "Puntuación de ronda", scoreSoFar: "Puntuación hasta ahora", complete: "completo", startNext: "Empezar siguiente ronda →", seeFinal: "Ver resultado final →", roundUnlock: "Un desbloqueo breve revela tu puntuación de la ronda." },
        fi: { round: "Kierros", results: "tulokset", lockedNext: "Pisteesi on tallennettu. Aloita seuraava kierros, kun olet valmis.", lockedFinal: "Pisteesi on tallennettu. Seuraavaksi tulee lopputulos.", nextStage: "Seuraava kierros", roundScore: "Kierroksen pisteet", scoreSoFar: "Pisteet tähän asti", complete: "valmis", startNext: "Aloita seuraava kierros →", seeFinal: "Näytä lopputulos →", roundUnlock: "Lyhyt avaus näyttää kierroksen pisteesi." },
        fr: { round: "Manche", results: "résultats", lockedNext: "Ton score est enregistré. Lance la manche suivante quand tu es prêt.", lockedFinal: "Ton score est enregistré. Le résultat final arrive maintenant.", nextStage: "Manche suivante", roundScore: "Score de la manche", scoreSoFar: "Score jusqu’ici", complete: "terminé", startNext: "Lancer la manche suivante →", seeFinal: "Voir le résultat final →", roundUnlock: "Un court déblocage révèle ton score de manche." },
        he: { round: "סיבוב", results: "תוצאות", lockedNext: "הציון שלך נשמר. התחילו את הסיבוב הבא כשתהיו מוכנים.", lockedFinal: "הציון שלך נשמר. עכשיו מגיעה התוצאה הסופית.", nextStage: "הסיבוב הבא", roundScore: "ציון הסיבוב", scoreSoFar: "ציון עד עכשיו", complete: "הושלם", startNext: "התחלת הסיבוב הבא →", seeFinal: "הצגת התוצאה הסופית →", roundUnlock: "פתיחה קצרה מציגה את ציון הסיבוב שלך." },
        hi: { round: "राउंड", results: "परिणाम", lockedNext: "आपका स्कोर लॉक हो गया है। तैयार हों तो अगला राउंड शुरू करें।", lockedFinal: "आपका स्कोर लॉक हो गया है। अब अंतिम परिणाम आएगा।", nextStage: "अगला राउंड", roundScore: "राउंड स्कोर", scoreSoFar: "अब तक का स्कोर", complete: "पूरा", startNext: "अगला राउंड शुरू करें →", seeFinal: "अंतिम परिणाम देखें →", roundUnlock: "एक छोटा अनलॉक आपका राउंड स्कोर दिखाता है।" },
        hu: { round: "Forduló", results: "eredmények", lockedNext: "A pontszámod rögzítve. Indítsd a következő fordulót, amikor készen állsz.", lockedFinal: "A pontszámod rögzítve. Most jön a végső eredmény.", nextStage: "Következő forduló", roundScore: "Forduló pontszáma", scoreSoFar: "Pontszám eddig", complete: "kész", startNext: "Következő forduló indítása →", seeFinal: "Végső eredmény megtekintése →", roundUnlock: "Egy rövid feloldás megmutatja a forduló pontszámát." },
        id: { round: "Ronde", results: "hasil", lockedNext: "Skormu sudah terkunci. Mulai ronde berikutnya saat kamu siap.", lockedFinal: "Skormu sudah terkunci. Berikutnya adalah hasil akhir.", nextStage: "Ronde berikutnya", roundScore: "Skor ronde", scoreSoFar: "Skor sejauh ini", complete: "selesai", startNext: "Mulai ronde berikutnya →", seeFinal: "Lihat hasil akhir →", roundUnlock: "Satu buka singkat menampilkan skor rondemu." },
        it: { round: "Round", results: "risultati", lockedNext: "Il tuo punteggio è salvato. Inizia il prossimo round quando vuoi.", lockedFinal: "Il tuo punteggio è salvato. Ora arriva il risultato finale.", nextStage: "Prossimo round", roundScore: "Punteggio round", scoreSoFar: "Punteggio finora", complete: "completo", startNext: "Inizia il prossimo round →", seeFinal: "Vedi risultato finale →", roundUnlock: "Un breve sblocco rivela il punteggio del round." },
        ja: { round: "ラウンド", results: "結果", lockedNext: "スコアが保存されました。準備ができたら次のラウンドへ進みましょう。", lockedFinal: "スコアが保存されました。次は最終結果です。", nextStage: "次のラウンド", roundScore: "ラウンドスコア", scoreSoFar: "ここまでのスコア", complete: "完了", startNext: "次のラウンドを始める →", seeFinal: "最終結果を見る →", roundUnlock: "短い解除でラウンドスコアが表示されます。" },
        ko: { round: "라운드", results: "결과", lockedNext: "점수가 저장되었습니다. 준비되면 다음 라운드를 시작하세요.", lockedFinal: "점수가 저장되었습니다. 이제 최종 결과가 나옵니다.", nextStage: "다음 라운드", roundScore: "라운드 점수", scoreSoFar: "현재 점수", complete: "완료", startNext: "다음 라운드 시작 →", seeFinal: "최종 결과 보기 →", roundUnlock: "짧은 잠금 해제로 라운드 점수를 볼 수 있습니다." },
        lt: { round: "Raundas", results: "rezultatai", lockedNext: "Tavo rezultatas užfiksuotas. Pradėk kitą raundą, kai būsi pasiruošęs.", lockedFinal: "Tavo rezultatas užfiksuotas. Toliau laukia galutinis rezultatas.", nextStage: "Kitas raundas", roundScore: "Raundo rezultatas", scoreSoFar: "Rezultatas iki šiol", complete: "baigta", startNext: "Pradėti kitą raundą →", seeFinal: "Žiūrėti galutinį rezultatą →", roundUnlock: "Trumpas atrakinimas parodys raundo rezultatą." },
        lv: { round: "Raunds", results: "rezultāti", lockedNext: "Tavs rezultāts ir saglabāts. Sāc nākamo raundu, kad esi gatavs.", lockedFinal: "Tavs rezultāts ir saglabāts. Tālāk būs gala rezultāts.", nextStage: "Nākamais raunds", roundScore: "Raunda rezultāts", scoreSoFar: "Rezultāts līdz šim", complete: "pabeigts", startNext: "Sākt nākamo raundu →", seeFinal: "Skatīt gala rezultātu →", roundUnlock: "Īsa atbloķēšana parādīs raunda rezultātu." },
        ms: { round: "Pusingan", results: "keputusan", lockedNext: "Skor anda sudah dikunci. Mulakan pusingan seterusnya apabila anda bersedia.", lockedFinal: "Skor anda sudah dikunci. Keputusan akhir seterusnya.", nextStage: "Pusingan seterusnya", roundScore: "Skor pusingan", scoreSoFar: "Skor setakat ini", complete: "selesai", startNext: "Mulakan pusingan seterusnya →", seeFinal: "Lihat keputusan akhir →", roundUnlock: "Satu buka kunci ringkas memaparkan skor pusingan anda." },
        nl: { round: "Ronde", results: "resultaten", lockedNext: "Je score is vastgelegd. Start de volgende ronde wanneer je klaar bent.", lockedFinal: "Je score is vastgelegd. Het eindresultaat is nu aan de beurt.", nextStage: "Volgende ronde", roundScore: "Rondescore", scoreSoFar: "Score tot nu toe", complete: "voltooid", startNext: "Start volgende ronde →", seeFinal: "Bekijk eindresultaat →", roundUnlock: "Een korte ontgrendeling toont je rondescore." },
        no: { round: "Runde", results: "resultater", lockedNext: "Poengsummen din er lagret. Start neste runde når du er klar.", lockedFinal: "Poengsummen din er lagret. Sluttresultatet kommer nå.", nextStage: "Neste runde", roundScore: "Rundescore", scoreSoFar: "Score så langt", complete: "fullført", startNext: "Start neste runde →", seeFinal: "Se sluttresultat →", roundUnlock: "En kort opplåsing viser rundescoren din." },
        pl: { round: "Runda", results: "wyniki", lockedNext: "Twój wynik jest zapisany. Zacznij kolejną rundę, gdy będziesz gotowy.", lockedFinal: "Twój wynik jest zapisany. Teraz czas na wynik końcowy.", nextStage: "Następna runda", roundScore: "Wynik rundy", scoreSoFar: "Wynik do tej pory", complete: "ukończono", startNext: "Zacznij następną rundę →", seeFinal: "Zobacz wynik końcowy →", roundUnlock: "Krótkie odblokowanie pokaże wynik tej rundy." },
        pt: { round: "Ronda", results: "resultados", lockedNext: "A tua pontuação ficou guardada. Começa a próxima ronda quando estiveres pronto.", lockedFinal: "A tua pontuação ficou guardada. Segue-se o resultado final.", nextStage: "Próxima ronda", roundScore: "Pontuação da ronda", scoreSoFar: "Pontuação até agora", complete: "concluído", startNext: "Começar próxima ronda →", seeFinal: "Ver resultado final →", roundUnlock: "Um desbloqueio curto revela a tua pontuação da ronda." },
        "pt-br": { round: "Rodada", results: "resultados", lockedNext: "Sua pontuação foi salva. Comece a próxima rodada quando estiver pronto.", lockedFinal: "Sua pontuação foi salva. Agora vem o resultado final.", nextStage: "Próxima rodada", roundScore: "Pontuação da rodada", scoreSoFar: "Pontuação até agora", complete: "concluído", startNext: "Começar próxima rodada →", seeFinal: "Ver resultado final →", roundUnlock: "Um desbloqueio curto revela sua pontuação da rodada." },
        ro: { round: "Runda", results: "rezultate", lockedNext: "Scorul tău este salvat. Începe runda următoare când ești pregătit.", lockedFinal: "Scorul tău este salvat. Urmează rezultatul final.", nextStage: "Runda următoare", roundScore: "Scorul rundei", scoreSoFar: "Scor până acum", complete: "finalizat", startNext: "Începe runda următoare →", seeFinal: "Vezi rezultatul final →", roundUnlock: "O scurtă deblocare îți arată scorul rundei." },
        sv: { round: "Runda", results: "resultat", lockedNext: "Din poäng är sparad. Starta nästa runda när du är redo.", lockedFinal: "Din poäng är sparad. Slutresultatet kommer härnäst.", nextStage: "Nästa runda", roundScore: "Rundpoäng", scoreSoFar: "Poäng hittills", complete: "klart", startNext: "Starta nästa runda →", seeFinal: "Se slutresultat →", roundUnlock: "En kort upplåsning visar din rundpoäng." },
        th: { round: "รอบ", results: "ผลลัพธ์", lockedNext: "คะแนนของคุณถูกบันทึกแล้ว เริ่มรอบถัดไปเมื่อพร้อม", lockedFinal: "คะแนนของคุณถูกบันทึกแล้ว ต่อไปคือผลลัพธ์สุดท้าย", nextStage: "รอบถัดไป", roundScore: "คะแนนรอบนี้", scoreSoFar: "คะแนนจนถึงตอนนี้", complete: "เสร็จแล้ว", startNext: "เริ่มรอบถัดไป →", seeFinal: "ดูผลลัพธ์สุดท้าย →", roundUnlock: "ปลดล็อกสั้น ๆ เพื่อดูคะแนนรอบนี้" },
        tr: { round: "Tur", results: "sonuçları", lockedNext: "Puanın kaydedildi. Hazır olduğunda sonraki turu başlat.", lockedFinal: "Puanın kaydedildi. Sırada final sonucu var.", nextStage: "Sonraki tur", roundScore: "Tur puanı", scoreSoFar: "Şu ana kadarki puan", complete: "tamamlandı", startNext: "Sonraki turu başlat →", seeFinal: "Final sonucunu gör →", roundUnlock: "Kısa bir kilit açma tur puanını gösterir." },
        uk: { round: "Раунд", results: "результати", lockedNext: "Твій рахунок збережено. Почни наступний раунд, коли будеш готовий.", lockedFinal: "Твій рахунок збережено. Далі фінальний результат.", nextStage: "Наступний раунд", roundScore: "Рахунок раунду", scoreSoFar: "Рахунок наразі", complete: "завершено", startNext: "Почати наступний раунд →", seeFinal: "Переглянути фінальний результат →", roundUnlock: "Коротке розблокування покаже рахунок раунду." },
        vi: { round: "Vòng", results: "kết quả", lockedNext: "Điểm của bạn đã được lưu. Bắt đầu vòng tiếp theo khi bạn sẵn sàng.", lockedFinal: "Điểm của bạn đã được lưu. Tiếp theo là kết quả cuối cùng.", nextStage: "Vòng tiếp theo", roundScore: "Điểm vòng", scoreSoFar: "Điểm hiện tại", complete: "hoàn tất", startNext: "Bắt đầu vòng tiếp theo →", seeFinal: "Xem kết quả cuối cùng →", roundUnlock: "Một lần mở khóa ngắn sẽ hiển thị điểm vòng này." },
        zh: { round: "第", results: "轮结果", lockedNext: "你的分数已保存。准备好后开始下一轮。", lockedFinal: "你的分数已保存。接下来是最终结果。", nextStage: "下一轮", roundScore: "本轮分数", scoreSoFar: "当前总分", complete: "完成", startNext: "开始下一轮 →", seeFinal: "查看最终结果 →", roundUnlock: "短暂解锁后即可查看本轮分数。" }
      };

      return labels[t.locale && t.locale.code] || defaults;
    }

    function showHarvardStageResults(shouldScroll) {
      clearAdStatuses();
      harvardStageResultPending = false;
      harvardStageResultReady = true;
      var completedStage = Math.max(0, getQuestionStage(Math.max(0, current - 1)));
      var stageIndexes = getStageIndexes();
      var nextStage = stageIndexes.find(function (stage) { return stage > completedStage; });
      var nextStageName = nextStage !== undefined ? getStageName(nextStage) : null;
      var stageTotal = getStageQuestions(completedStage).length;
      var stageScore = getStageScore(completedStage);
      var stageStats = root.querySelector(".legacy-stage-stats");
      var stageAdNote = screens.stageGate ? screens.stageGate.querySelector(".legacy-ad-note") : null;
      var progressPercent = Math.round(((completedStage + 1) / stageIndexes.length) * 100);
      var checkpointText = getRoundCheckpointText();

      byData("stage-title").textContent = checkpointText.round + " " + (completedStage + 1) + "/" + stageIndexes.length + " " + checkpointText.results;
      byData("stage-icon").textContent = isAirforceQuiz || isNavyQuiz ? quiz.cardIcon || (isNavyQuiz ? "⚓" : "✈️") : stageScore >= Math.ceil(stageTotal * 0.8) ? "🏆" : quiz.cardIcon || "✅";
      byData("stage-copy").textContent = nextStageName ? checkpointText.lockedNext : checkpointText.lockedFinal;
      byData("stage-next").classList.toggle("legacy-hidden", !nextStageName);
      byData("stage-next-label").textContent = nextStageName ? checkpointText.nextStage : "";
      byData("stage-next-name").textContent = nextStageName || "";
      if (stageStats) {
        stageStats.classList.remove("legacy-hidden");
        stageStats.classList.remove("legacy-stage-stats--single");
      }
      byData("stage-round-score").parentElement.classList.remove("legacy-hidden");
      byData("stage-round-score").textContent = stageScore + "/" + stageTotal;
      byData("stage-round-score-label").textContent = checkpointText.roundScore;
      byData("stage-score").textContent = getScore() + "/" + current;
      byData("stage-score-label").textContent = checkpointText.scoreSoFar;
      byData("stage-trail").classList.add("legacy-stage-trail--bar");
      byData("stage-trail").innerHTML = '<div class="legacy-stage-progressbar" aria-hidden="true"><span style="width: ' + progressPercent + '%"></span></div><strong class="legacy-stage-progressbar-label">' + progressPercent + '% ' + checkpointText.complete + '</strong>';
      byData("stage-button").textContent = nextStageName ? checkpointText.startNext : checkpointText.seeFinal;
      byData("stage-button").dataset.readyText = byData("stage-button").textContent;
      if (stageAdNote) stageAdNote.classList.add("legacy-hidden");
      show("stageGate", shouldScroll);
    }

    function showResultGate(shouldScroll) {
      clearAdStatuses();
      var resultGateCopy = byData("result-gate-copy");
      var resultGateBadge = byData("result-gate-badge");
      resultGateBadge.textContent = isShortLockedScoreQuiz ? "" : t.quiz.profileReady;
      resultGateBadge.classList.toggle("legacy-hidden", isShortLockedScoreQuiz);
      byData("result-gate-title").textContent = isShortLockedScoreQuiz ? getShortLockedResultGateTitle() : t.quiz.your + " " + quiz.result.profileName + " " + t.quiz.profile;
      if (resultGateCopy) {
        resultGateCopy.textContent = isShortLockedScoreQuiz ? getShortLockedResultGateCopy() : "";
        resultGateCopy.classList.toggle("legacy-hidden", !isShortLockedScoreQuiz);
      }
      byData("result-gate-button").textContent = isShortLockedScoreQuiz ? getShortLockedResultGateButtonLabel() : t.results.viewResults + " →";
      byData("result-gate-button").disabled = harvardStageResultPending ? false : getAnsweredCount() !== quiz.questions.length;
      show("resultGate", shouldScroll);
    }

    function getStageScores() {
      return quiz.stages.map(function (name, stage) {
        var questions = getStageQuestions(stage);
        var correct = questions.reduce(function (total, item) {
          if (isPersonalityQuiz) {
            return total + (answers[item.index] !== undefined ? 1 : 0);
          }

          return total + (answers[item.index] === item.question.answerIndex ? 1 : 0);
        }, 0);

        return {
          name: name,
          correct: correct,
          total: questions.length,
          ratio: questions.length ? correct / questions.length : 0
        };
      });
    }

    function getStrongestStage(stageScores) {
      return stageScores.slice().sort(function (a, b) {
        return b.ratio - a.ratio || b.correct - a.correct;
      })[0] || { name: quiz.title, correct: 0, total: 0, ratio: 0 };
    }

    function getIqRange(score, total) {
      var percentage = total ? (score / total) * 100 : 0;

      if (percentage >= 95) return "140+";
      if (percentage >= 90) return "130-139";
      if (percentage >= 80) return "120-129";
      if (percentage >= 70) return "110-119";
      if (percentage >= 60) return "100-109";
      if (percentage >= 50) return "90-99";
      return "Under 90";
    }

    function getUnlockReviewButtonLabel() {
      if (quiz.slug === "nursing2" && t.locale && t.locale.code === "nl") return "Foute antwoorden bekijken";
      if (quiz.slug === "nursing2" && t.locale && t.locale.code === "de") return "Falsche Antworten ansehen";
      return isShortLockedScoreQuiz ? "View Incorrect Answers" : t.results.review.unlockButton;
    }

    function hidesAnswerExplanations() {
      return quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "paramedic";
    }

    function getShortLockedResultGateTitle() {
      var labels = {
        ar: "نتائجك جاهزة.",
        bg: "Резултатите ти са готови.",
        cs: "Tvé výsledky jsou připravené.",
        da: "Dine resultater er klar.",
        de: "Deine Ergebnisse sind bereit.",
        el: "Τα αποτελέσματά σου είναι έτοιμα.",
        es: "Tus resultados están listos.",
        fi: "Tuloksesi ovat valmiit.",
        fr: "Tes résultats sont prêts.",
        he: "התוצאות שלך מוכנות.",
        hi: "आपके परिणाम तैयार हैं।",
        hu: "Az eredményeid készen állnak.",
        id: "Hasilmu sudah siap.",
        it: "I tuoi risultati sono pronti.",
        ja: "結果の準備ができました。",
        ko: "결과가 준비되었습니다.",
        lt: "Tavo rezultatai paruošti.",
        lv: "Tavi rezultāti ir gatavi.",
        ms: "Keputusan anda sudah sedia.",
        nl: "Je resultaten zijn klaar.",
        no: "Resultatene dine er klare.",
        pl: "Twoje wyniki są gotowe.",
        pt: "Os teus resultados estão prontos.",
        "pt-br": "Seus resultados estão prontos.",
        ro: "Rezultatele tale sunt gata.",
        sv: "Dina resultat är klara.",
        th: "ผลลัพธ์ของคุณพร้อมแล้ว",
        tr: "Sonuçların hazır.",
        uk: "Твої результати готові.",
        vi: "Kết quả của bạn đã sẵn sàng.",
        zh: "你的结果已准备好。"
      };
      return labels[t.locale && t.locale.code] || "Your results are ready.";
    }

    function getShortLockedResultGateCopy() {
      if (usesRoundCheckpointFlow && harvardStageResultPending) {
        return getRoundCheckpointText().roundUnlock;
      }

      var labels = {
        ar: "يفتح إعلان قصير نتيجتك ومراجعة الإجابات.",
        bg: "Кратко отключване показва резултата и прегледа на отговорите.",
        cs: "Krátké odemčení ukáže tvé skóre a přehled odpovědí.",
        da: "En kort oplåsning viser din score og svaroversigt.",
        de: "Eine kurze Freischaltung zeigt deine Punktzahl und Antwortübersicht.",
        el: "Ένα σύντομο ξεκλείδωμα δείχνει το σκορ και την ανασκόπηση των απαντήσεων.",
        es: "Un desbloqueo breve revela tu puntuación y revisión de respuestas.",
        fi: "Lyhyt avaus näyttää pisteesi ja vastauskatsauksen.",
        fr: "Un court déblocage révèle ton score et le récapitulatif des réponses.",
        he: "פתיחה קצרה מציגה את הציון שלך ואת סקירת התשובות.",
        hi: "एक छोटा अनलॉक आपका स्कोर और उत्तर समीक्षा दिखाता है।",
        hu: "Egy rövid feloldás megmutatja a pontszámodat és a válaszaid áttekintését.",
        id: "Satu buka singkat menampilkan skor dan ulasan jawabanmu.",
        it: "Un breve sblocco mostra il tuo punteggio e il riepilogo delle risposte.",
        ja: "短い解除でスコアと回答レビューが表示されます。",
        ko: "짧은 잠금 해제로 점수와 답변 리뷰를 볼 수 있습니다.",
        lt: "Trumpas atrakinimas parodys tavo rezultatą ir atsakymų peržiūrą.",
        lv: "Īsa atbloķēšana parādīs tavu rezultātu un atbilžu pārskatu.",
        ms: "Satu buka kunci ringkas memaparkan skor dan semakan jawapan anda.",
        nl: "Een korte ontgrendeling toont je score en antwoordoverzicht.",
        no: "En kort opplåsing viser poengsummen og svaroversikten din.",
        pl: "Krótkie odblokowanie pokaże twój wynik i przegląd odpowiedzi.",
        pt: "Um desbloqueio curto revela a tua pontuação e a revisão das respostas.",
        "pt-br": "Um desbloqueio curto revela sua pontuação e a revisão das respostas.",
        ro: "O scurtă deblocare îți arată scorul și recapitularea răspunsurilor.",
        sv: "En kort upplåsning visar din poäng och svarsgenomgång.",
        th: "ปลดล็อกสั้น ๆ เพื่อดูคะแนนและสรุปคำตอบของคุณ",
        tr: "Kısa bir kilit açma, puanını ve cevap özetini gösterir.",
        uk: "Коротке розблокування покаже твій рахунок і огляд відповідей.",
        vi: "Một lần mở khóa ngắn sẽ hiển thị điểm và phần xem lại câu trả lời.",
        zh: "短暂解锁后即可查看分数和答案回顾。"
      };
      return labels[t.locale && t.locale.code] || "One short unlock reveals your score and answer review.";
    }

    function getShortLockedResultGateButtonLabel() {
      var labels = {
        ar: "اعرض نتائجي →",
        bg: "Виж резултатите ми →",
        cs: "Zobrazit moje výsledky →",
        da: "Se mine resultater →",
        de: "Meine Ergebnisse ansehen →",
        el: "Δες τα αποτελέσματά μου →",
        es: "Ver mis resultados →",
        fi: "Näytä tulokseni →",
        fr: "Voir mes résultats →",
        he: "הצג את התוצאות שלי →",
        hi: "मेरे परिणाम देखें →",
        hu: "Eredményeim megtekintése →",
        id: "Lihat hasil saya →",
        it: "Vedi i miei risultati →",
        ja: "結果を見る →",
        ko: "내 결과 보기 →",
        lt: "Žiūrėti mano rezultatus →",
        lv: "Skatīt manus rezultātus →",
        ms: "Lihat keputusan saya →",
        nl: "Mijn resultaten bekijken →",
        no: "Se resultatene mine →",
        pl: "Zobacz moje wyniki →",
        pt: "Ver os meus resultados →",
        "pt-br": "Ver meus resultados →",
        ro: "Vezi rezultatele mele →",
        sv: "Se mina resultat →",
        th: "ดูผลลัพธ์ของฉัน →",
        tr: "Sonuçlarımı gör →",
        uk: "Переглянути мої результати →",
        vi: "Xem kết quả của tôi →",
        zh: "查看我的结果 →"
      };
      return labels[t.locale && t.locale.code] || "See My Results →";
    }

    function formatTemplate(template, values) {
      return Object.keys(values).reduce(function (text, key) {
        return text.split("{" + key + "}").join(values[key]);
      }, template);
    }

    function getPersonalityProfileCounts() {
      var counts = {};
      quiz.result.profiles.forEach(function (profile) {
        if (profile.id) counts[profile.id] = 0;
      });

      quiz.questions.forEach(function (question, index) {
        var answer = answers[index];
        if (answer === undefined || !question.choiceProfileIds) return;
        var profileId = question.choiceProfileIds[answer];
        if (!profileId) return;
        counts[profileId] = (counts[profileId] || 0) + 1;
      });

      return counts;
    }

    function getDominantPersonalityProfile() {
      var counts = getPersonalityProfileCounts();
      var profiles = quiz.result.profiles.filter(function (profile) { return profile.id; });
      var fallback = profiles[0] || quiz.result.profiles[0];
      var profile = profiles.slice().sort(function (a, b) {
        return (counts[b.id] || 0) - (counts[a.id] || 0);
      })[0] || fallback;

      return {
        profile: profile,
        count: profile && profile.id ? (counts[profile.id] || 0) : 0
      };
    }

    function getPersonalityClarityStatus(stage) {
      return {
        title: getStageName(stage),
        label: t.results.stageComplete
      };
    }

    function getResultProfile(score, total, strongestStage) {
      if (isPersonalityQuiz) {
        var personality = getDominantPersonalityProfile();
        var personalityProfile = personality.profile || quiz.result.profiles[0];

        return {
          tier: personalityProfile.tier,
          title: personalityProfile.title,
          copy: formatTemplate(personalityProfile.copy, { stage: personalityProfile.tier }),
          percentile: personalityProfile.percentile,
          count: personality.count
        };
      }

      var ratio = total ? score / total : 0;
      var sortedProfiles = quiz.result.profiles.slice().sort(function (a, b) {
        return b.minRatio - a.minRatio;
      });
      var profile = sortedProfiles.find(function (item) {
        return ratio >= item.minRatio;
      }) || quiz.result.profiles[quiz.result.profiles.length - 1];

      return {
        tier: profile.tier,
        title: profile.title,
        copy: formatTemplate(profile.copy, { stage: strongestStage.name }),
        percentile: profile.percentile
      };
    }

    function scoreForCategories(categories) {
      if (isPersonalityQuiz) {
        var counts = getPersonalityProfileCounts();
        var answered = getAnsweredCount();
        if (!answered) return 0;

        var categoryTotal = categories.reduce(function (total, category) {
          return total + (counts[category] || 0);
        }, 0);

        return Math.round((categoryTotal / answered) * 100);
      }

      var items = quiz.questions
        .map(function (question, index) { return { question: question, index: index }; })
        .filter(function (item) {
          return item.question.category && categories.indexOf(item.question.category) !== -1;
        });

      if (!items.length) return 0;

      var correct = items.reduce(function (total, item) {
        return total + (answers[item.index] === item.question.answerIndex ? 1 : 0);
      }, 0);

      return Math.round(45 + (correct / items.length) * 55);
    }

    function getMissedQuestions() {
      if (isPersonalityQuiz) {
        return [];
      }

      return quiz.questions
        .map(function (question, index) { return { question: question, index: index }; })
        .filter(function (item) { return answers[item.index] !== item.question.answerIndex; });
    }

    function renderReview(missedQuestions) {
      byData("review").innerHTML = missedQuestions.map(function (item) {
        var question = item.question;
        var index = item.index;
        var answer = question.choices[answers[index]] || t.results.review.notAnswered;
        var html = '<div class="legacy-miss">' +
          '<strong>' + (index + 1) + '. ' + escapeHtml(question.prompt) + '</strong>' +
          '<p>' + escapeHtml(t.results.review.yourAnswer) + ': ' + escapeHtml(answer) + '<br />' +
          escapeHtml(t.results.review.correctAnswer) + ': ' + escapeHtml(question.choices[question.answerIndex]) + '</p>';

        if (question.explanation && !hidesAnswerExplanations()) {
          html += '<p>' + escapeHtml(question.explanation) + '</p>';
        }

        return html + '</div>';
      }).join("");
    }

    function loadRelatedQuizImages() {
      root.querySelectorAll("img[data-related-src]").forEach(function (image) {
        var src = image.getAttribute("data-related-src");
        if (!src) return;
        image.src = src;
        image.removeAttribute("data-related-src");
      });
    }

    function renderResults(shouldScroll, shouldTrack) {
      clearAdStatuses();
      var score = getScore();
      var stageScores = getStageScores();
      var strongestStage = getStrongestStage(stageScores);
      var profile = getResultProfile(score, quiz.questions.length, strongestStage);
      var missedQuestions = getMissedQuestions();
      var missedQuestionLabel = missedQuestions.length === 1
        ? t.results.review.missedQuestionSingular
        : t.results.review.missedQuestionPlural;

      hasUnlockedReview = false;
      byData("result-profile-badge").textContent = isShortLockedScoreQuiz ? profile.tier : isPersonalityQuiz ? profile.tier : profile.tier + " • " + strongestStage.name;
      byData("result-title").textContent = profile.title;
      byData("result-copy").textContent = isShortLockedScoreQuiz ? "" : profile.copy;
      byData("result-copy").classList.toggle("legacy-hidden", isShortLockedScoreQuiz);
      byData("final-score").textContent = isPersonalityQuiz ? getAnsweredCount() + "/" + quiz.questions.length : score + "/" + quiz.questions.length;
      byData("final-score-label").textContent = isPersonalityQuiz ? t.quiz.answered : t.quiz.finalScore;
      byData("percentile").textContent = quiz.slug === "iq" && !isPersonalityQuiz ? getIqRange(score, quiz.questions.length) : profile.percentile;
      byData("percentile-label").textContent = quiz.slug === "iq" && !isPersonalityQuiz ? t.quiz.estimatedIqRange : isPersonalityQuiz ? t.results.viewResults : t.quiz.profile;
      byData("result-meter-fill").style.width = isPersonalityQuiz
        ? Math.round(((profile.count || 0) / Math.max(1, getAnsweredCount())) * 100) + "%"
        : Math.round((score / quiz.questions.length) * 100) + "%";
      var cognitiveScores = byData("cognitive-scores");
      cognitiveScores.classList.toggle("legacy-hidden", isShortLockedScoreQuiz);
      cognitiveScores.innerHTML = isShortLockedScoreQuiz ? "" : quiz.result.scoreDimensions.map(function (dimension) {
        var dimensionScore = scoreForCategories(dimension.categories);
        return '<div class="legacy-cog-item" style="--skill-score:' + dimensionScore + '%"><strong>' + dimensionScore + '</strong><span>' + escapeHtml(dimension.label) + '</span><em aria-hidden="true"><i></i></em></div>';
      }).join("");
      var stageBreakdown = byData("stage-breakdown");
      stageBreakdown.classList.toggle("legacy-hidden", isShortLockedScoreQuiz);
      stageBreakdown.innerHTML = isShortLockedScoreQuiz ? "" : stageScores.map(function (stage, index) {
        var ratio = stage.total ? Math.round((stage.correct / stage.total) * 100) : 0;
        var stageClass = stage.ratio >= 0.75 ? "is-high" : stage.ratio >= 0.5 ? "is-mid" : "is-low";
        return '<div class="legacy-stage-chip ' + stageClass + '" style="--stage-score:' + ratio + '%">' +
          '<span>' + escapeHtml(t.quiz.round) + ' ' + (index + 1) + '</span>' +
          '<strong>' + escapeHtml(stage.name) + '</strong>' +
          '<em>' + stage.correct + '/' + stage.total + '</em>' +
          '<i aria-hidden="true"></i>' +
          '</div>';
      }).join("");
      byData("unlock-title").textContent = missedQuestions.length ? t.results.review.wantMissed : t.results.review.perfectScore;
      byData("unlock-copy").textContent = missedQuestions.length
        ? missedQuestions.length + " " + missedQuestionLabel + " " + t.results.review.readyToReview
        : t.results.review.perfectCopy;
      byData("unlock-button").classList.toggle("legacy-hidden", !missedQuestions.length);
      byData("unlock-button").disabled = false;
      byData("unlock-button").textContent = getUnlockReviewButtonLabel();
      byData("review").innerHTML = "";
      loadRelatedQuizImages();

      show("results", shouldScroll);
      saveProgress("results");
      trackResultsEvent();
    }

    function startFresh() {
      clearAdStatuses();
      current = 0;
      answers = {};
      hasUnlockedReview = false;
      harvardStageResultPending = false;
      harvardStageResultReady = false;
      quizResultsTracked = false;
      writeSessionValue(quizResultsTrackedKey, "0");
      writeQuizRewardPlacements([]);
      saveProgress("question");
      renderQuestion();
    }

    function restartQuiz() {
      clearAdStatuses();
      clearAdvanceTimer();
      clearProgress();
      current = 0;
      answers = {};
      hasUnlockedReview = false;
      harvardStageResultPending = false;
      harvardStageResultReady = false;
      quizResultsTracked = false;
      writeSessionValue(quizResultsTrackedKey, "0");
      writeQuizRewardPlacements([]);
      if (autoStartQuiz) {
        startFresh();
        scrollToPageTop();
        return;
      }
      show("start");
      scrollToPageTop();
    }

    function loadProgress() {
      try {
        var saved = window.localStorage.getItem(config.progressKey);
        if (!saved) return false;

        var parsed = JSON.parse(saved);
        var savedCurrent = parsed.currentQuestion || 0;
        var savedScreen = parsed.screen === "stage-gate" || parsed.screen === "result-gate" || parsed.screen === "results" ? parsed.screen : "question";

        if (!Number.isInteger(savedCurrent) || savedCurrent < 0 || savedCurrent >= quiz.questions.length) {
          clearProgress();
          return false;
        }

        answers = normalizeAnswers(parsed.answers);
        var resumePoint = savedScreen === "question" && answers[savedCurrent] !== undefined
          ? getResumePointAfterAnsweredQuestion(savedCurrent)
          : { currentQuestion: savedCurrent, screen: savedScreen === "stage-gate" ? "stageGate" : savedScreen === "result-gate" ? "resultGate" : savedScreen === "results" ? "results" : "question" };

        current = resumePoint.currentQuestion;

        if (resumePoint.screen === "stageGate") {
          if (skipStageRewardedGates) {
            saveProgress("question");
            renderQuestion(false);
            return true;
          }

          saveProgress("stage-gate");
          showStageGate(false);
          return true;
        }

        if (resumePoint.screen === "resultGate") {
          saveProgress("result-gate");
          showResultGate(false);
          return true;
        }

        if (resumePoint.screen === "results") {
          saveProgress("results");
          renderResults(false, false);
          return true;
        }

        saveProgress("question");
        renderQuestion(false);
        return true;
      } catch (error) {
        clearProgress();
        return false;
      }
    }

    function beginStartAd(button, statusName, keepModalOpen) {
        retryRewardedAction = function (retryButton) {
          beginStartAd(retryButton, statusName, true);
        };
        if (!keepModalOpen) hideEarlyCloseModal();
        clearAdStatuses(statusName);
        setButtonLoading(button, t.loading.ad, true);
        requestRewardedAd("before_start", function (message) {
          setAdStatus(statusName, message);
        }).then(function (granted) {
          if (!granted) {
            setButtonLoading(button, t.quiz.preparing, false);
            return;
          }
          setButtonLoading(button, t.quiz.preparing, false);
          setAdStatus(statusName, "");
          hideEarlyCloseModal();
          startFresh();
        });
    }

    function beginStageAd(button, keepModalOpen, statusName) {
      var adStatusName = statusName || "stage-ad-status";
      retryRewardedAction = function (retryButton) {
        beginStageAd(retryButton, true, adStatusName);
      };
      if (!keepModalOpen) hideEarlyCloseModal();
      clearAdStatuses(adStatusName);
      setButtonLoading(button, t.loading.ad, true);
      requestRewardedAd("before_stage_results", function (message) {
        setAdStatus(adStatusName, message);
      }).then(function (granted) {
        setButtonLoading(button, t.loading.ad, false);
        if (!granted) return;
        setAdStatus(adStatusName, "");
        hideEarlyCloseModal();
        if (usesRoundCheckpointFlow) {
          showHarvardStageResults();
          return;
        }
        saveProgress("question");
        renderQuestion();
      });
    }

    function beginResultAd(button, keepModalOpen) {
      retryRewardedAction = function (retryButton) {
        beginResultAd(retryButton, true);
      };
      if (!keepModalOpen) hideEarlyCloseModal();
      clearAdStatuses("result-ad-status");
      setButtonLoading(button, t.loading.ad, true);
      requestRewardedAd("before_final_results", function (message) {
        setAdStatus("result-ad-status", message);
      }).then(function (granted) {
        setButtonLoading(button, t.loading.ad, false);
        if (!granted) return;
        setAdStatus("result-ad-status", "");
        hideEarlyCloseModal();
        renderResults();
      });
    }

    function beginUnlockReviewAd(button, keepModalOpen) {
      if (hasUnlockedReview) return;
      retryRewardedAction = function (retryButton) {
        beginUnlockReviewAd(retryButton, true);
      };
      if (!keepModalOpen) hideEarlyCloseModal();
      clearAdStatuses("unlock-ad-status");
      button.disabled = true;
      button.textContent = t.loading.ad;
      requestRewardedAd("before_final_results", function (message) {
        setAdStatus("unlock-ad-status", message);
      }).then(function (granted) {
        if (!granted) {
          button.disabled = false;
          button.textContent = keepModalOpen ? t.rewardedAd.earlyClose.retry : getUnlockReviewButtonLabel();
          return;
        }
        hasUnlockedReview = true;
        button.disabled = true;
        button.textContent = t.results.review.unlockDone;
        var unlockButton = byData("unlock-button");
        if (unlockButton && unlockButton !== button) {
          unlockButton.disabled = true;
          unlockButton.textContent = t.results.review.unlockDone;
        }
        setAdStatus("unlock-ad-status", "");
        hideEarlyCloseModal();
        renderReview(getMissedQuestions());
      });
    }

    root.querySelectorAll('[data-action="start"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (useStartAdGate) {
          if (button.blur) button.blur();
          show("startAdGate", false);
          return;
        }

        beginStartAd(button, "start-ad-status");
      });
    });

    root.querySelectorAll('[data-action="start-gate-continue"]').forEach(function (button) {
      button.addEventListener("click", function () {
        beginStartAd(button, "start-gate-ad-status");
      });
    });

    root.querySelectorAll('[data-action="stage-continue"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (usesRoundCheckpointFlow && harvardStageResultReady) {
          harvardStageResultReady = false;
          saveProgress("question");
          renderQuestion();
          scrollToPageTop();
          return;
        }

        beginStageAd(button, false);
      });
    });

    root.querySelectorAll('[data-action="reveal-results"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (usesRoundCheckpointFlow && harvardStageResultPending) {
          beginStageAd(button, false, "result-ad-status");
          return;
        }

        if (getAnsweredCount() !== quiz.questions.length) return;
        beginResultAd(button, false);
      });
    });

    root.querySelectorAll('[data-action="unlock-review"]').forEach(function (button) {
      button.addEventListener("click", function () {
        beginUnlockReviewAd(button, false);
      });
    });

    root.querySelectorAll('[data-action="restart"]').forEach(function (button) {
      button.addEventListener("click", restartQuiz);
    });

    root.querySelectorAll('[data-action="ad-early-close-retry"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (typeof retryRewardedAction === "function" && !button.disabled) {
          retryRewardedAction(button);
        }
      });
    });

    var didLoadProgress = loadProgress();

    if (!didLoadProgress && autoStartQuiz) {
      startFresh();
      return;
    }

    if (!didLoadProgress) {
      show("start", false);
    }
  }

  boot();
})();
`;
}

export function QuizRunner({ locale, quiz, relatedQuizzes = [], translations }: QuizRunnerProps) {
  const rootId = `quiz-runner-${quiz.slug}-${locale}`;
  const progressKey = `rainbowHub:${locale}:${quiz.slug}:${quiz.questions.length}:progress`;
  const variantClass = [
    quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || quiz.slug === "harvard2" || quiz.slug === "oxford2" || quiz.slug === "cambridge2" || quiz.slug === "airforce" || quiz.slug === "navy" || quiz.slug === "memory" || quiz.slug === "connection" ? "legacy-quiz--short-locked" : "",
    quiz.slug === "paramedic" ? "legacy-quiz--paramedic-display" : "",
  ].filter(Boolean).map((className) => ` ${className}`).join("");
  const script = createQuizRunnerScript({
    locale,
    displayAdUnitPath: siteConfig.googleAdManagerDisplayAdUnitPath,
    progressKey,
    rewardedAdUnitPath: siteConfig.googleAdManagerRewardedAdUnitPath,
    relatedQuizzes,
    quiz,
    rootId,
    translations,
  });
  const html = createQuizRunnerHtml({ quiz, relatedQuizzes, translations });
  const footer = getQuizFooterContent(quiz);

  return (
    <div
      id={rootId}
      className={`legacy-quiz legacy-quiz--${quiz.slug}${variantClass}`}
      suppressHydrationWarning
      style={{ "--quiz-accent": quiz.accent } as CSSProperties}
    >
      <main id="quiz-top" className="legacy-main">
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
        {footer ? <QuizFooter footer={footer} translations={translations} /> : null}
      </main>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  );
}
