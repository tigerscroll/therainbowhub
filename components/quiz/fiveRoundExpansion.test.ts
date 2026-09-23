import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { requested } from "../../scripts/round-expansion/config.mjs";
import { originalTitles } from "../../scripts/round-expansion/original-titles.mjs";
import { bibleBooks } from "../../scripts/round-expansion/bible-book-names.mjs";
import { treeParts, nimLogic, wordPrompt, associationWords, birdRelations, chapterAnalogy } from "../../scripts/round-expansion/semantic-copy.mjs";
import { anatomyPrompts } from "../../scripts/round-expansion/anatomy-prompt-copy.mjs";
import { checkpointLabels, personalityReveal } from "../../scripts/round-expansion/checkpoint-labels.mjs";
import { expandQuizLocale } from "../../scripts/quiz-schema-v2.mjs";
import { scoreQuiz } from "./scoring.ts";
import type { Quiz } from "../../lib/quizzes.ts";

const read = (slug: string, file: string) => JSON.parse(readFileSync(`data/quizzes/${slug}/${file}.json`, "utf8"));
const allLocales=readdirSync('data/i18n').filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).sort();
for (const slug of requested) {
  test(`${slug}: five English SPA rounds, thirty distinct questions and complete result coverage`, () => {
    const m = read(slug, "quiz"), e = read(slug, "en");
    assert.equal(e.title, originalTitles[slug as keyof typeof originalTitles]);
    const source = expandQuizLocale(m, e, "en");
    const qs = source.stages.flatMap((s: { questions: unknown[] }) => s.questions);
    assert.equal(m.template, "five-stage-six-question-v1");
    assert.deepEqual([...m.activeLocales].sort(), allLocales);
    assert.equal(m.engine.localeParity,"strict");
    assert.equal(m.engine.hardRefreshCheckpoints, false);
    assert.equal(m.structure.stages.length, 5);
    assert.ok(m.structure.stages.every((s: {questionIds: string[]}) => s.questionIds.length === 6));
    assert.equal(qs.length, 30);
    assert.equal(new Set(qs.map((q: {id: string}) => q.id)).size, 30);
    assert.equal(new Set(qs.map((q: {question: string;context?:string;visual?:unknown}) => JSON.stringify([q.question,q.context,q.visual]))).size, 30);
    assert.equal(Object.keys(m.structure.questions).length, 30);
    assert.equal(e.landing.intro.split("\n").length, 2);
    assert.equal(source.career.stages.length, 5);
    assert.deepEqual(source.career.stages.at(-1).preAdChecks, ["30 answers checked", "Five rounds completed", "Your result prepared"]);
    for (const q of qs) {
      const labels = Array.isArray(q.answers) ? q.answers : Object.keys(q.answers);
      assert.equal(labels.length, 4, q.id);
      assert.equal(new Set(labels.map((s: string) => s.trim().toLowerCase())).size, 4, q.id);
    }
    if (slug !== "personality") {
      assert.deepEqual([0,1,2,3].map(n => qs.filter((q: {correct: number}) => q.correct === n).length), [8,8,7,7]);
      const categories = m.structure.results.dimensions.flatMap((d: {categories: string[]}) => d.categories);
      assert.ok(qs.every((q: {category: string}) => categories.filter((c: string) => c === q.category).length === 1));
      const quiz = {
        engine: {scoring: {type: "correct-answer"}, targetRatio: .8},
        questions: source.stages.flatMap((s: {questions: Array<{id:string;correct:number;category:string}>}, stage: number) => s.questions.map(q => ({id:q.id, answerIndex:q.correct, category:q.category, stage}))),
        stages: source.stages.map((s: {title:string}) => s.title),
        result: {profiles: source.results.profiles.map((p: {min:number;title:string}) => ({...p,minRatio:p.min})), scoreDimensions: m.structure.results.dimensions.map((d: {categories:string[]}, i:number) => ({label:String(i), categories:d.categories}))},
      } as Quiz;
      for (let n=0;n<=30;n++) {
        const answers=Object.fromEntries(quiz.questions.map((q,i)=>[q.id,i<n?q.answerIndex!:(q.answerIndex!+1)%4]));
        const result=scoreQuiz(quiz,answers);
        assert.equal(result.score,n);
        assert.equal(result.total,30);
        assert.equal(result.targetStatus,n>=24?"achieved":"unreachable");
        assert.equal(result.profile.title,source.results.profiles.find((p: {min:number})=>n/30>=p.min).title);
      }
    }
  });
}

