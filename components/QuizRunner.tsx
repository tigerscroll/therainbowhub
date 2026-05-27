import type { CSSProperties } from "react";
import type { SupportedLocale, Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

type QuizRunnerProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  translations: Translations;
};

const percentTokenPattern = /^\d+(?:\.\d+)?%$/;

function escapeHtml(value: unknown) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderTitleWithAccentPercent(title: string) {
  const parts = title.split(/(\d+(?:\.\d+)?%)/g);

  return parts
    .map((part) => (percentTokenPattern.test(part) ? `<span>${escapeHtml(part)}</span>` : escapeHtml(part)))
    .join("");
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function renderInfoIcon(type: "building" | "path" | "brain" | "report" | "search" | "bolt" | "star") {
  const icons = {
    building:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 40h32M12 36V18m8 18V18m8 18V18m8 18V18M7 18h34L24 8 7 18Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    path:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 33c7-11 13 3 20-8s11-4 12-4" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M32 8v18m0-16h9l-3 4 3 4h-9" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="33" r="3" fill="currentColor"/><circle cx="28" cy="25" r="3" fill="currentColor"/></svg>',
    brain:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 10c-5 0-8 4-8 9-4 2-5 8-1 12-1 5 3 9 8 9 3 0 5-2 6-4 1 2 3 4 6 4 5 0 9-4 8-9 4-4 3-10-1-12 0-5-3-9-8-9-3 0-5 2-6 4-1-2-3-4-6-4Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 14v22M17 21h7m0 7h-7m14-7h-7m7 7h-7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
    report:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 6h17l7 7v29H13V6Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M29 6v9h8M18 24h10M18 31h7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="34" cy="34" r="8" fill="white" stroke="currentColor" stroke-width="3.5"/><path d="m30 34 3 3 6-7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="21" r="12" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="m30 30 10 10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
    bolt:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 4 10 27h13l-2 17 17-24H25l2-16Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
    star:
      '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 7 5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1 5-11Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
  };

  return icons[type];
}

function getDimensionSubtitle(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("pattern")) return "Find what others miss.";
  if (normalized.includes("number")) return "Work through the numbers.";
  if (normalized.includes("deduction") || normalized.includes("logic")) return "Think clearly.";
  if (normalized.includes("lateral") || normalized.includes("flexible")) return "Adapt under pressure.";

  return "Build sharper judgement.";
}

