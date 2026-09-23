import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
const base=process.env.QUIZ_TEST_URL??'http://localhost:3198';
const manifest=JSON.parse(fs.readFileSync('data/quizzes/vision/quiz.json'));
const queue=(process.env.QUIZ_TEST_LOCALES??manifest.activeLocales.join(',')).split(',');
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const failures=[];
async function check(locale){
 const copy=JSON.parse(fs.readFileSync(`data/quizzes/vision/${locale}.json`));
 const context=await browser.newContext({viewport:{width:390,height:844}});
 try{
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let documents=0;
  page.on('request',r=>{if(r.isNavigationRequest()&&r.frame()===page.mainFrame())documents++;});
  await page.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
  await page.addInitScript(()=>{
   window.adCalls=[];const listeners=new Map();const pubads={addEventListener(n,cb){const a=listeners.get(n)??[];a.push(cb);listeners.set(n,a);},removeEventListener(n,cb){listeners.set(n,(listeners.get(n)??[]).filter(x=>x!==cb));},updateCorrelator(){}};
   const emit=(n,slot,extra={})=>(listeners.get(n)??[]).forEach(cb=>cb({slot,...extra}));
   window.googletag={cmd:{push(cb){cb();}},pubads:()=>pubads,enableServices(){},setConfig(){},destroySlots(){},defineSlot(){throw Error('Unexpected display ad');},enums:{OutOfPageFormat:{REWARDED:'REWARDED'}},defineOutOfPageSlot(path,format){const s={path,format,addService(){return this;}};window.adCalls.push(s);return s;},display(slot){queueMicrotask(()=>emit('rewardedSlotReady',slot,{makeRewardedVisible(){queueMicrotask(()=>{emit('rewardedSlotGranted',slot);emit('rewardedSlotClosed',slot);});}}));}};
  });
  await page.goto(`${base}/${locale==='en'?'vision':locale+'/vision'}`);
  await page.locator('.quiz-engine__landing').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'),locale);
  await page.locator('.quiz-engine__landing .quiz-engine__primary').click();
  for(const[index,stage]of manifest.structure.stages.entries()){
   for(const id of stage.questionIds){
    const q=page.locator(`[data-question-id="${id}"]`);await q.waitFor();
    await q.locator('.quiz-engine__answer').first().waitFor();
    assert.deepEqual(await q.locator('.quiz-engine__answer strong').allTextContents(),manifest.structure.questions[id].answerIds.map(a=>copy.stages[stage.id].questions[id].answers[a]),`${locale}/${id}: answer mapping`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${locale}/${id}: page overflow`);
    assert.equal(await page.locator('[data-quiz-theme="vision"]').evaluate(n=>n.scrollLeft),0,`${locale}/${id}: internal horizontal scroll`);
    if(await q.locator('.quiz-engine__visual').count())assert.equal(await q.locator('.quiz-engine__visual').evaluate(n=>getComputedStyle(n).direction),'ltr',`${locale}/${id}: puzzle order`);
    if(['ar','he','ja','de'].includes(locale)&&['vision-r1q1','vision-r10q2'].includes(id)){
     await page.evaluate(async () => {await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(()=>{})));});
     const bounds=await q.evaluate(n=>{const r=n.getBoundingClientRect();return{x:r.x,right:r.right,width:innerWidth,scrollX};});
     if(bounds.x < -1 || bounds.right > bounds.width+1) console.error(await q.evaluate(n=>{const out=[];for(let p=n;p;p=p.parentElement){const r=p.getBoundingClientRect(),s=getComputedStyle(p);out.push({tag:p.tagName,class:p.className,x:r.x,width:r.width,scrollWidth:p.scrollWidth,scrollLeft:p.scrollLeft,overflow:s.overflow,padding:s.padding,margin:s.margin,transform:s.transform});}return out;}));
     assert.ok(bounds.x>=-1&&bounds.right<=bounds.width+1,`${locale}/${id}: clipped question ${JSON.stringify(bounds)}`);
     await page.screenshot({path:`/tmp/vision-${locale}-${id}.png`,fullPage:true});
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
  const correct=Object.values(manifest.structure.questions).filter(q=>q.answerIds[0]===q.correctAnswerId).length;
  assert.equal(await page.locator('.quiz-engine__result-fraction strong').innerText(),`${correct} / 10`);
  assert.equal(await page.evaluate(()=>window.adCalls.length),2);
  assert.equal(documents,1);assert.deepEqual(errors,[]);
  console.log(`${locale}: 10 questions, one result checkpoint, two mocked rewards, correct score, no overflow PASS`);
 }finally{await context.close();}
}
try{await Promise.all(Array.from({length:6},async()=>{while(queue.length){const locale=queue.shift();try{await check(locale);}catch(error){failures.push({locale,error:String(error)});console.error(locale,String(error));}}}));}finally{await browser.close();}
assert.deepEqual(failures,[]);
