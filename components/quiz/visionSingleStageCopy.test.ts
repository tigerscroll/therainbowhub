import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read=(locale:string)=>JSON.parse(fs.readFileSync(`data/quizzes/vision/${locale}.json`,'utf8'));

test('Vision result profiles do not describe rounds after the ten-question single-stage conversion',()=>{
 const definition=read('quiz');
 assert.equal(definition.structure.stages.length,1);
 assert.equal(definition.structure.stages[0].questionIds.length,10);

 const staleRoundTerms:Record<string,RegExp>={
  ar:/جولة|جولات/,
  bg:/рунд|кръг/i,
  cs:/\bkolo\b|\bkole\b/i,
  da:/runde/i,
  de:/Runde/i,
  el:/γύρ/i,
  en:/\bround\b/i,
  es:/ronda/i,
  fi:/kierro/i,
  fil:/round|pag-ikot/i,
  fr:/manche/i,
  he:/סיבוב/,
  hr:/runda/i,
  hu:/\bkör\b|köröd/i,
  id:/putaran/i,
  it:/round/i,
  ja:/ラウンド/,
  ms:/pusingan/i,
  nb:/runde/i,
  nl:/ronde/i,
  pl:/runda/i,
  pt:/etapa/i,
  ro:/rund/i,
  sk:/\bkolo\b/i,
  sr:/рунда/i,
  sv:/omgång/i,
  th:/รอบ/,
  tr:/\btur\b/i,
  uk:/раунд/i,
  vi:/vòng/i
 };

 assert.deepEqual(Object.keys(staleRoundTerms).sort(),definition.activeLocales.slice().sort());
 for(const locale of definition.activeLocales){
  const profiles=read(locale).results.profiles;
  for(const key of ['profile-2','profile-4']){
   assert.ok(profiles[key].copy.trim(),`${locale}/${key}`);
   assert.doesNotMatch(profiles[key].copy,staleRoundTerms[locale],`${locale}/${key}`);
  }
 }
});
