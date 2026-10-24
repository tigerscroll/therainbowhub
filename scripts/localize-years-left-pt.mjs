import fs from 'node:fs';
import {translateYearsLeft} from './localize-years-left-de-fr.mjs';

// Generate only Portuguese; retain the reviewed English, German and French files.
const root = 'data/quizzes/years-left';
const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const english = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
const portuguese = translateYearsLeft('pt', english, manifest);
fs.writeFileSync(`${root}/pt.json`, JSON.stringify(portuguese, null, 2) + '\n');
manifest.activeLocales = [...new Set([...(manifest.activeLocales ?? ['en']), 'pt'])].sort();
fs.writeFileSync(`${root}/quiz.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log('Years Left: neutral Portuguese enabled with the same 10 × 10 questions, IDs and scoring as English.');
