// Authored puzzle source. Run from the project root to rebuild the English data,
// deterministic SVG boards and human-readable answer key together.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {localizeVisionImages} from './chapter-locales/vision-images.mjs';

const root = 'data/quizzes/vision';
const out = `${root}`;
const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const copy = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
const ink = '#163654';
const accent = '#18859a';
const positions = ['Top left', 'Top right', 'Bottom left', 'Bottom right'];
const directions = ['Up', 'Right', 'Down', 'Left'];
const diagonals = ['Up-right', 'Down-right', 'Down-left', 'Up-left'];
const letters = ['A', 'B', 'C', 'D'];
const rows = letters.map(letter => `Row ${letter}`);
const puzzles = [];
const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (value, x, y, size = 32, extra = '') => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" fill="${ink}" ${extra}>${esc(value)}</text>`;
const group = (body, x, y, scale = 1, extra = '') => `<g transform="translate(${x} ${y}) scale(${scale})" ${extra}>${body}</g>`;
const rect = (x, y, width, height, fill, extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" ${extra}/>`;
const dot = (x, y, radius = 10, fill = ink) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}"/>`;
const board = (body, height = 300) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 ${height}" width="480" height="${height}"><rect width="480" height="${height}" rx="18" fill="#f1f7fa"/>${body}</svg>\n`;

