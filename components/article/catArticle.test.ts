import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { answerPopupQuestion, createPopupQuestionProgress, getCurrentPopupQuestion, isArticlePopupQuestions } from "../gallery/popupQuestions.ts";

const cat = JSON.parse(fs.readFileSync("data/galleries/cat.json", "utf8"));
const config = cat.landing.followUpQuestions;

test("cat affection uses the shared English article and two-reward popup template", () => {
  assert.equal(cat.slug, "cat");
  assert.equal(cat.locale, "en");
  assert.equal(cat.landing.title, "Understanding Cat Affection: How Your Pet Shows Love");
  assert.equal(cat.landing.popupTitle, "Have You Ever Been Bitten By A Cat?");
  assert.deepEqual(cat.landing.ctaOptions, ["Yes", "No"]);
  assert.equal(cat.gallery.flow, "article");
  assert(isArticlePopupQuestions(config));
  assert.equal(config.unlockArticle, true);
  assert.equal(config.requireReward, true);
  assert.equal(config.questionCount, 2);
  assert.equal(config.readyTitle, "Your Article Is Ready");
  assert.equal(config.cta, "Continue");
  assert.deepEqual(config.requiredQuestionIds, ["cat-owner", "loves-cats"]);
  assert.deepEqual(config.questions.map((question: {prompt: string}) => question.prompt), ["Do you own a cat?", "Do you love cats?"]);
  assert.equal(cat.items.length, 10);
  assert.match(cat.items[0].title, /Not Automatically a Love Bite/);
  assert.match(cat.items.at(-1).paragraphs.join(" "), /veterinarian|medical advice/);
});

test("all eight Yes/No combinations keep the same questions and full-article reward step", () => {
  for (const entry of cat.landing.ctaOptions) {
    for (let combination = 0; combination < 4; combination++) {
      let progress = createPopupQuestionProgress(config);
      for (let index = 0; index < 2; index++) {
        const question = getCurrentPopupQuestion(config, progress)!;
        assert.equal(question.id, config.requiredQuestionIds[index], entry);
        assert.deepEqual(question.choices.map(choice => choice.label), ["Yes", "No"]);
        progress = answerPopupQuestion(config, progress, question.id, question.choices[(combination >> index) & 1].id);
      }
      assert.equal(getCurrentPopupQuestion(config, progress), undefined);
      assert.equal(Object.keys(progress.answers).length, 2);
    }
  }
});
