// Complement full journeys by checking every localized checkpoint at the smallest
// supported phone size. Saved states are created by the app before each restore.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';
import {slugs, activeLocales} from './chapter-locales/config.mjs';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const chosen = process.env.QUIZZES?.split(',') ?? slugs;
const locales = process.env.LOCALES?.split(',') ?? activeLocales;
const queue = chosen.flatMap(slug => locales.map(locale => ({slug, locale})));
const results = [];
const previewCss = process.env.QUIZ_TEST_CSS ? fs.readFileSync(process.env.QUIZ_TEST_CSS, 'utf8') : undefined;
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true});

async function check({slug, locale}) {
  const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, 'utf8'));
  const copy = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
  const context = await browser.newContext({viewport:{width:320,height:568},reducedMotion:'reduce'});
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await page.addInitScript(() => {
    const listeners = new Map();
    const emit = (name, slot, more={}) => (listeners.get(name) ?? []).forEach(fn=>fn({slot,...more}));
    const ads = {addEventListener(name,fn){listeners.set(name,[...(listeners.get(name)??[]),fn]);},removeEventListener(name,fn){listeners.set(name,(listeners.get(name)??[]).filter(item=>item!==fn));},updateCorrelator(){}};
    window.googletag = {
      cmd:{push(fn){fn();}},pubads:()=>ads,enableServices(){},setConfig(){},destroySlots(){},
      defineOutOfPageSlot(){return {addService(){return this;}};},
      enums:{OutOfPageFormat:{REWARDED:'REWARDED',INTERSTITIAL:'INTERSTITIAL'}},
      display(slot){queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));},
    };
  });
  try {
    const url = `${base}/${locale==='en'?'':`${locale}/`}${slug}?test_keep=1`;
    await page.goto(url);
    const start = page.locator('.quiz-engine__landing .quiz-engine__primary');
    await start.waitFor();
    if (previewCss) await page.addStyleTag({content:previewCss});
    assert.ok(await start.evaluate(node=>node.getBoundingClientRect().bottom<=innerHeight), 'landing CTA fits');
    await start.click();
    await page.locator('[data-question-id]').waitFor();
    const key = `rainbowhub:quiz-progress:v4:${slug}:${locale}`;
    await page.waitForFunction(key=>Boolean(localStorage.getItem(key)),key);
    const template = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    const answers = {};
    for (const [index,stage] of manifest.structure.stages.entries()) {
      for(const id of stage.questionIds) answers[id] = manifest.structure.questions[id].correctAnswerId ?? manifest.structure.questions[id].answerIds[0];
      const saved = {...template,answers,completedStage:index,questionIndex:Math.min((index+1)*7,69),screen:'checkpoint',updatedAt:new Date().toISOString()};
      await page.evaluate(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key,saved});
      await page.reload();
      const gate=page.locator('.quiz-engine__checkpoint');
      await gate.waitFor();
      if (previewCss) await page.addStyleTag({content:previewCss});
      assert.equal(await gate.getAttribute('data-round'),String(index+1));
      assert.equal(await gate.locator('h2').innerText(),copy.career.stages[stage.id].preAdTitle);
      const box=await gate.locator('.quiz-engine__primary').evaluate(node=>({top:node.getBoundingClientRect().top,bottom:node.getBoundingClientRect().bottom,height:innerHeight}));
      assert.ok(box.top>=0&&box.bottom<=box.height,`${stage.id} CTA fits: ${JSON.stringify(box)}`);
      assert.ok(await gate.locator('.quiz-engine__ad-note').evaluate(node=>node.getBoundingClientRect().bottom<=innerHeight),`${stage.id} ad note fits`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${stage.id} horizontal overflow`);
      assert.ok(await gate.evaluate(node=>node.getAnimations({subtree:true}).length===0),'reduced motion is respected');
      if (index===0 && ['ar','pt'].includes(locale) && ['personality','harvard','years-left'].includes(slug)) await page.screenshot({path:`/tmp/${slug}-${locale}-checkpoint-final-320.png`,animations:'disabled'});
    }
    console.log(`PASS ${slug}/${locale}: ten 320px checkpoints`);
    results.push({slug,locale,passed:true});
  } catch(error) {
    const screenshot=`/tmp/checkpoint-layout-${slug}-${locale}-failure.png`;
    await page.screenshot({path:screenshot,animations:'disabled'}).catch(()=>{});
    console.error(`${slug}/${locale}: ${error.message}`);
    results.push({slug,locale,passed:false,error:error.message,screenshot});
  } finally {await context.close();fs.writeFileSync('/tmp/chapter-checkpoint-layout-results.json',JSON.stringify(results,null,2));}
}
async function worker(){while(queue.length)await check(queue.shift());}
try {await Promise.all(Array.from({length:Number(process.env.WORKERS??4)},worker));}
finally {await browser.close();}
if(results.some(result=>!result.passed))process.exitCode=1;
