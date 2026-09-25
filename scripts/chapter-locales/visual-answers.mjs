import {translationRowLocales as locales} from './config.mjs';

const rows = {
  'Top left': 'En haut à gauche|Oben links|In alto a sinistra|Linksboven|Arriba a la izquierda|Em cima, à esquerda|أعلى اليسار',
  'Top right': 'En haut à droite|Oben rechts|In alto a destra|Rechtsboven|Arriba a la derecha|Em cima, à direita|أعلى اليمين',
  'Bottom left': 'En bas à gauche|Unten links|In basso a sinistra|Linksonder|Abajo a la izquierda|Em baixo, à esquerda|أسفل اليسار',
  'Bottom right': 'En bas à droite|Unten rechts|In basso a destra|Rechtsonder|Abajo a la derecha|Em baixo, à direita|أسفل اليمين',
  'Right': 'À droite|Nach rechts|A destra|Naar rechts|A la derecha|Para a direita|اليمين',
  'Left': 'À gauche|Nach links|A sinistra|Naar links|A la izquierda|Para a esquerda|اليسار',
  'Down': 'Vers le bas|Nach unten|In basso|Omlaag|Hacia abajo|Para baixo|الأسفل',
  'Up': 'Vers le haut|Nach oben|In alto|Omhoog|Hacia arriba|Para cima|الأعلى',
  'Down-right': 'Vers le bas à droite|Nach unten rechts|In basso a destra|Rechtsonder|Abajo a la derecha|Para baixo e para a direita|نحو أسفل اليمين',
  'Up-left': 'Vers le haut à gauche|Nach oben links|In alto a sinistra|Linksboven|Arriba a la izquierda|Para cima e para a esquerda|نحو أعلى اليسار',
  'Up-right': 'Vers le haut à droite|Nach oben rechts|In alto a destra|Rechtsboven|Arriba a la derecha|Para cima e para a direita|نحو أعلى اليمين',
  'Down-left': 'Vers le bas à gauche|Nach unten links|In basso a sinistra|Linksonder|Abajo a la izquierda|Para baixo e para a esquerda|نحو أسفل اليسار',
  'Solid right': 'Plein, vers la droite|Ausgefüllt, nach rechts|Pieno, verso destra|Ingevuld, naar rechts|Relleno, hacia la derecha|Preenchido, para a direita|ممتلئ ومتجه إلى اليمين',
  'Solid up': 'Plein, vers le haut|Ausgefüllt, nach oben|Pieno, verso l’alto|Ingevuld, omhoog|Relleno, hacia arriba|Preenchido, para cima|ممتلئ ومتجه إلى الأعلى',
  'Outline down': 'Contour, vers le bas|Umriss, nach unten|Solo contorno, verso il basso|Omtrek, omlaag|Solo contorno, hacia abajo|Só contorno, para baixo|محيط فقط ومتجه إلى الأسفل',
  'Outline up': 'Contour, vers le haut|Umriss, nach oben|Solo contorno, verso l’alto|Omtrek, omhoog|Solo contorno, hacia arriba|Só contorno, para cima|محيط فقط ومتجه إلى الأعلى',
  'Diamond': 'Losange|Raute|Rombo|Ruit|Rombo|Losango|مُعيَّن',
};
const rowWords = ['Ligne', 'Reihe', 'Riga', 'Rij', 'Fila', 'Linha', 'الصف'];
const tileWords = ['Case', 'Feld', 'Riquadro', 'Vak', 'Casilla', 'Quadrado', 'المربع'];
export function correctVisualAnswer(slug, locale, source) {
  if (!['vision','iq'].includes(slug)) return undefined;
  const index = locales.indexOf(locale);
  if (rows[source]) return rows[source].split('|')[index];
  const label = source?.match(/^(Row|Tile) ([A-D])$/);
  if (slug === 'vision' && label) return `${(label[1] === 'Row' ? rowWords : tileWords)[index]} ${label[2]}`;
  return undefined;
}
