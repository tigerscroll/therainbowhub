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
  const displayAdHtml = "";
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
    var isUniversityEntranceQuiz = isHarvard2Quiz || isOxford2Quiz || isCambridge2Quiz;
    var usesRoundCheckpointFlow = isUniversityEntranceQuiz || quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic";
    var isShortLockedScoreQuiz = quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || isUniversityEntranceQuiz;
    var usesCompactProgress = isShortLockedScoreQuiz;
    var autoStartQuiz = false;
    var hideAnswerFeedback = isShortLockedScoreQuiz;
    var skipFinalRewardedGate = false;
    var skipStageRewardedGates = false;
    var autoCloseRewardedOnGrant = isUniversityEntranceQuiz;
    var useQuestionDisplayAd = false;
    var useDisplayAds = useQuestionDisplayAd;
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
    var rewardedGrantedCount = readSessionNumber(rewardedGrantedCountKey, 0);
    var rewardedClosedCount = readSessionNumber(rewardedClosedCountKey, 0);
    var rewardTracked = readSessionFlag(rewardTrackedKey);
    var reward2Tracked = readSessionFlag(reward2TrackedKey);
    var rewardClosedTracked = readSessionFlag(rewardClosedTrackedKey);
    var rewardClosed2Tracked = readSessionFlag(rewardClosed2TrackedKey);
    var quizStartTracked = readSessionFlag(quizStartTrackedKey);
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

    function trackRewardGranted(payload) {
      var data = payload || {};
      rewardedGrantedCount += 1;
      writeSessionValue(rewardedGrantedCountKey, rewardedGrantedCount);
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

            var questionDisplayAdSizes = isAnatomyDisplayVariant ? [[336, 280], [300, 250]] : [300, 250];
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
      var shouldShowDisplayAd = !isAnatomyDisplayVariant || questionIndex >= 1;
      if (displayWrap) displayWrap.classList.toggle("legacy-hidden", !shouldShowDisplayAd);
      if (!shouldShowDisplayAd) return;

      ensureQuestionDisplayAd();
      if (!questionDisplayAdLoaded || !questionDisplayAdSlot || questionIndex < 2) return;

      var refreshStep = Math.floor(questionIndex / 2);
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
      if (t.locale && t.locale.code === "nl") {
        return {
          round: "Ronde",
          results: "resultaten",
          lockedNext: "Je score is vastgelegd. Start de volgende ronde wanneer je klaar bent.",
          lockedFinal: "Je score is vastgelegd. Het eindresultaat is nu aan de beurt.",
          nextStage: "Volgende ronde",
          roundScore: "Rondescore",
          scoreSoFar: "Score tot nu toe",
          complete: "voltooid",
          startNext: "Start volgende ronde →",
          seeFinal: "Bekijk eindresultaat →",
          roundUnlock: "Een korte ontgrendeling toont je rondescore."
        };
      }

      if (t.locale && t.locale.code === "de") {
        return {
          round: "Runde",
          results: "Ergebnisse",
          lockedNext: "Deine Punktzahl ist gespeichert. Starte die nächste Runde, wenn du bereit bist.",
          lockedFinal: "Deine Punktzahl ist gespeichert. Jetzt folgt das Endergebnis.",
          nextStage: "Nächste Runde",
          roundScore: "Rundenergebnis",
          scoreSoFar: "Punktzahl bisher",
          complete: "abgeschlossen",
          startNext: "Nächste Runde starten →",
          seeFinal: "Endergebnis ansehen →",
          roundUnlock: "Eine kurze Freischaltung zeigt deine Punktzahl für diese Runde."
        };
      }

      return {
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
      byData("stage-icon").textContent = stageScore >= Math.ceil(stageTotal * 0.8) ? "🏆" : quiz.cardIcon || "✅";
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
      var isShortLockedScoreQuiz = quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || isUniversityEntranceQuiz;
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
      return quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || isUniversityEntranceQuiz ? "View Incorrect Answers" : t.results.review.unlockButton;
    }

    function hidesAnswerExplanations() {
      return quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "paramedic";
    }

    function getShortLockedResultGateTitle() {
      if (t.locale && t.locale.code === "de") return "Deine Ergebnisse sind bereit.";
      return t.locale && t.locale.code === "nl" ? "Je resultaten zijn klaar." : "Your results are ready.";
    }

    function getShortLockedResultGateCopy() {
      if (usesRoundCheckpointFlow && harvardStageResultPending) {
        return getRoundCheckpointText().roundUnlock;
      }

      if (t.locale && t.locale.code === "de") return "Eine kurze Freischaltung zeigt deine Punktzahl und Antwortübersicht.";
      return t.locale && t.locale.code === "nl" ? "Een korte ontgrendeling toont je score en antwoordoverzicht." : "One short unlock reveals your score and answer review.";
    }

    function getShortLockedResultGateButtonLabel() {
      if (t.locale && t.locale.code === "de") return "Meine Ergebnisse ansehen →";
      return t.locale && t.locale.code === "nl" ? t.results.viewResults + " →" : "See My Results →";
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
      var isShortLockedScoreQuiz = quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || isUniversityEntranceQuiz;
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
    }

    function startFresh() {
      clearAdStatuses();
      current = 0;
      answers = {};
      hasUnlockedReview = false;
      harvardStageResultPending = false;
      harvardStageResultReady = false;
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
    quiz.slug === "nursing2" || quiz.slug === "anatomy2" || quiz.slug === "pilot2" || quiz.slug === "bible" || quiz.slug === "paramedic" || quiz.slug === "harvard2" || quiz.slug === "oxford2" || quiz.slug === "cambridge2" ? "legacy-quiz--short-locked" : "",
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
