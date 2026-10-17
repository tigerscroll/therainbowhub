import fs from 'node:fs';
import path from 'node:path';

// The filesystem is the catalogue. No slug or locale registration is required.
export function getQuizSlugs(root = path.join(process.cwd(), 'data/quizzes')) {
  return fs.readdirSync(root, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, 'quiz.json')))
    .map(entry => entry.name).sort();
}
export function getSiteLocales(root = path.join(process.cwd(), 'data/i18n')) {
  return fs.readdirSync(root).filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file => file.slice(0, -5)).sort();
}

// Article editions can introduce a site language before quizzes are translated.
export function getQuizContentLocales(root = path.join(process.cwd(), 'data/quizzes')) {
  return [...new Set(getQuizSlugs(root).flatMap(slug => {
    const directory = path.join(root, slug);
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'quiz.json'), 'utf8'));
    return manifest.activeLocales ?? fs.readdirSync(directory)
      .filter(file => /^[a-z]{2,3}\.json$/.test(file))
      .map(file => file.slice(0, -5));
  }))].sort();
}
