import fs from 'node:fs';
import {translateYearsLeft} from './localize-years-left-de-fr.mjs';

const root = 'data/quizzes/years-left';
const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const english = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
const spanish = translateYearsLeft('es', english, manifest);
fs.writeFileSync(`${root}/es.json`, JSON.stringify(spanish, null, 2) + '\n');
manifest.activeLocales = [...new Set([...(manifest.activeLocales ?? ['en']), 'es'])].sort();
fs.writeFileSync(`${root}/quiz.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log('Years Left: Spanish enabled with the same 10 × 10 questions, stable IDs and scoring as English.');
