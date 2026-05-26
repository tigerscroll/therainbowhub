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

function createQuizRunnerHtml(config: {
  quiz: Quiz;
  script: string;
  translations: Translations;
}) {
  const { quiz, script, translations } = config;
  const infoPanel = quiz.infoPanel
    ? `<section class="legacy-card quiz-info-panel">
          <h2>${escapeHtml(quiz.infoPanel.title)}</h2>
          <p>${escapeHtml(quiz.infoPanel.intro)}</p>
          <div class="quiz-info-panel__columns">
            ${quiz.infoPanel.columns
              .map(
                (column) => `<div>
                  <h3>${escapeHtml(column.title)}</h3>
                  <p>${escapeHtml(column.body)}</p>
                </div>`,
              )
              .join("")}
          </div>
          <div class="quiz-info-panel__footer">
            <h3>${escapeHtml(quiz.infoPanel.footerTitle)}</h3>
            <p>${escapeHtml(quiz.infoPanel.footerBody)}</p>
          </div>
          <button type="button" data-action="restart" class="legacy-primary legacy-restart">
            ${escapeHtml(translations.quiz.restartTest)}
          </button>
        </section>`
    : "";

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
        <h2 data-js="stage-title"></h2>
        <p data-js="stage-copy" class="legacy-stage-copy"></p>
        <p data-js="stage-next" class="legacy-stage-next"></p>
        <div class="legacy-stage-stats">
          <div><strong data-js="stage-score"></strong><span>${escapeHtml(translations.results.scoreSoFar)}</span></div>
          <div><strong data-js="stage-badge"></strong><span>${escapeHtml(translations.results.roundResult)}</span></div>
        </div>
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
    </main>
    ${infoPanel}
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
          root.querySelector("#quiz-top")?.scrollIntoView({ block: "start", behavior: "smooth" });
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

    function getStageBadge(stage) {
      var stageQuestions = getStageQuestions(stage);
      var stageScore = getStageScore(stage);

      if (stageScore >= Math.ceil(stageQuestions.length * 0.75)) return t.results.excellent;
      if (stageScore >= Math.ceil(stageQuestions.length * 0.5)) return t.results.strong;
      return t.results.keepGoing;
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
      var visualBox = byData("visual");
      var answersBox = byData("answers");
      var progressDots = byData("progress-dots");

      byData("round-label").textContent = t.quiz.round + " " + (currentStage + 1) + ": " + getStageName(currentStage);
      byData("count-label").textContent = t.quiz.question + " " + stagePosition + "/" + stageTotal;
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
        ? t.results.startStage + " " + nextStageName + " →"
        : t.results.viewResults + " →";
      var copy = quiz.stageEncouragement[Math.min(completedStage, quiz.stageEncouragement.length - 1)] || "";

      byData("stage-title").textContent = t.quiz.round + " " + (completedStage + 1) + " " + t.results.complete;
      byData("stage-copy").textContent = copy;
      byData("stage-next").textContent = nextStageName ? t.results.nextStage + ": " + nextStageName : "";
      byData("stage-next").classList.toggle("legacy-hidden", !nextStageName);
      byData("stage-score").textContent = getScore() + "/" + current;
      byData("stage-badge").textContent = getStageBadge(completedStage);
      byData("stage-button").textContent = buttonLabel;
      byData("stage-button").dataset.readyText = buttonLabel;
      show("stageGate", shouldScroll);
    }

    function showResultGate(shouldScroll) {
      byData("result-gate-title").textContent = t.quiz.your + " " + quiz.result.profileName + " " + t.quiz.profile;
      byData("result-gate-button").textContent = t.quiz.revealPrefix + " " + quiz.result.profileName + " " + t.quiz.profile + " →";
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
