import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { answerPopupQuestion, createPopupQuestionProgress, getCurrentPopupQuestion, isArticlePopupQuestions } from "../gallery/popupQuestions.ts";

const jobs = JSON.parse(fs.readFileSync("data/galleries/jobs.json", "utf8"));
const config = jobs.landing.followUpQuestions;

test("jobs is an English article with Now/Later entry and a full-article second reward", () => {
  assert.equal(jobs.slug, "jobs");
  assert.equal(jobs.locale, "en");
  assert.equal(jobs.landing.title, "Everything You Need To Know About Immediate Hire Jobs");
  assert.equal(jobs.landing.popupTitle, "When Are You Ready To Start?");
  assert.deepEqual(jobs.landing.ctaOptions, ["Now", "Later"]);
  assert.equal(jobs.gallery.flow, "article");
  assert(isArticlePopupQuestions(config));
  assert.equal(config.unlockArticle, true);
  assert.equal(config.requireReward, true);
  assert.equal(config.cta, "Continue");
  assert.deepEqual(config.requiredQuestionIds, ["gender", "salary-expectation", "qualifications"]);
  assert.deepEqual(config.questions[1].choices.map((choice: {label: string}) => choice.label), ["Low", "Medium", "High"]);
  assert.equal(jobs.items.length, 12);
  assert.equal(new Set(jobs.items.map((item: {id: string}) => item.id)).size, 12);
  assert.match(jobs.gallery.introduction.join(" "), /not a job application/);
});

test("both entry choices and all 27 answer combinations reach the identical second reward", () => {
  for (const entry of jobs.landing.ctaOptions) {
    for (let combination = 0; combination < 27; combination++) {
      let progress = createPopupQuestionProgress(config);
      for (let index = 0; index < 3; index++) {
        const question = getCurrentPopupQuestion(config, progress)!;
        assert.equal(question.id, config.requiredQuestionIds[index], entry);
        assert.equal(question.choices.length, 3);
        const choice = question.choices[Math.floor(combination / 3 ** index) % 3];
        progress = answerPopupQuestion(config, progress, question.id, choice.id);
      }
      assert.equal(getCurrentPopupQuestion(config, progress), undefined);
      assert.equal(Object.keys(progress.answers).length, 3);
    }
  }
});

test("full-article option rejects non-boolean configuration", () => {
  assert.equal(isArticlePopupQuestions({...config, unlockArticle: "true"}), false);
});
