import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';

const base=process.env.QUIZ_TEST_URL??'http://localhost:3198';
const widths=(process.env.QUIZ_TEST_WIDTHS??'320,390,1440').split(',').map(Number);
const slugs=['vision','memory','years-left'];
const locales=JSON.parse(fs.readFileSync('data/quizzes/vision/quiz.json')).activeLocales;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const queue=slugs.flatMap(slug=>locales.map(locale=>({slug,locale}))),issues=[];
try {
 await Promise.all(Array.from({length:5},async()=>{
  const context=await browser.newContext();
  await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  const page=await context.newPage();
  try {while(queue.length){
   const {slug,locale}=queue.shift();
   await page.goto(`${base}/${locale==='en'?'':locale+'/'}${slug}`);
   await page.locator('.quiz-engine__quick-start').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   const expected=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`)).landing.intro;
   assert.equal(await page.locator('.quiz-engine__quick-start').textContent(),expected);
   for(const width of widths){
    await page.setViewportSize({width,height:900});
    const result=await page.locator('.quiz-engine__quick-start').evaluate(n=>{
     const s=getComputedStyle(n),r=n.getBoundingClientRect();
     return {lines:Math.round(r.height/parseFloat(s.lineHeight)),overflow:document.documentElement.scrollWidth>innerWidth||n.scrollWidth>n.clientWidth};
    });
    if(result.lines>2||result.overflow)issues.push({slug,locale,width,...result,text:expected});
   }
  }}finally{await context.close();}
 }));
}finally{await browser.close();}
console.log(JSON.stringify({checked:slugs.length*locales.length*widths.length,issues},null,2));
assert.equal(issues.length,0,'Subtitles must remain two lines at the tested widths');
