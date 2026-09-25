// Verify the expressions that are most sensitive to bidirectional layout.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3198';
const selections = {
  cambridge:['cambridge-s9q4','cambridge-s6q3','cambridge-s5q7'],
  oxford:['oxford-s8q6','oxford-s10q1'],
  iq:['iq-s9q3','iq-s10q2','iq-s10q6'],
  memory:['memory-s1q1'],
};
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  for (const width of [320,1440]) {
    const context = await browser.newContext({viewport:{width,height:width===320?568:960},reducedMotion:'reduce'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
    await context.addInitScript(()=>{
      const listeners = new Map();
      const emit=(name,slot,more={})=>(listeners.get(name)??[]).forEach(fn=>fn({slot,...more}));
      const ads={addEventListener(name,fn){listeners.set(name,[...(listeners.get(name)??[]),fn]);},removeEventListener(name,fn){listeners.set(name,(listeners.get(name)??[]).filter(x=>x!==fn));},updateCorrelator(){}};
      window.googletag={cmd:{push(fn){fn();}},pubads:()=>ads,enableServices(){},setConfig(){},destroySlots(){},defineOutOfPageSlot(){return{addService(){return this;}};},enums:{OutOfPageFormat:{REWARDED:'REWARDED',INTERSTITIAL:'INTERSTITIAL'}},display(slot){queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));}};
    });
    const page=await context.newPage();
    page.setDefaultTimeout(10_000);
    for (const [slug,ids] of Object.entries(selections)) {
      const manifest=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/english-extended/quiz.json`));
      const order=manifest.structure.stages.flatMap(stage=>stage.questionIds);
      const key=`rainbowhub:quiz-progress:v4:${slug}:ar`;
      await page.goto(`${base}/ar/${slug}?test_keep=1`);
      await page.locator('.quiz-engine__landing .quiz-engine__primary').click();
      await page.locator('[data-question-id]').waitFor();
      await page.waitForFunction(key=>Boolean(localStorage.getItem(key)),key);
      const template=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
      for (const id of ids) {
        const index=order.indexOf(id);
        const saved={...template,answers:Object.fromEntries(order.slice(0,index).map(id=>[id,manifest.structure.questions[id].correctAnswerId])),questionIndex:index,completedStage:Math.max(0,Math.floor(index/7)-1),screen:'question',updatedAt:new Date().toISOString()};
        await page.evaluate(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key,saved});
        await page.reload();
        const question=page.locator(`[data-question-id="${id}"]`);
        await question.waitFor();
        await page.evaluate(async()=>{await document.fonts.ready;});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${id}/${width}: page overflow`);
        assert.ok(await question.locator('.quiz-text__literal--atomic').evaluateAll(nodes=>nodes.every(node=>node.getClientRects().length===1)),`${id}/${width}: short expressions must stay on one line`);
        assert.ok(await question.locator('.quiz-text__literal--alphabet').evaluateAll(nodes=>nodes.every(node=>node.scrollWidth<=node.clientWidth)),`${id}/${width}: the alphabet reference fits`);
        if (id==='cambridge-s9q4') {
          const expressions=await question.locator('h1 bdi[dir="ltr"]').allTextContents();
          assert.ok(expressions.includes('(0, 2)')&&expressions.includes('(2, 6)'),`${id}: coordinates include their brackets`);
        }
        if (slug==='memory') {
          assert.match(await question.locator('.quiz-engine__study > p').innerText(),/من اليسار إلى اليمين/);
          assert.equal(await question.locator('.quiz-engine__study-items').getAttribute('dir'),'ltr');
        }
        await page.screenshot({path:`/tmp/arabic-final-${id}-${width}.png`,animations:'disabled'});
        console.log(`PASS ${id}: ${width}px Arabic symbols and layout`);
      }
    }
    await context.close();
  }
} finally {await browser.close();}
