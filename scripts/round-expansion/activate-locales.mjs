import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {requested} from './config.mjs';
const locales=fs.readdirSync('data/i18n').filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5));
// Activation is deliberately separate from translation. All draft checks must pass first.
execFileSync('node',['scripts/round-expansion/audit-drafts.mjs'],{stdio:'inherit'});
execFileSync('node',['scripts/validate-localizations.mjs',`--audit-locales=${locales.join(',')}`,`--audit-quizzes=${requested.join(',')}`],{stdio:'inherit'});
for(const slug of requested){
 const file=`data/quizzes/${slug}/quiz.json`,old=fs.readFileSync(file,'utf8'),manifest=JSON.parse(old);
 for(const locale of locales){const copy=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`));if(Object.values(copy.stages).some(s=>Object.keys(s.questions).length!==6)||Object.keys(copy.stages).length!==5)throw Error(`Incomplete ${slug}/${locale}`);}
 manifest.activeLocales=['en',...locales.filter(l=>l!=='en')];manifest.engine.localeParity='strict';
 const next=JSON.stringify(manifest,null,2)+'\n';if(next===old)continue;
 execFileSync('apply_patch',[],{input:`*** Begin Patch\n*** Update File: ${file}\n@@\n${old.trimEnd().split('\n').map(x=>'-'+x).join('\n')}\n${next.trimEnd().split('\n').map(x=>'+'+x).join('\n')}\n*** End Patch\n`,stdio:['pipe','pipe','pipe']});
}
console.log(`Enabled ${requested.length} quizzes in ${locales.length} locales in local source; no deployment performed.`);