for(const slug of requested){
 test(`${slug}: every supported locale has five complete rounds with unchanged scoring`,()=>{
  const manifest=read(slug,'quiz');
  for(const locale of allLocales){
   const copy=read(slug,locale),expanded=expandQuizLocale(manifest,copy,locale);
   assert.equal(copy.landing.intro.split('\n').length,2,`${locale}: subtitle`);
   assert.equal(expanded.stages.length,5,locale);
   for(const [index,stage]of expanded.stages.entries()){
    assert.equal(stage.questions.length,6,`${locale}/${index}`);
    for(const q of stage.questions){
     const logic=manifest.structure.questions[q.id];
     const labels=Array.isArray(q.answers)?q.answers:Object.keys(q.answers);
     assert.equal(new Set(labels.map((s:string)=>s.normalize('NFKC').trim().toLowerCase())).size,4,`${locale}/${q.id}`);
     assert.deepEqual(labels,logic.answerIds.map((id:string)=>copy.stages[`stage-${index+1}`].questions[q.id].answers[id]),`${locale}/${q.id}: order`);
     if(slug!=='personality')assert.equal(q.correct,logic.answerIds.indexOf(logic.correctAnswerId),`${locale}/${q.id}: correct answer`);
    }
   }
  }
 });
}

test("Personality retains four reachable weighted profiles across all thirty choices", () => {
  const m=read("personality","quiz"), e=read("personality","en");
  const ids=m.structure.results.profiles.map((p: {id:string})=>p.id);
  const questions=m.structure.stages.flatMap((s: {questionIds:string[]},stage:number)=>s.questionIds.map(id=>{
    const q=m.structure.questions[id];
    assert.deepEqual(q.answerIds.map((a:string)=>Object.keys(q.choiceMeanings[a])[0]).sort(),[...ids].sort());
    assert.equal(q.correctAnswerId,undefined);
    return {id,stage,choiceWeights:q.answerIds.map((a:string)=>q.choiceMeanings[a])};
  }));
  const quiz={engine:{scoring:{type:"weighted-profile"}},questions,stages:Object.values(e.stages).map((s:any)=>s.title),
    result:{profiles:m.structure.results.profiles.map((p:any)=>({...e.results.profiles[p.key],id:p.id,minRatio:0})),scoreDimensions:[]}} as Quiz;
  for(const id of ids){
    const answers=Object.fromEntries(questions.map((q:any)=>[q.id,q.choiceWeights.findIndex((w:Record<string,number>)=>w[id]===1)]));
    const result=scoreQuiz(quiz,answers);
    assert.equal(result.profile.id,id);
    assert.equal(result.score,30);
    assert.equal(result.percentage,100);
  }
});

test("restored Harvard addition and Grammar trapdoor keys stay corrected", () => {
  const m=read("harvard","quiz"), e=read("harvard","en"), id="harvard-s5q3";
  assert.equal(e.stages["stage-5"].questions[id].answers[m.structure.questions[id].correctAnswerId],"B");
  assert.ok(7+9>9+5);
  const grammar=read("grammar","en").stages["stage-4"].questions["grammar-r9q5"];
  assert.deepEqual(Object.keys(grammar.trapdoorErrors),["a1","a2","a3"]);
});

