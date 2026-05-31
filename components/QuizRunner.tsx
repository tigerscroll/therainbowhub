import type { CSSProperties } from "react";
import { getQuizFooterContent, QuizFooter } from "@/components/QuizFooter";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

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
  const relatedHtml = relatedQuizzes.length
    ? `<div data-js="related-quizzes" class="legacy-related">
          <h3>Try Another Challenge</h3>
          <div class="legacy-related-grid">
            ${relatedQuizzes
              .map((item) => {
                const media = item.thumbnailUrl
                  ? `<img src="${escapeHtml(item.thumbnailUrl)}" alt="${escapeHtml(item.thumbnailAlt ?? item.title)}" />`
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
            <span class="legacy-avatar legacy-avatar--one"></span>
            <span class="legacy-avatar legacy-avatar--two"></span>
            <span class="legacy-avatar legacy-avatar--three"></span>
            <span class="legacy-avatar legacy-avatar--four"></span>
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
          <h2 data-js="question-text"></h2>
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
      </section>

      <section data-screen="result-gate" class="legacy-card legacy-result legacy-result-gate legacy-hidden">
        <span class="legacy-profile-badge">${escapeHtml(translations.quiz.profileReady)}</span>
        <h2 data-js="result-gate-title"></h2>
        <button type="button" data-js="result-gate-button" data-action="reveal-results" class="legacy-primary"></button>
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
        <div class="legacy-unlock-panel">
          <h3 data-js="unlock-title"></h3>
          <p data-js="unlock-copy"></p>
          <button type="button" data-js="unlock-button" data-action="unlock-review" class="legacy-primary"></button>
        </div>
        <div data-js="review" class="legacy-review"></div>
        ${relatedHtml}
      </section>`;
}

