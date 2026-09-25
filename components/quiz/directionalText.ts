/** Isolate codes, arithmetic and Latin letters inside right-to-left prose. */
export function directionalParts(text: string) {
  const coordinate = /^\([+−-]?\d+(?:\.\d+)?,\s*[+−-]?\d+(?:\.\d+)?\)$/;
  if (coordinate.test(text)) return [{text, ltr: true}];
  if (!/\p{Script=Arabic}/u.test(text)) return [{text, ltr: false}];
  const literal = /\([A-Za-z0-9+−-][A-Za-z0-9\s.,:;/%°+−–—×÷→←*=\-?]*\)|[A-Za-z0-9](?:[A-Za-z0-9\s.,:;/%°+−–—×÷→←*=\-?]*[A-Za-z0-9%°?])?/g;
  const parts: {text: string; ltr: boolean}[] = [];
  let cursor = 0;
  for (const match of text.matchAll(literal)) {
    const start = match.index!;
    if (start > cursor) parts.push({text: text.slice(cursor, start), ltr: false});
    parts.push({text: match[0], ltr: true});
    cursor = start + match[0].length;
  }
  if (cursor < text.length) parts.push({text: text.slice(cursor), ltr: false});
  return parts;
}
