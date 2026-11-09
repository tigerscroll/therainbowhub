import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';
import {getTrafficHeaderBootstrapScript, hasAdClickId, TRAFFIC_HEADER_CLASS, TRAFFIC_HEADER_STORAGE_KEY} from '../../lib/trafficHeader.ts';

const positive = ['?fbclid=test', '?gclid=test', '?gbraid=test', '?wbraid=test', '?GCLID=test', '?GBRAID=test', '?WBRAID=test', '?GcLiD=test', '?gclid=', '?wbraid', '?utm_source=google&gbraid=test'];
const negative = ['', '?utm_source=google', '?notgclid=test', '?gclid_extra=test', '?utm_campaign=gclid', '?redirect=%3Fgclid%3Dtest'];

test('any Facebook or Google click-ID parameter hides the header, independently and case-insensitively', () => {
  for (const search of positive) assert.equal(hasAdClickId(new URLSearchParams(search)), true, search);
  for (const search of negative) assert.equal(hasAdClickId(new URLSearchParams(search)), false, search);
});

test('header first-paint bootstrap matches the runtime URL check even with blocked storage', () => {
  for (const blocked of [false, true]) for (const search of [...positive, ...negative]) {
    const classes = new Set();
    const saved = new Map();
    runInNewContext(getTrafficHeaderBootstrapScript(), {
      URLSearchParams, location: {search},
      document: {documentElement: {classList: {add: (name: string) => classes.add(name)}, style: {setProperty() {}}}},
      sessionStorage: {
        setItem(key: string, value: string) {if (blocked) throw Error('Storage blocked'); saved.set(key, value);},
        getItem(key: string) {if (blocked) throw Error('Storage blocked'); return saved.get(key) ?? null;},
      },
    });
    const expected = hasAdClickId(new URLSearchParams(search));
    assert.equal(classes.has(TRAFFIC_HEADER_CLASS), expected, `${search}, blocked=${blocked}`);
    assert.equal(saved.has(TRAFFIC_HEADER_STORAGE_KEY), expected && !blocked);
  }
});

test('attributed sessions retain header hiding and navigation background restoration across pages', () => {
  const saved = new Map([[TRAFFIC_HEADER_STORAGE_KEY, '1'], ['rainbowhub:navigation-background', '#123456']]);
  const classes = new Set();
  const properties = new Map();
  runInNewContext(getTrafficHeaderBootstrapScript(), {
    URLSearchParams, location: {search: ''},
    document: {documentElement: {classList: {add: (name: string) => classes.add(name)}, style: {setProperty: (key: string, value: string) => properties.set(key, value)}}},
    sessionStorage: {setItem: (key: string, value: string) => saved.set(key, value), getItem: (key: string) => saved.get(key) ?? null, removeItem: (key: string) => saved.delete(key)},
  });
  assert(classes.has(TRAFFIC_HEADER_CLASS));
  assert.equal(properties.get('--navigation-background'), '#123456');
  assert(!saved.has('rainbowhub:navigation-background'));
});

test('the shared root and hydrated header controller use the matching attribution helpers', () => {
  assert.match(fs.readFileSync('components/RootDocument.tsx', 'utf8'), /__html: getTrafficHeaderBootstrapScript\(\)/);
  assert.match(fs.readFileSync('components/FbclidHeaderVisibility.tsx', 'utf8'), /hasAdClickId\(searchParams\)/);
  const css = fs.readFileSync('styles/site.css', 'utf8');
  assert.match(css, /html\.fbclid-traffic\s*\{\s*--site-header-height: 0px;/);
  assert.match(css, /html\.fbclid-traffic \.hub-header\s*\{\s*display: none !important;/);
});