function createQuizRunnerScript(config: {
  locale: SupportedLocale;
  progressKey: string;
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
    var preloadedVisuals = {};

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

    function track(eventName, payload) {
      var data = payload || {};
      try { window.fbq?.("trackCustom", eventName, data); } catch (error) {}
      try { window.gtag?.("event", eventName, data); } catch (error) {}
    }

    function trackRewardGranted(payload) {
      track("reward_granted", payload);
    }

    function trackRewardClosed(payload) {
      track("reward_closed", payload);
    }

    function resolveWithoutAd(placement) {
      trackRewardGranted({ placement: placement, fallback: true });
      trackRewardClosed({ placement: placement, reason: "fallback_resolved" });
      return true;
    }

    function requestRewardedAd(placement) {
      return Promise.resolve(resolveWithoutAd(placement));
    }

    function getVisualImageSrc(visualHtml) {
      if (!visualHtml || typeof window.Image !== "function") return "";
      var match = String(visualHtml).match(/<img\\b[^>]*\\bsrc=(["'])(.*?)\\1/i);
      return match ? match[2] : "";
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
      var previousProgressPosition = progressDots.dataset.stagePosition || "";
      var nextProgressPosition = currentStage + ":" + stagePosition;

      byData("round-label").textContent = t.quiz.round + " " + stageNumber;
      byData("count-label").textContent = getStageName(currentStage);
      progressDots.style.setProperty("--progress-count", stageTotal);
      progressDots.style.setProperty("--progress-ratio", stageTotal > 1 ? (stagePosition - 1) / (stageTotal - 1) : 1);
      progressDots.innerHTML = Array.from({ length: stageTotal }).map(function (_, index) {
        var state = index + 1 < stagePosition ? "is-complete" : index + 1 === stagePosition ? "is-current" : "";
        var label = state === "is-complete" ? "✓" : index + 1;
        return '<span class="' + state + '" aria-label="Step ' + (index + 1) + '">' + label + '</span>';
      }).join("");
      progressDots.classList.remove("is-advancing");
      if (previousProgressPosition && previousProgressPosition !== nextProgressPosition) {
        void progressDots.offsetWidth;
        progressDots.classList.add("is-advancing");
      }
      progressDots.dataset.stagePosition = nextProgressPosition;
      byData("question-text").textContent = question.prompt;

      if (question.visual) {
        visualBox.innerHTML = question.visual;
        visualBox.classList.remove("legacy-hidden");
      } else {
        visualBox.innerHTML = "";
        visualBox.classList.add("legacy-hidden");
      }

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
      track("question_answered", {
        quiz_slug: quiz.slug,
        question_index: current,
        stage: question.stage || 0,
        selected_answer_index: choiceIndex,
        selected_profile_id: question.choiceProfileIds ? question.choiceProfileIds[choiceIndex] : undefined,
        correct: isCorrect
      });

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
        track("stage_complete", {
          quiz_slug: quiz.slug,
          stage: currentStage,
          stage_name: getStageName(currentStage),
          score: getScore()
        });
        saveProgress("result-gate");
        showResultGate();
        return;
      }

      if (nextStage !== currentStage) {
        track("stage_complete", {
          quiz_slug: quiz.slug,
          stage: currentStage,
          stage_name: getStageName(currentStage),
          stage_score: getStageScore(currentStage),
          stage_question_count: getStageQuestions(currentStage).length
        });
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
      byData("stage-round-score-label").textContent = isPersonalityQuiz ? "Round complete" : t.results.roundResult;
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
      byData("result-gate-title").textContent = t.quiz.your + " " + quiz.result.profileName + " " + t.quiz.profile;
      byData("result-gate-button").textContent = "Reveal My Result →";
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
      var zodiacStatuses = [
        { title: "First Zodiac Signals", label: "Beginning Your Reading" },
        { title: "Early Personality Patterns", label: "Signs Are Emerging" },
        { title: "Personality Insights", label: "Narrowing The Possibilities" },
        { title: "Strong Zodiac Signal", label: "Your Profile Is Taking Shape" },
        { title: "Values And Drive", label: "Key Traits Identified" },
        { title: "Emotional Patterns", label: "Deeper Connections Found" },
        { title: "Natural Strengths", label: "Your Match Is Becoming Clear" },
        { title: "Core Personality", label: "High Zodiac Alignment" },
        { title: "Final Sign Analysis", label: "Only A Few Signs Remain" },
        { title: "True Zodiac Match", label: "Preparing Your Results" }
      ];
      var fallbackStatuses = [
        { title: "Building", label: "Profile clarity" },
        { title: "Taking shape", label: "Profile clarity" },
        { title: "Getting clearer", label: "Profile clarity" },
        { title: "Strong signal", label: "Profile clarity" },
        { title: "Profile forming", label: "Profile clarity" },
        { title: "Nearly clear", label: "Profile clarity" },
        { title: "Almost ready", label: "Profile clarity" },
        { title: "Profile locked", label: "Profile clarity" }
      ];
      var statuses = quiz.slug === "zodiac" ? zodiacStatuses : fallbackStatuses;
      return statuses[stage % statuses.length];
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

    function renderResults(shouldScroll, shouldTrack) {
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
      byData("final-score-label").textContent = isPersonalityQuiz ? "Answered" : t.quiz.finalScore;
      byData("percentile").textContent = profile.percentile;
      byData("percentile-label").textContent = isPersonalityQuiz ? "Result" : t.quiz.profile;
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

      show("results", shouldScroll);
      if (shouldTrack !== false) {
        track("quiz_complete", {
          quiz_slug: quiz.slug,
          quiz_title: quiz.title,
          score: score,
          question_count: quiz.questions.length
        });
      }
      saveProgress("results");
    }

    function startFresh() {
      current = 0;
      answers = {};
      hasUnlockedReview = false;
      saveProgress("question");
      renderQuestion();
    }

    function restartQuiz() {
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

    function beginStartAd(button) {
        setButtonLoading(button, t.quiz.preparing, true);
        requestRewardedAd("before_start").then(function () {
          track("quiz_start", {
            quiz_slug: quiz.slug,
            quiz_title: quiz.title,
            question_count: quiz.questions.length
          });
          setButtonLoading(button, t.quiz.preparing, false);
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

        beginStartAd(button);
      });
    });

    root.querySelectorAll('[data-action="start-gate-continue"]').forEach(function (button) {
      button.addEventListener("click", function () {
        beginStartAd(button);
      });
    });

    root.querySelectorAll('[data-action="stage-continue"]').forEach(function (button) {
      button.addEventListener("click", function () {
        setButtonLoading(button, t.loading.ad, true);
        requestRewardedAd("before_stage_results").then(function () {
          setButtonLoading(button, t.loading.ad, false);
          saveProgress("question");
          renderQuestion();
        });
      });
    });

    root.querySelectorAll('[data-action="reveal-results"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (getAnsweredCount() !== quiz.questions.length) return;
        setButtonLoading(button, t.quiz.preparingResults, true);
        requestRewardedAd("before_final_results").then(function () {
          setButtonLoading(button, t.quiz.preparingResults, false);
          renderResults();
        });
      });
    });

    root.querySelectorAll('[data-action="unlock-review"]').forEach(function (button) {
      button.addEventListener("click", function () {
        if (hasUnlockedReview) return;
        button.disabled = true;
        button.textContent = t.loading.ad;
        requestRewardedAd("before_final_results").then(function () {
          hasUnlockedReview = true;
          button.disabled = true;
          button.textContent = t.results.review.unlockDone;
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
  const progressKey = `rainbowHub:${quiz.slug}:${quiz.questions.length}:progress`;
  const script = createQuizRunnerScript({
    locale,
    progressKey,
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
