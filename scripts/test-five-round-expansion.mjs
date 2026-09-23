import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
import {requested} from './round-expansion/config.mjs';
const base=process.env.QUIZ_TEST_URL??'http://localhost:3198';
const selected=process.argv.slice(2).length?process.argv.slice(2):requested;
const locales=(process.env.QUIZ_TEST_LOCALES??'en').split(',');
const cases=process.env.QUIZ_TEST_SAMPLE==='1'
 ?selected.map((slug,i)=>({slug,locale:locales[i%locales.length]}))
 :selected.flatMap(slug=>locales.map(locale=>({slug,locale})));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
const failures=[];
async function journey(slug,locale='en',width=320,score=8){
 const m=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`)),e=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`));
 const shared=JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`)).quiz;
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage(),errors=[];let documents=0;
 try{
  page.setDefaultTimeout(15000);
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())documents++;});
  await page.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  await page.addInitScript(()=>{
   window.adCalls=[];const listeners=new Map();
   const pubads={addEventListener(n,cb){const a=listeners.get(n)??[];a.push(cb);listeners.set(n,a);},removeEventListener(n,cb){listeners.set(n,(listeners.get(n)??[]).filter(x=>x!==cb));},updateCorrelator(){}};
   const emit=(n,slot,extra={})=>(listeners.get(n)??[]).forEach(cb=>cb({slot,...extra}));
   window.googletag={cmd:{push(cb){cb();}},pubads:()=>pubads,enableServices(){},setConfig(){},destroySlots(){},defineSlot(){throw Error('Unexpected display ad');},enums:{OutOfPageFormat:{REWARDED:'REWARDED'}},defineOutOfPageSlot(path,format){const s={path,format,addService(){return this;}};window.adCalls.push({path,format});return s;},display(slot){queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));}};
  });
  await page.goto(base+'/'+(locale==='en'?'':locale+'/')+slug);
  assert.equal(await page.locator('html').getAttribute('lang'),locale);
  await page.locator('.quiz-engine__landing').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.quiz-engine__quick-start').textContent(),e.landing.intro);
  if(process.env.QUIZ_TEST_SCREENSHOTS!=='0')await page.screenshot({path:`/tmp/five-round-${slug}-${locale}-landing.png`});
  await page.locator('.quiz-engine__landing .quiz-engine__primary').click();let index=0;
  for(const [s,stage]of m.structure.stages.entries()){
   for(const id of stage.questionIds){
    const q=page.locator(`[data-question-id="${id}"]`);await q.waitFor();
    const logic=m.structure.questions[id],copy=e.stages[stage.id].questions[id];
    if(await q.locator('.quiz-engine__study button').count())await q.locator('.quiz-engine__study button').click();
    await q.locator('.quiz-engine__answer').first().waitFor();
    await q.evaluate(async el => {
     const animations=el.getAnimations({subtree:true}).filter(a=>a.effect?.getComputedTiming().iterations!==Infinity);
     let timer;
     try{await Promise.race([Promise.all(animations.map(a=>a.finished.catch(()=>{}))),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Finite animations did not settle: '+animations.map(a=>JSON.stringify(a.effect?.getComputedTiming())).join('; '))),8000);})]);}
     finally{clearTimeout(timer);}
    });
    const bounds=await page.locator('.quiz-engine__question-shell').boundingBox();
    assert.ok(bounds.x>=-1&&bounds.x+bounds.width<=width+1,`Clipped question shell: ${width}/${id} ${JSON.stringify(bounds)}`);
    assert.deepEqual(await q.locator('.quiz-engine__answer strong').allTextContents(),logic.answerIds.map(a=>copy.answers[a]),id);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Page overflow: ${width}/${id}`);
    assert.equal(await q.locator('.quiz-engine__answer strong').evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1)),true,`Answer clipping: ${width}/${id}`);
    const correct=logic.answerIds.indexOf(logic.correctAnswerId);
    const chosen=slug==='personality'?logic.answerIds.findIndex(a=>logic.choiceMeanings[a].japan===1):index<score?correct:(correct+1)%4;
    if(process.env.QUIZ_TEST_SCREENSHOTS!=='0'&&(index===0||index===7))await page.screenshot({path:`/tmp/five-round-${slug}-${locale}-q${index+1}.png`});
    index++;
    await q.locator('.quiz-engine__answer').nth(chosen).click();await q.waitFor({state:'detached'});
   }
   const checkpoint=page.locator('.quiz-engine__checkpoint');await checkpoint.waitFor();
   await page.waitForFunction(({result})=>{
    const el=document.querySelector('.quiz-engine__checkpoint');
    return !result||el?.querySelector('.quiz-engine__primary')?.textContent.includes(result);
   },{result:e.career.stages['stage-1'].preAdButton??shared.revealMyResults},{timeout:15000});
   assert.equal(await checkpoint.getAttribute('data-round'),String(s+1));
   assert.equal(await checkpoint.getByRole('progressbar').count(),0);
   assert.equal(await page.evaluate(()=>window.adCalls.length),s+1);
   if(process.env.QUIZ_TEST_SCREENSHOTS!=='0'&&s===0)await page.screenshot({path:`/tmp/five-round-${slug}-${locale}-checkpoint.png`});
   await checkpoint.locator('.quiz-engine__primary').click();
  }
  const result=page.locator('.quiz-engine__results');await result.waitFor();
  await result.locator('img').evaluateAll(async imgs=>{
   let timer;
   try{await Promise.race([Promise.all(imgs.map(img=>{img.loading='eager';return img.decode();})),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Result images did not decode within 15 seconds')),15000);})]);}
   finally{clearTimeout(timer);}
  });
  if(slug==='personality'){
   const profile=m.structure.results.profiles.find(p=>p.id==='japan');
   assert.ok((await result.innerText()).includes(e.results.profiles[profile.key].title));
  }else{
   assert.equal(await result.locator('.quiz-engine__result-fraction strong').innerText(),`${score} / 10`);
   assert.equal(await result.locator('h2').first().innerText(),score>=8?e.results.score.passed:e.results.score.finished);
  }
  assert.equal(await page.evaluate(()=>window.adCalls.length),2);
  if(process.env.QUIZ_TEST_SCREENSHOTS!=='0')await page.screenshot({path:`/tmp/five-round-${slug}-${locale}-result.png`});
  if(slug==='personality'){
   await result.locator('.quiz-engine__answer-review-unlock button').click();
   await result.locator('.quiz-engine__answer-review-unlock').waitFor({state:'detached'});
   assert.equal(await page.evaluate(()=>window.adCalls.length),3);
  }
  if(slug!=='personality'){
   await result.locator('.quiz-engine__answer-review-unlock button').click();
   await result.locator('.quiz-engine__answer-review').waitFor();
   assert.equal(await result.locator('.quiz-engine__answer-review article').count(),10-score);
   const expected=m.structure.stages.flatMap(s=>s.questionIds.map(id=>({id,stage:s.id}))).slice(score).map(({id,stage})=>e.stages[stage].questions[id].answers[m.structure.questions[id].correctAnswerId]);
   assert.deepEqual(await result.locator('.quiz-engine__answer-review article dl div:last-child dd').allTextContents(),expected);
   assert.equal(await page.evaluate(()=>window.adCalls.length),3);
  }
  assert.equal(await page.evaluate(()=>window.adCalls.every(a=>a.path==='/22677279144/rewarded'&&a.format==='REWARDED')),true);
  assert.equal(documents,1);assert.deepEqual(errors,[]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(`PASS ${slug}/${locale} ${width}px: 10 questions, one result checkpoint, two main rewards, ${slug==='personality'?'Japan profile':score+'/10 + correct missed-answer review'}, no overflow or JS errors, one document`);
 }catch(error){
  failures.push(`${slug}/${locale}`);console.error(`FAIL ${slug}/${locale}: ${error.stack}`);
  console.error(await page.locator('.quiz-engine__question-shell').evaluate(el=>{const rows=[];for(let n=el;n;n=n.parentElement){const r=n.getBoundingClientRect();rows.push({class:n.className,x:r.x,width:r.width,scrollLeft:n.scrollLeft,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth,overflow:getComputedStyle(n).overflow,transform:getComputedStyle(n).transform});}return rows;}).catch(()=>[]));
  await page.screenshot({path:`/tmp/five-round-${slug}-${locale}-failure.png`}).catch(()=>{});
 }finally{await context.close();}
}
try{
 const concurrency=Number(process.env.QUIZ_TEST_CONCURRENCY??4);
 for(let i=0;i<cases.length;i+=concurrency)await Promise.all(cases.slice(i,i+concurrency).map(({slug,locale})=>journey(slug,locale,Number(process.env.QUIZ_TEST_WIDTH??320),Number(process.env.QUIZ_TEST_SCORE??8))));
}finally{await browser.close();}
if(failures.length){console.error('Failed journeys:',failures.join(', '));process.exitCode=1;}
console.log(`Completed ${cases.length} journeys; ${failures.length} failed.`);
// All browser contexts and the browser have been awaited above. Do not let a
// leftover Playwright transport handle keep this standalone CLI alive.
process.exit(failures.length?1:0);
