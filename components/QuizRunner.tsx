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

function renderTitleWithAccentPercent(title: string) {
  const parts = title.split(/(\d+(?:\.\d+)?%|\d+\/\d+)/g);

  return parts
    .map((part) => (titleAccentTokenPattern.test(part) ? `<span>${escapeHtml(part)}</span>` : escapeHtml(part)))
    .join("");
}

function renderSocialProof(value: string) {
  const match = value.match(/^(.+?\bpeople\b)(.*)$/i);

  if (!match) {
    return escapeHtml(value);
  }

  return `${escapeHtml(match[1])}<span class="legacy-social__muted">${escapeHtml(match[2])}</span>`;
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
  const landingLines = [quiz.landing.quickStartText, quiz.landing.challengeText]
    .filter((line) => line && line.trim().length > 0)
    .map((line) => escapeHtml(line))
    .join("<br />");
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
        <h1>${renderTitleWithAccentPercent(quiz.pageTitle)}</h1>
        <p class="legacy-sub">${landingLines}</p>
        <div class="legacy-social">
          <div class="legacy-avatars" aria-hidden="true">
            ${avatarHtml}
          </div>
          <div><strong>${renderSocialProof(quiz.landing.socialProof)}</strong></div>
        </div>
        <button class="legacy-primary" type="button" data-action="start">
          <span aria-hidden="true">▶</span> ${escapeHtml(translations.quiz.startTest)}
        </button>
        <div class="legacy-ad-note" data-js="start-ad-note">
          <span class="legacy-shield" aria-hidden="true">✓</span>
          <span>${escapeHtml(translations.quiz.shortAd)} — <b>${escapeHtml(translations.quiz.thenBegins)}</b></span>
        </div>
        <div class="legacy-ad-status" data-js="start-ad-status" aria-live="polite"></div>
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
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">i</span>
          <span>${escapeHtml(translations.rewardedAd.helper)}</span>
        </div>
        <div class="legacy-ad-status" data-js="stage-ad-status" aria-live="polite"></div>
      </section>

      <section data-screen="result-gate" class="legacy-card legacy-result legacy-result-gate legacy-hidden">
        <span class="legacy-profile-badge">${escapeHtml(translations.quiz.profileReady)}</span>
        <h2 data-js="result-gate-title"></h2>
        <button type="button" data-js="result-gate-button" data-action="reveal-results" class="legacy-primary"></button>
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">i</span>
          <span>${escapeHtml(translations.rewardedAd.helper)}</span>
        </div>
        <div class="legacy-ad-status" data-js="result-ad-status" aria-live="polite"></div>
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
        <div class="legacy-unlock-panel">
          <h3 data-js="unlock-title"></h3>
          <p data-js="unlock-copy"></p>
          <button type="button" data-js="unlock-button" data-action="unlock-review" class="legacy-primary"></button>
          <div class="legacy-ad-status" data-js="unlock-ad-status" aria-live="polite"></div>
        </div>
        <div data-js="review" class="legacy-review"></div>
        ${relatedHtml}
      </section>`;
}

function createQuizRunnerScript(config: {
  locale: SupportedLocale;
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
    var current = 0;
    var answers = {};
    var advanceTimer = null;
    var hasUnlockedReview = false;
    var useStartAdGate = false;
    var activeRewardedAd = null;
    var rewardedListenersInstalled = false;
    var rewardedServicesEnabled = false;
    var rewardedRequestId = 0;
    var googlePublisherTagUrl = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    var preloadedVisuals = {};

    window.googletag = window.googletag || { cmd: [] };

    try {
      useStartAdGate = new URLSearchParams(window.location.search).get("gate") === "1";
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

    function clearAdStatuses() {
      ["start-ad-status", "start-gate-ad-status", "stage-ad-status", "result-ad-status", "unlock-ad-status"].forEach(function (name) {
        setAdStatus(name, "");
      });
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

      if (shouldScroll !== false) {
        window.requestAnimationFrame(function () {
          var target = screens[screenName] || root.querySelector("#quiz-top");
          var header = document.querySelector(".hub-header");
          var headerBorder = header ? parseFloat(window.getComputedStyle(header).borderBottomWidth) || 4 : 4;
          var visibleHeaderOffset = headerBorder;
          var targetTop = 0;
          var node = target;
          while (node) {
            targetTop += node.offsetTop || 0;
            node = node.offsetParent;
          }
          var top = targetTop - visibleHeaderOffset;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        });
      }
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

    function trackRewardGranted(payload) {
      var data = payload || {};
      try { console.log("fbq custom event: Reward", data); } catch (error) {}
      try { window.fbq?.("trackCustom", "Reward", data); } catch (error) {}
    }

    function trackRewardClosed(payload) {
      var data = payload || {};
      if (data.granted === true && data.reason === "reward_granted") {
        try { console.log("fbq custom event: RewardClosed", data); } catch (error) {}
        try { window.fbq?.("trackCustom", "RewardClosed", data); } catch (error) {}
      }
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

              if (!rewardedServicesEnabled) {
                window.googletag.enableServices();
                rewardedServicesEnabled = true;
              }

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
              setStatus(t.rewardedAd.status.closedWithoutReward);
              window.setTimeout(tryAd, 350);
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
      if (!isPersonalityQuiz) return;
      var question = quiz.questions[questionIndex];
      var src = question ? getVisualImageSrc(question.visual) : "";
      if (!src || preloadedVisuals[src]) return;
      preloadedVisuals[src] = true;
      var image = new Image();
      image.src = src;
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
        button.classList.toggle("correct", !isPersonalityQuiz && isSelected && isCorrect);
        button.classList.toggle("wrong", !isPersonalityQuiz && isSelected && !isCorrect);
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
      byData("round-label").textContent = t.quiz.round + " " + stageNumber;
      byData("count-label").textContent = getStageName(currentStage);
      progressDots.style.setProperty("--progress-count", stageTotal);
      progressDots.style.setProperty("--progress-ratio", stageTotal > 1 ? (stagePosition - 1) / (stageTotal - 1) : 1);
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

      preloadQuestionVisual(current + 1);
      show("question", shouldScroll);
    }

    function answerQuestion(choiceIndex) {
      if (answers[current] !== undefined) return;

      clearAdvanceTimer();
      var question = quiz.questions[current];
      var isCorrect = question.answerIndex === choiceIndex;
      answers[current] = choiceIndex;
      saveProgress("question");
      applyAnswerState(choiceIndex);

      advanceTimer = window.setTimeout(function () {
        advanceAfterAnswer(choiceIndex);
      }, isPersonalityQuiz || isCorrect ? correctAnswerDelayMs : wrongAnswerDelayMs);
    }

    function advanceAfterAnswer(choiceIndex) {
      var question = quiz.questions[current];
      var currentStage = question.stage || 0;
      var nextQuestion = quiz.questions[current + 1];
      var nextStage = nextQuestion ? (nextQuestion.stage || 0) : currentStage;

      if (!nextQuestion) {
        saveProgress("result-gate");
        showResultGate();
        return;
      }

      if (nextStage !== currentStage) {
        current += 1;
        saveProgress("stage-gate");
        showStageGate();
        return;
      }

      current += 1;
      saveProgress("question");
      renderQuestion();
    }

    function showStageGate(shouldScroll) {
      clearAdStatuses();
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

      byData("stage-title").textContent = t.quiz.round + " " + (completedStage + 1) + " " + t.results.complete;
      byData("stage-icon").textContent = stageIcons[completedStage % stageIcons.length];
      byData("stage-copy").textContent = copy;
      byData("stage-next").classList.toggle("legacy-hidden", !nextStageName);
      byData("stage-next-label").textContent = nextStageName ? t.results.nextStage : "";
      byData("stage-next-name").textContent = nextStageName || "";
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

    function showResultGate(shouldScroll) {
      clearAdStatuses();
      byData("result-gate-title").textContent = t.quiz.your + " " + quiz.result.profileName + " " + t.quiz.profile;
      byData("result-gate-button").textContent = t.results.viewResults + " →";
      byData("result-gate-button").disabled = getAnsweredCount() !== quiz.questions.length;
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

        if (question.explanation) {
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
      byData("result-profile-badge").textContent = isPersonalityQuiz ? profile.tier : profile.tier + " • " + strongestStage.name;
      byData("result-title").textContent = profile.title;
      byData("result-copy").textContent = profile.copy;
      byData("final-score").textContent = isPersonalityQuiz ? getAnsweredCount() + "/" + quiz.questions.length : score + "/" + quiz.questions.length;
      byData("final-score-label").textContent = isPersonalityQuiz ? t.quiz.answered : t.quiz.finalScore;
      byData("percentile").textContent = quiz.slug === "iq" && !isPersonalityQuiz ? getIqRange(score, quiz.questions.length) : profile.percentile;
      byData("percentile-label").textContent = quiz.slug === "iq" && !isPersonalityQuiz ? t.quiz.estimatedIqRange : isPersonalityQuiz ? t.results.viewResults : t.quiz.profile;
      byData("result-meter-fill").style.width = isPersonalityQuiz
        ? Math.round(((profile.count || 0) / Math.max(1, getAnsweredCount())) * 100) + "%"
        : Math.round((score / quiz.questions.length) * 100) + "%";
      byData("cognitive-scores").innerHTML = quiz.result.scoreDimensions.map(function (dimension) {
        var dimensionScore = scoreForCategories(dimension.categories);
        return '<div class="legacy-cog-item" style="--skill-score:' + dimensionScore + '%"><strong>' + dimensionScore + '</strong><span>' + escapeHtml(dimension.label) + '</span><em aria-hidden="true"><i></i></em></div>';
      }).join("");
      byData("stage-breakdown").innerHTML = stageScores.map(function (stage, index) {
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
      byData("unlock-button").textContent = t.results.review.unlockButton;
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
      show("start");
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

    function beginStartAd(button, statusName) {
        clearAdStatuses();
        setButtonLoading(button, t.loading.ad, true);
        requestRewardedAd("before_start", function (message) {
          setAdStatus(statusName, message);
        }).then(function (granted) {
          if (!granted) {
            setButtonLoading(button, t.quiz.preparing, false);
            setAdStatus(statusName, "");
            return;
          }
          setButtonLoading(button, t.quiz.preparing, false);
          setAdStatus(statusName, "");
          startFresh();
        });
    }

    root.querySelectorAll('[data-action="start"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (useStartAdGate) {
          var currentScroll = window.scrollY || 0;
          if (button.blur) button.blur();
          show("startAdGate", false);
          window.scrollTo(0, currentScroll);
          window.requestAnimationFrame(function () {
            window.scrollTo(0, currentScroll);
            window.setTimeout(function () {
              window.scrollTo(0, currentScroll);
            }, 80);
          });
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
        clearAdStatuses();
        setButtonLoading(button, t.loading.ad, true);
        requestRewardedAd("before_stage_results", function (message) {
          setAdStatus("stage-ad-status", message);
        }).then(function (granted) {
          setButtonLoading(button, t.loading.ad, false);
          if (!granted) return;
          setAdStatus("stage-ad-status", "");
          saveProgress("question");
          renderQuestion();
        });
      });
    });

    root.querySelectorAll('[data-action="reveal-results"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (getAnsweredCount() !== quiz.questions.length) return;
        clearAdStatuses();
        setButtonLoading(button, t.loading.ad, true);
        requestRewardedAd("before_final_results", function (message) {
          setAdStatus("result-ad-status", message);
        }).then(function (granted) {
          setButtonLoading(button, t.loading.ad, false);
          if (!granted) return;
          setAdStatus("result-ad-status", "");
          renderResults();
        });
      });
    });

    root.querySelectorAll('[data-action="unlock-review"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (hasUnlockedReview) return;
        clearAdStatuses();
        button.disabled = true;
        button.textContent = t.loading.ad;
        requestRewardedAd("before_final_results", function (message) {
          setAdStatus("unlock-ad-status", message);
        }).then(function (granted) {
          if (!granted) {
            button.disabled = false;
            button.textContent = t.results.review.unlockButton;
            setAdStatus("unlock-ad-status", "");
            return;
          }
          hasUnlockedReview = true;
          button.disabled = true;
          button.textContent = t.results.review.unlockDone;
          setAdStatus("unlock-ad-status", "");
          renderReview(getMissedQuestions());
        });
      });
    });

    root.querySelectorAll('[data-action="restart"]').forEach(function (button) {
      button.addEventListener("click", restartQuiz);
    });

    if (!loadProgress()) {
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
  const script = createQuizRunnerScript({
    locale,
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
      className={`legacy-quiz legacy-quiz--${quiz.slug}`}
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
