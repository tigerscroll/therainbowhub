import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
if (!process.env.QUIZ_TEST_LOCALE || process.env.QUIZ_TEST_LOCALE === 'en') {
 process.env.QUIZ_TEST_SLUG = 'treatments';
 await import('./test-years-left-extended-flow.mjs');
} else {
const base=process.env.QUIZ_TEST_URL??'http://localhost:3198';
const m=JSON.parse(fs.readFileSync('data/quizzes/treatments/quiz.json'));
const locale=process.env.QUIZ_TEST_LOCALE??'en';
const e=JSON.parse(fs.readFileSync(`data/quizzes/treatments/${locale}.json`));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
async function journey(score,width){
 const context=await browser.newContext({viewport:{width,height:900}});
 try{
  const page=await context.newPage(),errors=[];let documents=0;
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())documents++;});
  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  await page.addInitScript(()=>{
   window.adCalls=[];const listeners=new Map();
   const pubads={addEventListener(n,cb){const a=listeners.get(n)??[];a.push(cb);listeners.set(n,a);},removeEventListener(n,cb){listeners.set(n,(listeners.get(n)??[]).filter(x=>x!==cb));},updateCorrelator(){}};
   const emit=(n,slot,extra={})=>(listeners.get(n)??[]).forEach(cb=>cb({slot,...extra}));
   window.googletag={cmd:{push(cb){cb();}},pubads:()=>pubads,enableServices(){},setConfig(){},destroySlots(){},defineSlot(){throw Error('Unexpected display ad');},enums:{OutOfPageFormat:{REWARDED:'REWARDED'}},defineOutOfPageSlot(path,format){const s={path,format,addService(){return this;}};window.adCalls.push({path,format});return s;},display(slot){queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));}};
  });
  await page.goto(`${base}/${locale==='en'?'treatments':locale+'/treatments'}`);
  await page.locator('.quiz-engine__landing').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.quiz-engine__quick-start').textContent(),e.landing.intro);
  assert.equal(await page.locator('.quiz-engine__quick-start').evaluate(n=>Math.round(n.getBoundingClientRect().height/parseFloat(getComputedStyle(n).lineHeight))),2);
  if(score===8)await page.screenshot({path:'/tmp/treatments-en-landing.png',fullPage:true});
  await page.locator('.quiz-engine__landing .quiz-engine__primary').click();let index=0;
  for(const [s,stage]of m.structure.stages.entries()){
   for(const id of stage.questionIds){
    const q=page.locator(`[data-question-id="${id}"]`);await q.waitFor();
    const logic=m.structure.questions[id],copy=e.stages[stage.id].questions[id];
    assert.deepEqual(await q.locator('.quiz-engine__answer strong').allTextContents(),logic.answerIds.map(a=>copy.answers[a]));
    assert.equal(await q.locator('img,.quiz-engine__visual,.quiz-engine__question-image').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}/${id}`);
    assert.equal(await q.locator('.quiz-engine__answer strong').evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1)),true,`Answer clipping: ${width}/${id}`);
    assert.equal(await q.locator('.quiz-engine__answers').evaluate(n=>getComputedStyle(n).gridTemplateColumns.trim().split(/\s+/).length),1,`Single-column answers: ${width}/${id}`);
    const correct=logic.answerIds.indexOf(logic.correctAnswerId),chosen=index++<score?correct:(correct+1)%4;
    if(score===8&&id==='treatments-r5q1')await page.screenshot({path:'/tmp/treatments-en-scenario.png',fullPage:true});
    await q.locator('.quiz-engine__answer').nth(chosen).click();await q.waitFor({state:'detached'});
   }
   const checkpoint=page.locator('.quiz-engine__checkpoint');await checkpoint.waitFor();
   assert.equal(await checkpoint.getAttribute('data-round'),String(s+1));
   assert.equal(await checkpoint.getByRole('progressbar').count(),0);
   assert.equal(await page.evaluate(()=>window.adCalls.length),s+1);
   if(score===8&&s===0)await page.screenshot({path:'/tmp/treatments-en-checkpoint.png',fullPage:true});
   await checkpoint.locator('.quiz-engine__primary').click();
  }
  const result=page.locator('.quiz-engine__results');await result.waitFor();
  assert.equal(await result.locator('.quiz-engine__result-fraction strong').innerText(),`${score} / 10`);
  assert.equal(await result.locator('h2').first().innerText(),score>=8?e.results.score.passed:e.results.score.finished);
  assert.equal(await page.evaluate(()=>window.adCalls.length),2);
  if(score===8)await page.screenshot({path:'/tmp/treatments-en-result.png',fullPage:true});
  await result.locator('.quiz-engine__answer-review-unlock button').click();
  await result.locator('.quiz-engine__answer-review').waitFor();
  assert.equal(await result.locator('.quiz-engine__answer-review article').count(),10-score);
  const expected=m.structure.stages.flatMap(s=>s.questionIds.map(id=>({id,stage:s.id}))).slice(score).map(({id,stage})=>e.stages[stage].questions[id].answers[m.structure.questions[id].correctAnswerId]);
  assert.deepEqual(await result.locator('.quiz-engine__answer-review article dl div:last-child dd').allTextContents(),expected);
  assert.equal(await page.evaluate(()=>window.adCalls.length),3);
  assert.equal(await page.evaluate(()=>window.adCalls.every(a=>a.path==='/22677279144/rewarded'&&a.format==='REWARDED')),true);
  assert.equal(documents,1);assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(`PASS ${score}/10 at ${width}px: one stage, two main rewards + review, text-only SPA, correct score and missed-answer review`);
 }finally{await context.close();}
}
try{await Promise.all([[0,390],[7,1440],[8,320],[10,390]].map(([score,width])=>journey(score,width)));}finally{await browser.close();}
}