function symbol(name) {
  let body;
  if (name.startsWith('arrow:')) body = `<g transform="rotate(${Number(name.split(':')[1])})"><path d="M0 -40 30 -8H12V36H-12V-8H-30Z" fill="${ink}"/></g>`;
  else if (name.startsWith('gap:')) body = `<g transform="rotate(${Number(name.split(':')[1])})"><path d="M28 -16A32 32 0 1 0 28 16" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round"/></g>`;
  else if (name === 'ring') body = `<circle r="32" fill="none" stroke="${ink}" stroke-width="8"/>`;
  else if (name === 'double-ring') body = `<circle r="33" fill="none" stroke="${ink}" stroke-width="5"/><circle r="18" fill="none" stroke="${ink}" stroke-width="5"/>`;
  else if (name === 'circle') body = dot(0, 0, 32);
  else if (name === 'square') body = rect(-30, -30, 60, 60, ink, 'rx="2"');
  else if (name === 'diamond' || name === 'diamond-outline') body = `<path d="M0 -38 34 0 0 38 -34 0Z" fill="${name === 'diamond' ? ink : 'none'}" stroke="${ink}" stroke-width="6"/>`;
  else if (name.startsWith('triangle')) {
    const [, rotation = '0', fill = 'solid'] = name.split(':');
    body = `<path transform="rotate(${rotation})" d="M0 -35 34 28H-34Z" fill="${fill === 'outline' ? 'none' : ink}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>`;
  } else if (name.startsWith('key:')) {
    const flip = name.endsWith('left') ? -1 : 1;
    body = `<g transform="scale(${flip} 1)" stroke="${ink}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="0" cy="-23" r="15"/><path d="M0 -8V37M0 17H20M0 34H20"/></g>`;
  } else if (name.startsWith('lines:')) {
    const count = Number(name.split(':')[1]);
    body = Array.from({ length: count }, (_, i) => rect(-30, (i - (count - 1) / 2) * 21 - 4, 60, 8, ink, 'rx="4"')).join('');
  } else if (name === 'stem:left' || name === 'stem:right') {
    const side = name.endsWith('left') ? -1 : 1;
    body = `<path d="M0 -37V37M0 -16H${side * 30}" stroke="${ink}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  } else if (name === 'Q' || name === 'O') {
    body = `<ellipse rx="26" ry="34" fill="none" stroke="${ink}" stroke-width="7"/>${name === 'Q' ? `<path d="M10 17 30 39" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>` : ''}`;
  } else body = text(name, 0, 0, 74, 'style="font-family:monospace"');
  return `<g data-symbol="${esc(name)}">${body}</g>`;
}

function dots(count) {
  const columns = count <= 4 ? 2 : 3;
  const rowCount = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, i) => dot((i % columns - (columns - 1) / 2) * 25, (Math.floor(i / columns) - (rowCount - 1) / 2) * 25, 8)).join('');
}

function tiles(items, render = symbol) {
  return board(items.map((item, i) => group(
    rect(-102, -62, 204, 124, '#ffffff', 'rx="12" stroke="#b8ccd8" stroke-width="2"') + render(item, i),
    i % 2 ? 356 : 124, i < 2 ? 76 : 224, 1, `data-panel="${positions[i]}"`,
  )).join(''));
}

function searchGrid(items, columns = 4) {
  const rowCount = Math.ceil(items.length / columns);
  const cellHeight = 76;
  return board(items.map((item, i) => group(symbol(item), (i % columns + .5) * 480 / columns, (Math.floor(i / columns) + .5) * cellHeight, .69)).join(''), rowCount * cellHeight);
}

function sequence(items, render = symbol) {
  return board(items.map((item, i) => group(
    rect(-40, -58, 80, 116, '#ffffff', 'rx="10" stroke="#b8ccd8" stroke-width="2"') + (item === '?' ? text('?', 0, 0, 56) : group(render(item), 0, 0, .72)),
    (i + .5) * 480 / items.length, 85,
  )).join(''), 170);
}

function rowBoard(items, render, height = 300) {
  return board(items.map((item, i) => group(
    rect(-219, -31, 438, 62, '#ffffff', 'rx="9" stroke="#b8ccd8"') + text(letters[i], -187, 0, 28) + render(item, i),
    240, (i + .5) * height / items.length, 1, `data-row="${letters[i]}"`,
  )).join(''), height);
}

function corner(dotPosition) {
  return rect(-48, -48, 96, 96, '#ffffff', `stroke="${ink}" stroke-width="4" rx="4"`) + dot(dotPosition % 2 ? 27 : -27, dotPosition < 2 ? -27 : 27, 10, accent);
}

function codes(first, second) {
  return board(text('ORIGINAL', 240, 30, 20) + text(first, 240, 75, 40, 'style="font-family:monospace;letter-spacing:2px"') + text('COPY', 240, 136, 20) + text(second, 240, 181, 40, 'style="font-family:monospace;letter-spacing:2px"'), 225);
}

function targetCodes(target, options) {
  return board(text('TARGET', 240, 26, 20) + text(target, 240, 63, 38, 'style="font-family:monospace;letter-spacing:2px"') + options.map((value, i) => group(text(letters[i], -176, 0, 28) + text(value, 25, 0, 35, 'style="font-family:monospace;letter-spacing:2px"'), 240, 123 + i * 59, 1, `data-row="${letters[i]}"`)).join(''), 335);
}

function gridLines(columns, rowCount) {
  const size = 75;
  const left = (480 - columns * size) / 2;
  const top = 26;
  return board(Array.from({ length: columns + 1 }, (_, i) => `<path d="M${left + i * size} ${top}V${top + rowCount * size}"/>`).join('')
    .concat(Array.from({ length: rowCount + 1 }, (_, i) => `<path d="M${left} ${top + i * size}H${left + columns * size}"/>`).join(''))
    .replaceAll('<path', `<path fill="none" stroke="${ink}" stroke-width="5"`), rowCount * size + 52);
}

function coordinates(column, row, marker = '★', moves = '') {
  const startX = 115, startY = 55, step = 66;
  let body = '';
  for (let r = 0; r < 4; r++) {
    body += text(r + 1, 83, startY + (r + .5) * step, 25);
    for (let c = 0; c < 4; c++) body += rect(startX + c * step, startY + r * step, step, step, (c + r) % 2 ? '#e2eef3' : '#ffffff', 'stroke="#91aab9" stroke-width="2"');
  }
  body += letters.map((letter, i) => text(letter, startX + (i + .5) * step, 30, 25)).join('');
  body += text(marker, startX + (column + .5) * step, startY + (row + .5) * step, 42);
  if (moves) body += text(moves, 240, 354, 33);
  return board(body, moves ? 385 : 345);
}

function pixels(values, size = 20) {
  const columns = values[0].length;
  return values.map((row, r) => [...row].map((value, c) => rect((c - columns / 2) * size, (r - values.length / 2) * size, size, size, value === '1' ? ink : '#ffffff', 'stroke="#adc2cf" stroke-width="1.5"')).join('')).join('');
}

function targetPixels(target, options) {
  return board(text('TARGET', 240, 24, 19) + group(pixels(target, 19), 240, 85) + options.map((item, i) => group(pixels(item, 22) + text(letters[i], 0, 61, 24), i % 2 ? 350 : 130, i < 2 ? 200 : 350, 1, `data-row="${letters[i]}"`)).join(''), 428);
}

function add(round, question, choices, answer, svg, rationale, category, study) {
  const number = puzzles.filter(puzzle => puzzle.round === round).length + 1;
  assert.equal(choices.length, 4);
  assert.equal(new Set(choices).size, 4);
  assert.ok(choices.includes(answer), question);
  puzzles.push({ id: `vision-s${round}q${number}`, round, question, choices, answer, svg, rationale, category, study });
}
const odd = (question, symbols, different, rationale) => add(1, question, positions, positions[different], tiles(symbols), rationale, 'detail_detection');
odd('Which ring has a gap?', ['ring', 'gap:0', 'ring', 'ring'], 1, 'Only the top-right ring has an opening.');
odd('Which arrow points a different way?', ['arrow:45', 'arrow:45', 'arrow:45', 'arrow:135'], 3, 'The bottom-right arrow points down-right; the others point up-right.');
odd('Which diamond is only an outline?', ['diamond-outline', 'diamond', 'diamond', 'diamond'], 0, 'The top-left diamond has an empty center.');
add(1, 'Which tile has fewer dots?', positions, 'Bottom left', tiles([4, 4, 3, 4], dots), 'The bottom-left tile has three dots; the others have four.', 'attention_control');
odd('Which key has its teeth on the other side?', ['key:right', 'key:right', 'key:right', 'key:left'], 3, 'Only the bottom-right key has teeth on the left.');
odd('Which small branch points left?', ['stem:right', 'stem:left', 'stem:right', 'stem:right'], 1, 'Only the top-right stem branches left.');
odd('Which tile has an extra line?', ['lines:4', 'lines:3', 'lines:3', 'lines:3'], 0, 'The top-left tile has four lines; the others have three.');

const countPuzzle = (question, symbols, answer, choices, rationale) => add(2, question, choices.map(String), String(answer), searchGrid(symbols), rationale, 'attention_control');
countPuzzle('How many empty rings can you find?', ['ring','circle','square','ring','square','ring','circle','circle','ring','square','circle','square','circle','square','ring','circle'], 5, [4,5,6,7], 'Empty rings occupy cells 1, 4, 6, 9 and 15 in reading order.');
countPuzzle('How many arrows point straight up?', ['arrow:0','arrow:90','arrow:0','arrow:180','arrow:270','arrow:0','arrow:90','arrow:0','arrow:180','arrow:90','arrow:270','arrow:0','arrow:90','arrow:0','arrow:180','arrow:270'], 6, [4,5,6,7], 'Up arrows occupy cells 1, 3, 6, 8, 12 and 14.');
countPuzzle('How many times does the digit 6 appear?', ['9','8','6','9','6','9','8','8','9','6','9','8','8','9','9','6'], 4, [3,4,5,6], 'Sixes occupy cells 3, 5, 10 and 16.');
countPuzzle('How many triangles are in the grid?', ['triangle','diamond','triangle','square','triangle','square','diamond','triangle','diamond','triangle','square','diamond','triangle','diamond','triangle','square'], 7, [5,6,7,8], 'Triangles occupy cells 1, 3, 5, 8, 10, 13 and 15.');
countPuzzle('How many tiles contain exactly two lines?', ['lines:1','lines:2','lines:3','lines:1','lines:2','lines:3','lines:1','lines:2','lines:3','lines:1','lines:2','lines:3','lines:1','lines:3','lines:2','lines:1'], 5, [4,5,6,7], 'Pairs occupy cells 2, 5, 8, 11 and 15.');
countPuzzle('How many double rings can you spot?', ['ring','circle','double-ring','ring','circle','ring','circle','double-ring','ring','circle','ring','circle','double-ring','circle','ring','ring'], 3, [2,3,4,5], 'Double rings occupy cells 3, 8 and 13.');
countPuzzle('How many capital Es are hiding here?', ['E','F','T','E','L','E','F','T','E','L','E','F','T','L','F','E'], 6, [4,5,6,7], 'Es occupy cells 1, 4, 6, 9, 11 and 16.');

add(3, 'The three-shape pattern repeats. What comes next?', ['Circle','Triangle','Square','Diamond'], 'Square', sequence(['circle','triangle','square','circle','triangle','?']), 'Circle, triangle, square repeats, so the next shape is a square.', 'pattern_tracking');
add(3, 'The arrow keeps turning clockwise. What comes next?', directions, 'Right', sequence(['arrow:0','arrow:90','arrow:180','arrow:270','arrow:0','?']), 'Each arrow turns 90 degrees clockwise; right follows up.', 'pattern_tracking');
add(3, 'One dot is added each time. How many come next?', ['3 dots','4 dots','5 dots','6 dots'], '5 dots', sequence([1,2,3,4,'?'], dots), 'One, two, three, four, then five dots.', 'pattern_tracking');
add(3, 'The dot moves clockwise around the corners. Next?', positions, 'Top left', sequence([0,1,3,2,'?'], corner), 'Top left, top right, bottom right, bottom left, then top left.', 'pattern_tracking');
add(3, 'One dot disappears each time. What comes next?', ['1 dot','2 dots','3 dots','4 dots'], '2 dots', sequence([5,4,3,'?'], dots), 'Five, four, three, then two dots.', 'pattern_tracking');
add(3, 'These shapes alternate. Which one fills the gap?', ['Circle','Diamond','Triangle','Square'], 'Diamond', sequence(['diamond','circle','diamond','circle','?']), 'The alternating pair is diamond then circle.', 'pattern_tracking');
add(3, 'The triangle turns and alternates solid/outline. Next?', ['Solid up','Outline up','Solid right','Outline down'], 'Solid up', sequence(['triangle:0:solid','triangle:90:outline','triangle:180:solid','triangle:270:outline','?']), 'The next quarter-turn points up; the fill alternates back to solid.', 'pattern_tracking');

add(4, 'Mirror this arrow left to right. Where does it point?', diagonals, 'Up-left', board(group(symbol('arrow:45'), 240, 110, 1.65), 220), 'A left-right reflection changes up-right to up-left.', 'spatial_orientation');
add(4, 'Turn this arrow 90° clockwise. Where does it point?', directions, 'Right', board(group(symbol('arrow:0'), 240, 110, 1.65), 220), 'A clockwise quarter-turn takes up to right.', 'spatial_orientation');
add(4, 'Turn this arrow 180°. Where does it point?', diagonals, 'Up-right', board(group(symbol('arrow:225'), 240, 110, 1.65), 220), 'A half-turn takes down-left to up-right.', 'spatial_orientation');
add(4, 'Mirror the square left to right. Where is the dot?', positions, 'Top right', board(group(corner(0), 240, 120, 1.75), 240), 'The top-left dot reflects to top right.', 'spatial_orientation');
add(4, 'Flip the square top to bottom. Where is the dot?', positions, 'Top right', board(group(corner(3), 240, 120, 1.75), 240), 'The bottom-right dot reflects to top right.', 'spatial_orientation');
add(4, 'Turn the square 180°. Where does the dot land?', positions, 'Bottom left', board(group(corner(1), 240, 120, 1.75), 240), 'The top-right dot moves diagonally opposite to bottom left.', 'spatial_orientation');
add(4, 'Turn the ring 90° clockwise. Where is the gap?', directions, 'Up', board(group(symbol('gap:180'), 240, 110, 1.8), 220), 'The gap starts on the left; a clockwise quarter-turn moves it to the top.', 'spatial_orientation');

const swatch = color => rect(-73, -43, 146, 86, color, 'rx="8"');
add(5, 'Which tile is a different color?', positions, 'Bottom left', tiles(['#267d97','#267d97','#5869b5','#267d97'], swatch), 'Three tiles are teal; the bottom-left tile is blue-violet.', 'colour_contrast');
add(5, 'Which gray tile is the lightest?', positions, 'Top right', tiles(['#8a8a8a','#d0d0d0','#545454','#a8a8a8'], swatch), 'The top-right tile has the highest equal red, green and blue values.', 'colour_contrast');
add(5, 'Which blue tile is the darkest?', positions, 'Bottom right', tiles(['#789bc2','#43729e','#a8c9e9','#1b3555'], swatch), 'The bottom-right blue is darker than all the others.', 'colour_contrast');
add(5, 'Which row goes from darkest to lightest?', rows, 'Row C', rowBoard([
  ['#707070','#383838','#b0b0b0','#dddddd'], ['#dddddd','#b0b0b0','#707070','#383838'],
  ['#383838','#707070','#b0b0b0','#dddddd'], ['#383838','#b0b0b0','#707070','#dddddd'],
], shades => shades.map((shade, i) => rect(-132 + i * 78, -23, 66, 46, shade, 'rx="4"')).join('')), 'Only row C increases in brightness at every step.', 'colour_contrast');
add(5, 'Which tile matches the target color exactly?', letters.map(letter => `Tile ${letter}`), 'Tile D', board(text('TARGET', 240, 22, 20) + rect(171, 46, 138, 60, '#367f9b', 'rx="7"') + ['#326c86','#4199b1','#526b9b','#367f9b'].map((shade, i) => group(swatch(shade) + text(letters[i], 0, 58, 25), i % 2 ? 356 : 124, i < 2 ? 173 : 319)).join(''), 400), 'Target and tile D both use exactly #367f9b.', 'colour_contrast');
add(5, 'Which pair uses exactly the same shade?', positions, 'Top left', tiles([['#467f97','#467f97'],['#527c95','#406982'],['#32667e','#4b8299'],['#467794','#6293b0']], shades => rect(-78,-43,72,86,shades[0],'rx="6"') + rect(6,-43,72,86,shades[1],'rx="6"')), 'Both top-left swatches use #467f97; every other pair differs.', 'colour_contrast');
add(5, 'Which row goes from lightest to darkest?', rows, 'Row B', rowBoard([
  ['#e4e4e4','#707070','#adadad','#353535'], ['#e4e4e4','#adadad','#707070','#353535'],
  ['#353535','#707070','#adadad','#e4e4e4'], ['#adadad','#e4e4e4','#707070','#353535'],
], shades => shades.map((shade, i) => rect(-132 + i * 78, -23, 66, 46, shade, 'rx="4"')).join('')), 'Only row B decreases in brightness at every step.', 'colour_contrast');

const recall = (round, question, items, choices, answer, rationale) => add(round, question, choices, answer, undefined, rationale, 'visual_memory', items);
recall(6, 'Which icon came immediately after the key?', ['☀️','🔑','🌙','⚓'], ['Sun','Key','Moon','Anchor'], 'Moon', 'The order is sun, key, moon, anchor.');
recall(6, 'Which icon was first?', ['🍋','⭐','☂️','🔒','🎈'], ['Star','Lemon','Balloon','Lock'], 'Lemon', 'Lemon is first in the row.');
recall(6, 'Which icon was last?', ['🚲','🌵','🎸','⏰','✈️'], ['Bicycle','Cactus','Airplane','Guitar'], 'Airplane', 'Airplane is last in the row.');
recall(6, 'How many blue circles did you see?', ['🔴','🔵','🟡','🔵','🟢'], ['1','2','3','4'], '2', 'The second and fourth circles are blue.');
recall(6, 'Which shape was third in the snapshot?', ['⬛','🔺','⬛','🔷','⚪'], ['Red triangle','Blue diamond','White circle','Black square'], 'Black square', 'The third shape in reading order is a black square.');
recall(6, 'Which icon came just before the umbrella?', ['🍎','🔑','⭐','🍋','☂️','🌙'], ['Moon','Lemon','Star','Apple'], 'Lemon', 'Lemon is fourth, immediately before the umbrella.');
recall(6, 'Which icon was NOT in the snapshot?', ['🔒','⚓','🔔','🎈','🌵','🔑'], ['Bell','Cactus','Anchor','Star'], 'Star', 'There is no star in the snapshot.');

add(7, 'Which original character was replaced?', ['7','K','8','2'], '7', codes('M8Q2-K7','M8Q2-K1'), 'Only the final 7 changes, becoming 1.', 'detail_detection');
add(7, 'How many characters changed between these codes?', ['1','2','3','4'], '2', codes('R4N7-X2','R4M7-X9'), 'N changes to M and the last 2 changes to 9.', 'detail_detection');
add(7, 'Which row is an exact copy of the target?', rows, 'Row B', targetCodes('T6P3-K8',['T6P3-K6','T6P3-K8','T6R3-K8','T6P8-K3']), 'Only row B matches all characters and their order.', 'detail_detection');
add(7, 'Which code appears twice?', ['A8K9','B4M2','C7R5','D3N6'], 'C7R5', board(['A8K9','C7R5','B4M2','D3N6','C7R5','E2T8'].map((code, i) => group(rect(-103,-39,206,78,'#ffffff','rx="9" stroke="#b8ccd8"') + text(code,0,0,37,'style="font-family:monospace"'), i % 2 ? 356 : 124, 53 + Math.floor(i / 2) * 98)).join('')), 'C7R5 appears at top right and bottom left.', 'attention_control');
add(7, 'Which row contains a mismatched pair?', rows, 'Row D', rowBoard([['5836','5836'],['7264','7264'],['9417','9417'],['3629','3692']], values => text(values[0],-63,0,34,'style="font-family:monospace"') + text(values[1],115,0,34,'style="font-family:monospace"')), 'The pair in row D differs in the last two positions.', 'detail_detection');
add(7, 'Which row shows the target in reverse order?', rows, 'Row A', targetCodes('6173',['3716','3761','3176','7316']), 'Reading 6173 right to left gives 3716.', 'pattern_tracking');
add(7, 'Which two positions switched between these codes?', ['2nd and 3rd','3rd and 4th','4th and 5th','5th and 6th'], '4th and 5th', codes('847196','847916'), 'Positions four and five swap from 1,9 to 9,1.', 'detail_detection');

add(8, 'Count every square, including the large one.', ['4','5','6','8'], '5', gridLines(2,2), 'Four unit squares plus one 2-by-2 square make five.', 'spatial_orientation');
add(8, 'How many squares are in this grid, in all sizes?', ['9','12','14','16'], '14', gridLines(3,3), 'Nine unit squares, four 2-by-2 squares and one 3-by-3 square make fourteen.', 'spatial_orientation');
add(8, 'How many triangles can you trace along these lines?', ['2','3','4','5'], '3', board('<path d="M240 28 95 242H385ZM240 28V242" fill="none" stroke="#163654" stroke-width="6" stroke-linejoin="round"/>',270), 'Two smaller triangles and their combined outer triangle make three.', 'spatial_orientation');
add(8, 'Which cell is directly below the star?', ['B2','C1','C3','D2'], 'C3', coordinates(2,1), 'The star is in C2, so the cell directly below is C3.', 'spatial_orientation');
add(8, 'How many dots are inside BOTH circles?', ['2','3','4','5'], '3', board('<circle cx="190" cy="145" r="99" fill="none" stroke="#18859a" stroke-width="5"/><circle cx="290" cy="145" r="99" fill="none" stroke="#163654" stroke-width="5"/>' + [[240,93],[221,148],[251,188],[140,113],[147,183],[338,110],[350,176],[238,265]].map(([x,y]) => dot(x,y,9)).join('')), 'The dots at (240,93), (221,148) and (251,188) are inside both circles. The bottom dot is outside both.', 'attention_control');
add(8, 'Which tile has the most filled squares?', positions, 'Bottom right', tiles([['110','100','100'],['110','110','000'],['111','100','000'],['110','110','100']], value => pixels(value,28)), 'The bottom-right tile has five filled cells; each other tile has four.', 'attention_control');
add(8, 'Start at the dot. Follow the arrows. Where do you end?', ['B1','C1','C2','D1'], 'C1', coordinates(2,2,'●','→  ↑  ↑  ←'), 'Starting at C3: D3, D2, D1, then C1.', 'spatial_orientation');

add(9, 'Which dot pattern is different?', positions, 'Bottom left', tiles([false,false,true,false], changed => [[-33,-30],[33,-30],[0,0],[-33,30],[changed ? 0 : 33,30]].map(([x,y]) => dot(x,y,9)).join('')), 'Only the bottom-left tile moves its lower-right dot to the lower middle.', 'detail_detection');
add(9, 'Which row breaks the empty/filled circle pattern?', rows, 'Row C', rowBoard([
  ['ring','circle','ring','circle','ring','circle'], ['ring','circle','ring','circle','ring','circle'],
  ['ring','circle','ring','ring','ring','circle'], ['ring','circle','ring','circle','ring','circle'],
], values => values.map((value,i) => group(symbol(value),-123 + i * 57,0,.4)).join('')), 'The fourth circle in row C is empty; it should be filled to alternate.', 'pattern_tracking');
const target = ['1100','0100','0110','0010'];
add(9, 'Which tile exactly matches the target pattern?', letters.map(letter => `Tile ${letter}`), 'Tile C', targetPixels(target,[['1100','0100','0100','0010'],['1100','0010','0110','0010'],target,['1100','0100','0110','0001']]), 'Only tile C matches every filled cell in the target.', 'detail_detection');
add(9, 'Which ring has its opening on the opposite side?', positions, 'Bottom right', tiles(['gap:90','gap:90','gap:90','gap:270']), 'Three gaps face down; the bottom-right gap faces up.', 'spatial_orientation');
add(9, 'Which row has the same shapes in a different order?', rows, 'Row B', rowBoard([
  [['circle','triangle','square'],['square','circle','diamond']],
  [['diamond','circle','triangle'],['triangle','diamond','circle']],
  [['square','diamond','circle'],['triangle','square','diamond']],
  [['triangle','square','diamond'],['circle','triangle','square']],
], pair => pair.map((values, side) => values.map((value,i) => group(symbol(value),-134 + side * 186 + i * 50,0,.39)).join('')).join('') + '<path d="M19 -21V21" stroke="#b8ccd8" stroke-width="2"/>'), 'Only row B contains one diamond, one circle and one triangle on both sides.', 'detail_detection');
add(9, 'Which arrow group contains a different middle arrow?', positions, 'Top right', tiles([90,270,90,90], middle => [0,middle,180].map((angle,i) => group(symbol(`arrow:${angle}`),(i-1)*52,0,.49)).join('')), 'Only the top-right group has a left-pointing middle arrow.', 'detail_detection');
add(9, 'How many Qs are mixed in with the Os?', ['5','6','7','8'], '6', searchGrid(['O','Q','O','O','O','O','O','O','Q','O','Q','O','O','O','O','O','O','Q','O','O','O','Q','O','O','O','O','O','O','Q','O'],5), 'Qs occupy cells 2, 9, 11, 18, 22 and 29.', 'attention_control');

add(10, 'Which tile has two dots inside its ring?', positions, 'Bottom left', tiles([1,1,2,1], count => symbol('ring') + (count === 1 ? dot(0,0,7) : dot(-12,0,7) + dot(12,0,7))), 'Only the bottom-left ring contains two dots.', 'detail_detection');
add(10, 'Rotate this diagonal arrow 90° clockwise. Next?', diagonals, 'Up-left', board(group(symbol('arrow:225'),240,110,1.65),220), 'A clockwise quarter-turn takes down-left to up-left.', 'spatial_orientation');
recall(10, 'Which icon was fourth in the snapshot?', ['🌙','🍋','🔒','🌵','⭐','🚲'], ['Lock','Star','Lemon','Cactus'], 'Cactus', 'Moon, lemon, lock, cactus, star, bicycle: cactus is fourth.');
add(10, 'How many positions differ in this code pair?', ['1','2','3','4'], '3', codes('K7M2-R8','K1N2-R6'), 'Positions two, three and seven change: 7→1, M→N and 8→6.', 'detail_detection');
add(10, 'How many squares fit this rectangular grid?', ['6','7','8','9'], '8', gridLines(3,2), 'Six unit squares plus two 2-by-2 squares make eight.', 'spatial_orientation');
const traceMaze = fs.readFileSync(`${root}/assets/icons/eye-tracking-maze.svg`, 'utf8').replace('font-size="30"', 'font-size="36"');
add(10, 'Follow the dotted line from the left dot. Where does it end?', letters, 'C', traceMaze, 'The dotted route starting at the filled dot on the left ends at C.', 'pattern_tracking');
add(10, 'Each row adds one dot at a time. What fills the gap?', ['4 dots','5 dots','6 dots','7 dots'], '5 dots', board([1,2,3,2,3,4,3,4,'?'].map((value,i) => group(rect(-61,-47,122,94,'#ffffff','rx="9" stroke="#b8ccd8"') + (value === '?' ? text('?',0,0,49) : dots(value)),85+(i%3)*155,58+Math.floor(i/3)*108)).join(''),332), 'Rows are 1,2,3; 2,3,4; and 3,4,5. The gap needs five dots.', 'pattern_tracking');

const chapters = [
  ['First Look','Your first details are in','Your first-look answers put this round in {profile} territory. Next, pick out the signals hiding in a busier display.','A familiar symbol can disappear into a crowd.'],
  ['Signal Search','Your search results are in','This round’s puzzle profile: {profile}. Now see whether you can follow a pattern as it changes.','The next shape is there. Can you see the rule?'],
  ['Moving Patterns','Your pattern readout is ready','Your pattern answers put this round in {profile} territory. Next, the same shapes will turn and flip.','A small turn can change everything.'],
  ['Mirror Moves','Your mental turns are checked','This round’s puzzle profile: {profile}. Next, trade angles for shades and look for a closer match.','Similar colors. Small differences. A fresh challenge.'],
  ['Color Clues','Your color comparisons are in','Your color answers put this round in {profile} territory. Next, take a snapshot and see what stays with you.','The icons will disappear. Which details will stick?'],
  ['Visual Snapshot','Your snapshot answers are stored','This round’s puzzle profile: {profile}. Next, inspect codes where a single character can change the answer.','An exact match is harder than a quick glance.'],
  ['Code Breaker','Your code comparisons are checked','Your code answers put this round in {profile} territory. Next, look inside shapes for hidden structure.','The small shapes count. So do the big ones.'],
  ['Hidden Structure','Your hidden shapes are counted','This round’s puzzle profile: {profile}. Next, test your eye against some especially close comparisons.','Look for the detail that changes the whole picture.'],
  ['Close Matches','Your close comparisons are in','Your comparison answers put this round in {profile} territory. Now bring those skills together in a mixed challenge.','A few familiar ideas are about to take a new turn.'],
  ['The Final Mix','Your vision result is ready','Did you beat 80%? Your score and strengths are ready.'],
];
assert.equal(puzzles.length,70);
assert.equal(new Set(puzzles.map(puzzle => puzzle.question)).size,70);
assert.deepEqual(chapters.map((_,i) => puzzles.filter(puzzle => puzzle.round === i+1).length),Array(10).fill(7));
manifest.template = 'ten-stage-seven-question-v1';
manifest.activeLocales = fs.readdirSync('data/i18n').filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file => file.slice(0, -5)).sort();
manifest.engine.localeParity = 'independent';
manifest.listing.compactLanding = true;
manifest.listing.showSocialProof = false;
manifest.structure.stages = [];
manifest.structure.questions = {};
manifest.structure.results.score.showBestRound = false;
copy.landing.cta = 'Start';
copy.summary = 'Spot tiny differences, follow shifting patterns and hold visual details in mind. How much will you catch?';
copy.about.body = 'Test your attention with shapes, patterns, colors, reflections and visual snapshots. Each set brings a different kind of puzzle.\n\nLook carefully, then choose the answer supported by what you see. For memory puzzles, study the icons and tap when you are ready to hide them. Your answers build a puzzle score and a breakdown of the areas you handled best.\n\nThis is an entertainment challenge, not an eye examination or a medical assessment.';
copy.about.howToPlay.steps = ['Look at the picture or study the icons, then choose one answer.', 'At each checkpoint, see your round’s puzzle profile and continue to a new challenge.', 'Reveal your overall score and explore the answers you missed.'];
copy.career = { resultProgressLabel: 'Your vision challenge', stages: {} };
copy.stages = {};
copy.results.name = 'YOUR VISION PUZZLE SCORE';
copy.results.dimensions['dimension-1'].label = 'Color and memory';
const profileCopy = [
  'You caught the vast majority of the differences, patterns and visual details in this challenge. Your puzzle score reflects consistently accurate answers across the set.',
  'You cleared the 80% challenge. Your answers picked out most of the patterns, comparisons and small visual changes in this set.',
  'You found many of the visual rules and details in this set. Your breakdown shows which puzzle areas you handled most accurately.',
  'You spotted plenty of details across different puzzle types. Your breakdown highlights the areas where your answers were strongest.',
  'You found some useful clues and solved a mix of visual puzzles. The answer review lets you revisit the comparisons that caught you out.',
  'This set gave you plenty of details to sort through. Explore the answer review to see which patterns and changes you missed. This score does not measure your eyesight.',
];
Object.values(copy.results.profiles).forEach((profile,i) => { profile.copy = profileCopy[i]; });
copy.results.score.insights.snapshot = 'Your puzzle profile';

// Keep board labels and spatial locations in reading order. Balance the remaining
// answer positions around those fixed choices with a deterministic shuffle.
let seed = 82023;
const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296; };
const shuffle = values => {
  const result = [...values];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
};
const followsBoard = puzzle => [positions, rows, letters, letters.map(letter=>`Tile ${letter}`)]
  .some(order=>puzzle.choices.every((choice,i)=>choice===order[i]));
const fixedPositions = puzzles.map(puzzle=>followsBoard(puzzle)?puzzle.choices.indexOf(puzzle.answer):undefined);
const remainingPositions = [18,18,17,17];
for (const position of fixedPositions) if (position !== undefined) remainingPositions[position]--;
assert.ok(remainingPositions.every(count=>count>=0));
const shuffledPositions = shuffle(remainingPositions.flatMap((count,position)=>Array(count).fill(position)));
const answerPositions = fixedPositions.map(position=>position??shuffledPositions.shift());
const levels = ['foundation','foundation','developing','developing','skilled','skilled','advanced','advanced','advanced','final'];
fs.mkdirSync(out,{recursive:true});
for (const [index,[title,preAdTitle,preAdCopy,tagline]] of chapters.entries()) {
  const stageId = `stage-${index+1}`;
  manifest.structure.stages.push({id:stageId,difficultyLevel:levels[index],questionIds:puzzles.filter(puzzle=>puzzle.round===index+1).map(puzzle=>puzzle.id)});
  copy.stages[stageId] = {title,questions:{}};
  copy.career.stages[stageId] = {difficulty:title.toUpperCase(),preAdTitle,preAdCopy,preAdButton:index===9?'See My Result':'Continue'};
  if (tagline) copy.career.stages[stageId].next = {eyebrow:'UP NEXT',tagline};
  else copy.career.stages[stageId].preAdChecks = ['Answers checked','Puzzle strengths compared','Score calculated'];
}
for (const [index,puzzle] of puzzles.entries()) {
  const stageId = `stage-${puzzle.round}`;
  const answers = followsBoard(puzzle) ? [...puzzle.choices] : shuffle(puzzle.choices.filter(choice=>choice!==puzzle.answer));
  if (!followsBoard(puzzle)) answers.splice(answerPositions[index],0,puzzle.answer);
  const logic = {presentation:'text',correctAnswerId:`a${answerPositions[index]+1}`,category:puzzle.category,answerIds:['a1','a2','a3','a4']};
  const words = {question:puzzle.question,headerLabel:chapters[puzzle.round-1][0].toUpperCase(),answers:Object.fromEntries(answers.map((answer,i)=>[`a${i+1}`,answer]))};
  if (puzzle.svg) {
    const asset = puzzle.svg.startsWith('assets/') ? puzzle.svg : `assets/icons/en-${puzzle.id.slice(7)}.svg`;
    if (!puzzle.svg.startsWith('assets/')) fs.writeFileSync(`${root}/${asset}`,puzzle.svg);
    logic.image = {src:`/quizzes/vision/${asset}`};
    words.image = {alt: puzzle.id === 'vision-s10q6' ? 'Dotted paths run from the filled dot on the left to endpoints A, B, C and D on the right.' : `${chapters[puzzle.round-1][0]} puzzle board. ${puzzle.question}`};
  }
  if (puzzle.study) {
    logic.study = {mode:'manual',rewarded:false,presentation:'icons'};
    words.study = {title:'Take a mental snapshot',instruction:'Look from left to right, across each row. Tap when you’re ready to hide the icons.',items:puzzle.study,continueLabel:'I’m Ready'};
  }
  manifest.structure.questions[puzzle.id] = logic;
  copy.stages[stageId].questions[puzzle.id] = words;
}
localizeVisionImages(manifest);
for (const [name,data] of [['quiz',manifest],['en',copy]]) fs.writeFileSync(`${out}/${name}.json`,`${JSON.stringify(data,null,2)}\n`);
fs.writeFileSync(`${out}/ANSWER_KEY.md`, '# English Vision puzzle key\n\nThe title and subtitle are preserved from the original English landing page. These are authored entertainment puzzles, not eyesight measurements. SVG geometry is fixed so the correct answer does not depend on emoji rendering, except in the self-paced icon-memory cues. Left/right and clockwise refer to the displayed board.\n\nRebuild with `node scripts/build-vision-english.mjs`.\n\n| Question | Correct answer | Reason |\n| --- | --- | --- |\n' + puzzles.map(puzzle=>`| ${puzzle.id} | ${puzzle.answer} | ${puzzle.rationale} |`).join('\n')+'\n');
console.log(`Built ${puzzles.length} Vision questions, ${puzzles.filter(puzzle=>puzzle.study).length} self-paced snapshots and ${puzzles.filter(puzzle=>puzzle.svg?.startsWith('<svg')).length} SVG boards.`);
