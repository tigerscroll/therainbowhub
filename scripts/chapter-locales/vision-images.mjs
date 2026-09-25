import fs from 'node:fs';
import {locales, visionLabels} from './config.mjs';

// Only printed labels change. Puzzle geometry, positions and codes stay fixed.
export function localizeVisionImages(manifest, chosen = locales) {
  for (const logic of Object.values(manifest.structure.questions)) {
    if (!logic.image?.src) continue;
    const dataPath = src => src.startsWith('/quizzes/') ? `data${src}` : `data/quizzes/vision/${src}`;
    const svg = fs.readFileSync(dataPath(logic.image.src), 'utf8');
    if (!/>(ORIGINAL|COPY|TARGET)</.test(svg)) continue;
    logic.image.localizedSrc ??= {};
    for (const locale of chosen) {
      const src = logic.image.src.replace(/\.svg$/, `-${locale}.svg`);
      const localized = svg.replace(/>(ORIGINAL|COPY|TARGET)</g, (_, label) => `>${visionLabels[locale][label]}<`);
      fs.writeFileSync(dataPath(src), localized);
      logic.image.localizedSrc[locale] = src;
    }
  }
}
