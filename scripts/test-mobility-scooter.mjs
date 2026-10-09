import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base = process.env.QUIZ_TEST_URL ?? 'http://localhost:3199';
const copy = JSON.parse(fs.readFileSync('data/quizzes/mobility_scooter/en.json', 'utf8'));
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true});
try {
  for (const width of [320,390,768,1440]) {
    const context = await browser.newContext({viewport:{width,height:width < 500 ? 844 : 960}});
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    let documents = 0;
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documents++;});
    await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    await page.addInitScript(() => {
      const listeners = new Map();
      window.displayCalls=[]; window.refreshes=[]; window.rewardCalls=[]; window.rewardShows=0;
      const emit = (name, slot, extra={}) => (listeners.get(name)??[]).forEach(cb=>cb({slot,...extra}));
      const render = slot => {
        const node=document.getElementById(slot.id);
        if (!node) return;
        const frame=document.createElement('iframe');
        frame.width=slot.sizes[0][0]; frame.height=slot.sizes[0][1]; frame.title='Mock creative';
        frame.style.cssText='display:block;border:0;margin:0 auto';
        frame.srcdoc='<body style="margin:0;background:#f4f9fa;color:#122d39;display:grid;place-items:center;height:100vh;font:18px Arial">Test display placement</body>';
        node.replaceChildren(frame);
        queueMicrotask(()=>emit('slotRenderEnded',slot,{isEmpty:false}));
      };
      const pubads={
        addEventListener(name,cb){listeners.set(name,[...(listeners.get(name)??[]),cb]);},
        removeEventListener(name,cb){listeners.set(name,(listeners.get(name)??[]).filter(fn=>fn!==cb));},
        refresh(slots){window.refreshes.push(...slots.map(slot=>slot.id));slots.forEach(render);},
        updateCorrelator(){}
      };
      window.googletag={
        cmd:{push(cb){cb();}}, enums:{OutOfPageFormat:{REWARDED:'REWARDED'}},
        defineSlot(path,sizes,id){const slot={path,sizes,id,addService(){return this;},setConfig(config){this.config=config;}};window.displayCalls.push(slot);return slot;},
        defineOutOfPageSlot(path,format){const slot={path,format,addService(){return this;}};window.rewardCalls.push(slot);return slot;},
        pubads:()=>pubads, enableServices(){},setConfig(){},destroySlots(){},
        display(slot){
          if(typeof slot==='string'){render(window.displayCalls.find(item=>item.id===slot));return;}
          queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){window.rewardShows++;queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));
        }
      };
    });
    const response=await page.goto(`${base}/mobility_scooter?fbclid=layout-test`);
    assert.equal(response.status(),200);
    const landing=page.locator('.quiz-engine__landing');
    await landing.waitFor();
    assert.equal(await landing.locator('h1').innerText(),copy.title);
    assert.equal((await landing.locator('button').innerText()).replace('→','').trim(),'Apply Now');
    assert.equal(await landing.locator('.quiz-engine__quick-start').textContent(),copy.landing.intro);
    assert.equal(await landing.locator('.quiz-engine__landing-disclaimer').count(),0);
    const icon=landing.locator('.quiz-engine__landing-badge span');
    assert.equal(await icon.evaluate(node=>getComputedStyle(node).backgroundImage.includes('mobility-scooter-icon.webp')),true);
    assert.ok((await icon.boundingBox()).width >= 40);
    await page.waitForFunction(()=>window.rewardCalls.length===1);
    assert.equal(await page.evaluate(()=>window.rewardShows),0,'preloading does not show an ad');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'landing has no horizontal overflow');
    await page.screenshot({path:`/tmp/mobility-scooter-landing-${width}.png`});
    await landing.locator('button').click();
    await page.locator('.quiz-engine__start-overlay').waitFor();
    await page.locator('[data-question-id="mobility-q1"]').waitFor();
    for(let index=0;index<10;index++) {
      const question=page.locator(`[data-question-id="mobility-q${index+1}"]`);
      await question.waitFor();
      assert.equal(await question.locator('.quiz-engine__answer').count(),3);
      assert.equal(await question.locator('[data-display-placement="below-answers"]').count(),index===0?0:1);
      await page.waitForFunction(count=>document.querySelectorAll('.quiz-engine__display iframe').length===count,index===0?1:2);
      const before=await page.evaluate(()=>window.refreshes.length);
      assert.equal(before,index===0?0:2*index-1);
      const next=question.locator('.quiz-engine__next-question button');
      assert.equal(await next.isDisabled(),true);
      const choice=index%3;
      await question.locator('.quiz-engine__answer').nth(choice).click();
      assert.equal(await question.isVisible(),true);
      assert.equal(await page.evaluate(()=>window.refreshes.length),before,'selection does not refresh ads');
      assert.equal(await next.isDisabled(),false);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'question has no horizontal overflow');
      if(index===1)await page.screenshot({path:`/tmp/mobility-scooter-question-${width}.png`,fullPage:true});
      await next.click();
      await question.waitFor({state:'detached'});
    }
    const checkpoint=page.locator('.quiz-engine__checkpoint');
    await checkpoint.waitFor();
    assert.match(await checkpoint.innerText(),/No application has been submitted/);
    assert.equal(documents,1,'no hard refresh at the checkpoint');
    await checkpoint.getByRole('button',{name:'See My Options',exact:true}).click();
    const results=page.locator('.quiz-engine__options-result');
    await results.waitFor();
    assert.equal(await results.locator('article').count(),3);
    assert.equal(await results.locator('article[data-priority]').count(),1);
    assert.equal(await page.locator('.quiz-engine__result-percentage,.quiz-engine__result-summary,.quiz-engine__dimensions').count(),0,'there is no eligibility score');
    assert.match(await results.innerText(),/not an application/);
    assert.equal(await results.locator('.quiz-engine__options-sources a').count(),2);
    await results.locator('summary').click();
    assert.equal(await results.locator('.quiz-engine__options-answers dd').count(),10);
    const answers=await results.locator('.quiz-engine__options-answers dd').allTextContents();
    assert.deepEqual(answers,Object.values(copy.stages['stage-1'].questions).map((q,index)=>Object.values(q.answers)[index%3]));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'results have no horizontal overflow');
    assert.equal(await page.evaluate(()=>window.rewardShows),2,'only start and final result gates show rewarded ads');
    assert.equal(await page.evaluate(()=>window.displayCalls.every(slot=>slot.path==='/22677279144/display'&&slot.sizes.every(size=>(size[0]===300&&size[1]===250)||(size[0]===336&&size[1]===280))&&slot.config.adExpansion.enabled)),true);
    assert.equal(await page.evaluate(()=>window.rewardCalls.every(slot=>slot.path==='/22677279144/rewarded')),true);
    await page.screenshot({path:`/tmp/mobility-scooter-results-${width}.png`,fullPage:true});
    assert.deepEqual(errors,[]);
    await page.reload();
    await page.locator('.quiz-engine__options-result').waitFor();
    assert.equal(await page.evaluate(()=>window.rewardCalls.length),0,'restoring results never requests another rewarded ad');
    console.log(`${width}px: landing, preload, 10 answers, slot refreshes, options, saved results PASS`);
    await context.close();
  }
} finally {await browser.close();}