test("the four approved English audit edits and stale-count cleanup are preserved",()=>{
 const question=(slug:string,id:string)=>Object.values(read(slug,'en').stages).flatMap((s:any)=>Object.entries(s.questions)).find(([key])=>key===id)?.[1] as any;
 assert.equal(question('firefighter','firefighter-s3q2').question,'Using the scale shown, what real distance does the 4.8 cm route represent?');
 assert.equal(question('nursing','nurse-r7q1').question,'Which person should be prioritised now?');
 assert.equal(question('paramedic','paramedic-r5q6').answers.a4,'Person A, because their observations are currently stable');
 assert.equal(question('paramedic','paramedic-r10q6').question,'Which person should receive priority attention?');
 for(const slug of requested)for(const s of Object.values(read(slug,'en').stages) as any[])for(const q of Object.values(s.questions) as any[])assert.doesNotMatch(q.headerLabel,/\bOF 10\b/i);
});

test("localized technical names, biblical titles and code answers retain their meaning",()=>{
 for(const locale of allLocales.filter(l=>l!=='en')){
  const bible=read('bible',locale),bibleEn=read('bible','en');
  for(const[stageId,stage]of Object.entries(bibleEn.stages) as any)for(const[id,q]of Object.entries(stage.questions) as any)for(const[a,text]of Object.entries(q.answers) as any)if(bibleBooks[locale]?.[text])assert.equal(bible.stages[stageId].questions[id].answers[a],bibleBooks[locale][text]);
  const police=read('police',locale),policeEn=read('police','en');
  for(const[stageId,stage]of Object.entries(policeEn.stages) as any)for(const[id,q]of Object.entries(stage.questions) as any)if(['police-q6','police-round3-new3','police-round3-new4'].includes(id))assert.deepEqual(police.stages[stageId].questions[id].answers,q.answers);
  const iq=read('iq',locale).stages['stage-2'].questions['iq-s2q2'];assert.equal(iq.answers.a1,'EQH');assert.equal(iq.visual.items[1],'CAT → DCU');
  const rank=read('raf',locale).stages['stage-3'].questions['raf-round3-new1'];assert.ok(rank.question.includes('Flight Lieutenant'));assert.equal(rank.answers.a1,'Flying Officer');
 }
});

test('localized reasoning preserves negation and botanical meanings; association prompts contain native words',()=>{
 for(const locale of allLocales.filter(l=>l!=='en')){
  const iq=read('iq',locale);
  assert.equal(iq.stages['stage-2'].questions['iq-s2q5'].question,nimLogic[locale]);
  assert.deepEqual(Object.values(iq.stages['stage-3'].questions['iq-s3q6'].answers),birdRelations[locale].slice(1));
  if(!['de','es','fr','it','nl','pt'].includes(locale))assert.deepEqual(Object.values(iq.stages['stage-4'].questions['iq-s4q5'].answers),treeParts[locale]);
  const word=read('word',locale);
  assert.equal(read('anatomy',locale).stages['stage-2'].questions['anatomy-round2-new4'].question,anatomyPrompts[locale][0]);
  assert.equal(read('dentist',locale).stages['stage-1'].questions['dentist-round1-new4'].question,anatomyPrompts[locale][2]);
  assert.equal(word.stages['stage-5'].questions['word-round5-new1'].question,chapterAnalogy[locale][0]);
  assert.equal(word.stages['stage-5'].questions['word-round5-new1'].answers.a1,chapterAnalogy[locale][1]);
  for(let r=1;r<=3;r++)for(let q=1;q<=4;q++)assert.equal(word.stages[`stage-${r}`].questions[`word-round${r}-new${q}`].question,wordPrompt[locale].replace('{word}',associationWords[locale][(r-1)*4+q-1]));
 }
});

test('all expanded quizzes use subject-neutral localized checkpoint and result labels',()=>{
 for(const locale of allLocales.filter(l=>l!=='en'))for(const slug of requested){
  const c=read(slug,locale);
  assert.equal(c.career.resultProgressLabel,checkpointLabels[locale][0]);
  assert.equal(expandQuizLocale(read(slug,'quiz'),c,locale).career.stages[4].preAdButton,slug==='personality'&&personalityReveal[locale]||checkpointLabels[locale][1]);
 }
});
