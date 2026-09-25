import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base=process.env.QUIZ_TEST_URL??'http://localhost:3198';
const read=(slug,locale)=>JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`));
const queue=['memory','years-left'].flatMap(slug=>(process.env.QUIZ_TEST_LOCALES??read(slug,'quiz').activeLocales.join(',')).split(',').map(locale=>({slug,locale})));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const failures=[];
const estimates=new Map();

async function check(slug,locale){
 const manifest=read(slug,'quiz'),copy=read(slug,locale);
 const context=await browser.newContext({viewport:{width:390,height:844}});
 try{
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let documents=0;
  page.on('request',r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())documents++;});
  await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
  await page.addInitScript(()=>{
   window.adCalls=[];const listeners=new Map();
   const pubads={addEventListener(n,cb){const a=listeners.get(n)??[];a.push(cb);listeners.set(n,a);},removeEventListener(n,cb){listeners.set(n,(listeners.get(n)??[]).filter(x=>x!==cb));},updateCorrelator(){}};
   const emit=(n,slot,extra={})=>(listeners.get(n)??[]).forEach(cb=>cb({slot,...extra}));
   window.googletag={cmd:{push(cb){cb();}},pubads:()=>pubads,enableServices(){},setConfig(){},destroySlots(){},defineSlot(){throw Error('Unexpected display ad');},enums:{OutOfPageFormat:{REWARDED:'REWARDED'}},defineOutOfPageSlot(path,format){const s={path,format,addService(){return this;}};window.adCalls.push(s);return s;},display(slot){queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));}};
  });
  await page.goto(`${base}/${locale==='en'?slug:locale+'/'+slug}`);
  await page.locator('.quiz-engine__landing').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'),locale);
  await page.locator('.quiz-engine__landing .quiz-engine__primary').click();
  for(const[index,stage]of manifest.structure.stages.entries()){
   for(const id of stage.questionIds){
    const q=page.locator(`[data-question-id="${id}"]`);await q.waitFor();
    const expected=copy.stages[stage.id].questions[id];
    if(expected.study){
     const study=q.locator('.quiz-engine__study');await study.waitFor();
     assert.equal(await q.locator('.quiz-engine__answer').count(),0);
     assert.deepEqual(await study.locator('.quiz-engine__study-items strong').allTextContents(),expected.study.items);
     await study.getByRole('button',{name:expected.study.continueLabel,exact:true}).click();
    }
    await q.locator('.quiz-engine__answer').first().waitFor();
    assert.deepEqual(await q.locator('.quiz-engine__answer strong').allTextContents(),manifest.structure.questions[id].answerIds.map(a=>expected.answers[a]),`${slug}/${locale}/${id}: answer mapping`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug}/${locale}/${id}: page overflow`);
    assert.equal(await page.locator(`[data-quiz-theme="${slug}"]`).evaluate(n=>n.scrollLeft),0,`${slug}/${locale}/${id}: internal horizontal scroll`);
    if(['ar','de'].includes(locale)&&id===stage.questionIds[0]){
     await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})));});
     const r=await q.evaluate(n=>{const r=n.getBoundingClientRect();return{x:r.x,right:r.right,width:innerWidth};});
     assert.ok(r.x>=-1&&r.right<=r.width+1,`${slug}/${locale}/${id}: clipped question`);
     if(index===0)await page.screenshot({path:`/tmp/${slug}-${locale}-localized.png`,fullPage:true});
    }
    await page.mouse.move(0,0);await q.locator('.quiz-engine__answer').first().click();await q.waitFor({state:'detached'});
   }
   const checkpoint=page.locator('.quiz-engine__checkpoint');await checkpoint.waitFor();
   assert.equal(await checkpoint.getAttribute('data-round'),String(index+1));
   assert.equal(await checkpoint.getByRole('progressbar').count(),0);
   assert.equal(await page.evaluate(()=>window.adCalls.length),index+1);
   await checkpoint.locator('.quiz-engine__primary').click();
  }
  await page.locator('.quiz-engine__results').waitFor();
  if(slug==='memory'){
   const correct=Object.values(manifest.structure.questions).filter(q=>q.answerIds[0]===q.correctAnswerId).length;
   assert.equal(await page.locator('.quiz-engine__result-fraction strong').innerText(),`${correct} / 10`);
   const profile=manifest.structure.results.profiles.find(p=>correct/10>=p.min);
   assert.equal(await page.locator('.quiz-engine__result-profile').textContent(),copy.results.profiles[profile.key].title);
   assert.equal(await page.locator('.quiz-engine__result-copy').textContent(),copy.results.profiles[profile.key].copy);
  }else{
   const age=await page.locator('.quiz-engine__result-age strong').innerText();
   estimates.set(locale,age);
   assert.ok(Object.values(copy.results.profiles).some(p=>p.title===undefined)===false);
   assert.ok(Object.values(copy.results.profiles).map(p=>p.title).includes(await page.locator('.quiz-engine__results h2').first().textContent()));
  }
  assert.equal(await page.evaluate(()=>window.adCalls.length),2);
  assert.equal(await page.evaluate(()=>window.adCalls.every(a=>a.path==='/22677279144/rewarded'&&a.format==='REWARDED')),true);
  assert.equal(documents,1);assert.deepEqual(errors,[]);
  console.log(`${slug}/${locale}: 10 questions, one result checkpoint, two mocked rewards, stable answers, no overflow PASS`);
 }finally{await context.close();}
}
try{await Promise.all(Array.from({length:6},async()=>{while(queue.length){const{slug,locale}=queue.shift();try{await check(slug,locale);}catch(error){failures.push({slug,locale,error:String(error)});console.error(slug,locale,String(error));}}}));}finally{await browser.close();}
assert.equal(new Set(estimates.values()).size,1,'Identical Years Left choices must produce the same age in every locale');
assert.deepEqual(failures,[]);