function renderQuizInfoPanel(quiz: Quiz, translations: Translations) {
  if (!quiz.infoPanel) {
    return "";
  }

  const firstColumn = quiz.infoPanel.columns[0];
  const secondColumn = quiz.infoPanel.columns[1] || quiz.infoPanel.columns[0];
  const testBullets = quiz.result.scoreDimensions
    .map((dimension) => `<li><span aria-hidden="true">✓</span>${escapeHtml(dimension.label)}</li>`)
    .join("");
  const featureCards = quiz.result.scoreDimensions
    .slice(0, 3)
    .map((dimension, index) => {
      const icons: Array<"brain" | "search" | "bolt"> = ["brain", "search", "bolt"];
      return `<div class="quiz-info-panel__skill quiz-info-panel__skill--${index + 1}">
        <span class="quiz-info-panel__skill-icon">${renderInfoIcon(icons[index] || "star")}</span>
        <strong>${escapeHtml(dimension.label)}</strong>
        <small>${escapeHtml(getDimensionSubtitle(dimension.label))}</small>
      </div>`;
    })
    .join("");

  return `<section class="legacy-card quiz-info-panel">
    <div class="quiz-info-panel__intro">
      <span class="quiz-info-panel__icon quiz-info-panel__icon--primary">${renderInfoIcon("building")}</span>
      <div>
        <h2>${escapeHtml(quiz.infoPanel.title)}</h2>
        <p>${escapeHtml(quiz.infoPanel.intro)}</p>
      </div>
    </div>

    <div class="quiz-info-panel__columns">
      <div class="quiz-info-panel__column">
        <span class="quiz-info-panel__icon">${renderInfoIcon("path")}</span>
        <h3>${escapeHtml(firstColumn.title)}</h3>
        <p>${escapeHtml(firstColumn.body)}</p>
      </div>
      <div class="quiz-info-panel__column">
        <span class="quiz-info-panel__icon">${renderInfoIcon("brain")}</span>
        <h3>${escapeHtml(secondColumn.title)}</h3>
        <p>${escapeHtml(secondColumn.body)}</p>
        <ul class="quiz-info-panel__checks">${testBullets}</ul>
      </div>
    </div>

    <div class="quiz-info-panel__scoring">
      <span class="quiz-info-panel__icon quiz-info-panel__icon--purple">${renderInfoIcon("report")}</span>
      <div>
        <h3>${escapeHtml(quiz.infoPanel.footerTitle)}</h3>
        <p>${escapeHtml(quiz.infoPanel.footerBody)}</p>
      </div>
    </div>

    <div class="quiz-info-panel__notice">
      <span>${renderInfoIcon("star")}</span>
      <strong>There is no pass or fail score. The challenge increases gradually as you progress.</strong>
    </div>

    <div class="quiz-info-panel__skills">${featureCards}</div>

    <button type="button" data-action="restart" class="legacy-primary legacy-restart">
      <span aria-hidden="true">▶</span> ${escapeHtml(translations.quiz.restartTest)}
    </button>
    <p class="quiz-info-panel__restart-note">Your progress will be cleared and the challenge will restart.</p>
  </section>`;
}

function createQuizRunnerHtml(config: {
  quiz: Quiz;
  script: string;
  translations: Translations;
}) {
  const { quiz, script, translations } = config;
  const infoPanel = renderQuizInfoPanel(quiz, translations);

  return `<main id="quiz-top" class="legacy-main">
      <section data-screen="start" class="legacy-card legacy-start">
        <div class="legacy-badge" aria-hidden="true"><span>${escapeHtml(quiz.cardIcon)}</span></div>
        <h1>${renderTitleWithAccentPercent(quiz.pageTitle)}</h1>
        <p class="legacy-sub">
          ${escapeHtml(quiz.landing.quickStartText)}
          <br />
          ${escapeHtml(quiz.landing.challengeText)}
        </p>
        <div class="legacy-social">
          <div class="legacy-avatars" aria-hidden="true">
            <span class="legacy-avatar legacy-avatar--one"></span>
            <span class="legacy-avatar legacy-avatar--two"></span>
            <span class="legacy-avatar legacy-avatar--three"></span>
            <span class="legacy-avatar legacy-avatar--four"></span>
          </div>
          <div><strong>${escapeHtml(quiz.landing.socialProof)}</strong></div>
        </div>
        <button class="legacy-primary" type="button" data-action="start">
          <span aria-hidden="true">▶</span> ${escapeHtml(translations.quiz.startTest)}
        </button>
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">✓</span>
          <span>${escapeHtml(translations.quiz.shortAd)} — <b>${escapeHtml(translations.quiz.thenBegins)}</b></span>
        </div>
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
            <span><strong data-js="stage-round-score"></strong><em>${escapeHtml(translations.results.roundResult)}</em></span>
            <span><strong data-js="stage-score"></strong><em>${escapeHtml(translations.results.scoreSoFar)}</em></span>
          </div>
        </div>
        <div data-js="stage-trail" class="legacy-stage-trail" aria-hidden="true"></div>
        <button type="button" data-js="stage-button" data-action="stage-continue" class="legacy-primary legacy-stage-button"></button>
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">i</span>
          <span>${escapeHtml(translations.rewardedAd.helper)}</span>
        </div>
      </section>

      <section data-screen="result-gate" class="legacy-card legacy-result legacy-hidden">
        <span class="legacy-profile-badge">${escapeHtml(translations.quiz.profileReady)}</span>
        <h2 data-js="result-gate-title"></h2>
        <button type="button" data-js="result-gate-button" data-action="reveal-results" class="legacy-primary"></button>
        <div class="legacy-ad-note">
          <span class="legacy-shield" aria-hidden="true">i</span>
          <span>${escapeHtml(translations.rewardedAd.helper)}</span>
        </div>
      </section>

      <section data-screen="results" class="legacy-card legacy-result legacy-hidden">
        <span data-js="result-profile-badge" class="legacy-profile-badge"></span>
        <h2 data-js="result-title"></h2>
        <p data-js="result-copy" class="legacy-sub"></p>
        <div class="legacy-score"><strong data-js="final-score"></strong><span>${escapeHtml(translations.quiz.finalScore)}</span></div>
        <div class="legacy-score"><strong data-js="percentile"></strong><span>${escapeHtml(translations.quiz.profile)}</span></div>
        <div data-js="cognitive-scores" class="legacy-cognitive-scores"></div>
        <div class="legacy-unlock-panel">
          <h3 data-js="unlock-title"></h3>
          <p data-js="unlock-copy"></p>
          <button type="button" data-js="unlock-button" data-action="unlock-review" class="legacy-primary"></button>
        </div>
        <div data-js="review" class="legacy-review"></div>
      </section>
      ${infoPanel}
    </main>
    <script>${script}</script>`;
}

function createQuizRunnerScript(config: {
  locale: SupportedLocale;
  progressKey: string;
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
    var current = 0;
    var answers = {};
    var advanceTimer = null;
    var hasUnlockedReview = false;

    var screens = {
      start: root.querySelector('[data-screen="start"]'),
      question: root.querySelector('[data-screen="question"]'),
      stageGate: root.querySelector('[data-screen="stage-gate"]'),
      resultGate: root.querySelector('[data-screen="result-gate"]'),
      results: root.querySelector('[data-screen="results"]')
    };

    function byData(name) {
      return root.querySelector('[data-js="' + name + '"]');
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
          var headerOffset = header ? header.getBoundingClientRect().height : 50;
          var headerBorder = header ? parseFloat(window.getComputedStyle(header).borderBottomWidth) || 4 : 4;
          var visibleHeaderOffset = window.matchMedia("(max-width: 619px)").matches ? headerBorder : headerOffset;
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
      // Local testing mode: rewarded ad gates continue immediately.
      // Reconnect Google Ad Manager rewarded code here when you are ready to test ads.
      return Promise.resolve(resolveWithoutAd(placement));
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
      return quiz.questions.reduce(function (total, question, index) {
        return total + (answers[index] === question.answerIndex ? 1 : 0);
      }, 0);
    }

    function getStageScore(stage) {
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
        button.classList.toggle("correct", isSelected && isCorrect);
        button.classList.toggle("wrong", isSelected && !isCorrect);
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
      var stageQuestions = getStageQuestions(currentStage);
      var stagePosition = getCurrentStagePosition(currentStage);
      var stageTotal = stageQuestions.length || 1;
      var stageIndexes = getStageIndexes();
      var stageNumber = stageIndexes.indexOf(currentStage) + 1;
      var stageCount = stageIndexes.length;
      var visualBox = byData("visual");
      var answersBox = byData("answers");
      var progressDots = byData("progress-dots");

      byData("round-label").textContent = t.quiz.round + " " + stageNumber;
      byData("count-label").textContent = getStageName(currentStage);
      progressDots.style.setProperty("--progress-count", stageTotal);
      progressDots.innerHTML = Array.from({ length: stageTotal }).map(function (_, index) {
        var state = index + 1 < stagePosition ? "is-complete" : index + 1 === stagePosition ? "is-current" : "";
        return '<span class="' + state + '"></span>';
      }).join("");
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
        correct: isCorrect
      });

      advanceTimer = window.setTimeout(function () {
        advanceAfterAnswer(choiceIndex);
      }, isCorrect ? correctAnswerDelayMs : wrongAnswerDelayMs);
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
      byData("stage-round-score").textContent = stageScore + "/" + stageTotal;
      byData("stage-score").textContent = getScore() + "/" + current;
      byData("stage-trail").innerHTML = stageIndexes.map(function (stage, index) {
        var status = stage <= completedStage ? "complete" : stage === nextStage ? "next" : "locked";
        var label = stage === nextStage ? getStageName(stage) : t.quiz.round + " " + (index + 1);
        return '<span class="legacy-stage-trail__dot legacy-stage-trail__dot--' + status + '" title="' + escapeHtml(label) + '">' + (status === "complete" ? "✓" : "") + '</span>';
      }).join("");
      byData("stage-button").textContent = buttonLabel;
      byData("stage-button").dataset.readyText = buttonLabel;
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

    function getResultProfile(score, total, strongestStage) {
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

    function renderResults(shouldScroll) {
      var score = getScore();
      var stageScores = getStageScores();
      var strongestStage = getStrongestStage(stageScores);
      var profile = getResultProfile(score, quiz.questions.length, strongestStage);
      var missedQuestions = getMissedQuestions();
      var missedQuestionLabel = missedQuestions.length === 1
        ? t.results.review.missedQuestionSingular
        : t.results.review.missedQuestionPlural;

      hasUnlockedReview = false;
      byData("result-profile-badge").textContent = profile.tier + " • " + strongestStage.name;
      byData("result-title").textContent = profile.title;
      byData("result-copy").textContent = profile.copy;
      byData("final-score").textContent = score + "/" + quiz.questions.length;
      byData("percentile").textContent = profile.percentile;
      byData("cognitive-scores").innerHTML = quiz.result.scoreDimensions.map(function (dimension) {
        return '<div class="legacy-cog-item"><strong>' + scoreForCategories(dimension.categories) + '</strong><span>' + escapeHtml(dimension.label) + '</span></div>';
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
      track("quiz_complete", {
        quiz_slug: quiz.slug,
        quiz_title: quiz.title,
        score: score,
        question_count: quiz.questions.length
      });
      clearProgress();
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
        var savedScreen = parsed.screen === "stage-gate" || parsed.screen === "result-gate" ? parsed.screen : "question";

        if (!Number.isInteger(savedCurrent) || savedCurrent < 0 || savedCurrent >= quiz.questions.length) {
          clearProgress();
          return false;
        }

        answers = normalizeAnswers(parsed.answers);
        var resumePoint = savedScreen === "question" && answers[savedCurrent] !== undefined
          ? getResumePointAfterAnsweredQuestion(savedCurrent)
          : { currentQuestion: savedCurrent, screen: savedScreen === "stage-gate" ? "stageGate" : savedScreen === "result-gate" ? "resultGate" : "question" };

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

        saveProgress("question");
        renderQuestion(false);
        return true;
      } catch (error) {
        clearProgress();
        return false;
      }
    }

    root.querySelectorAll('[data-action="start"]').forEach(function (button) {
      button.addEventListener("click", function () {
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

export function QuizRunner({ locale, quiz, translations }: QuizRunnerProps) {
  const rootId = `quiz-runner-${quiz.slug}-${locale}`;
  const progressKey = `rainbowHub:${quiz.slug}:${quiz.questions.length}:progress`;
  const script = createQuizRunnerScript({
    locale,
    progressKey,
    quiz,
    rootId,
    translations,
  });
  const html = createQuizRunnerHtml({ quiz, script, translations });

  return (
    <div
      id={rootId}
      className={`legacy-quiz legacy-quiz--${quiz.slug}`}
      suppressHydrationWarning
      style={{ "--quiz-accent": quiz.accent } as CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
