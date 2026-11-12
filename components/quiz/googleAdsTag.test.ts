import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync('components/RootDocument.tsx', 'utf8');
const head = source.match(/<head>([\s\S]*?)<\/head>/)?.[1];
const initialization = head?.match(/<script\s+id="google-analytics"\s+dangerouslySetInnerHTML=\{\{\s*__html: `([\s\S]*?)`/)?.[1];
const expectedConfigs = [
  ['config', 'G-44LV753KWN', { send_page_view: false }],
  ['config', 'AW-18146485081'],
];

test('the shared head configures Analytics and Ads once without adding an Ads loader or conversion event', () => {
  assert.equal([...source.matchAll(/src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/g)].length, 1);
  assert.match(source, /src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-44LV753KWN"/);
  assert(initialization, 'Google tag configuration is in the shared HTML head');
  const context = vm.createContext({});
  context.window = context;
  vm.runInContext(initialization, context);
  const commands = JSON.parse(JSON.stringify(context.dataLayer.map((command: ArrayLike<unknown>) => Array.from(command))));
  assert.equal(commands[0][0], 'js');
  assert.deepEqual(commands.slice(1), expectedConfigs);
});

test('the shared head reuses the Cloudflare gateway gtag and its initialized data layer', () => {
  assert(initialization);
  const dataLayer: unknown[][] = [['js', 'already initialized']];
  const gtag = (...args: unknown[]) => dataLayer.push(args);
  const context = vm.createContext({ dataLayer, gtag });
  context.window = context;
  vm.runInContext(initialization, context);
  assert.equal(context.gtag, gtag);
  assert.equal(context.dataLayer, dataLayer);
  assert.deepEqual(JSON.parse(JSON.stringify(dataLayer)), [['js', 'already initialized'], ...expectedConfigs]);
});

test('English, localized and not-found documents all use the tagged shared root', () => {
  for (const file of ['app/(default)/layout.tsx', 'app/[locale]/layout.tsx', 'app/global-not-found.tsx']) {
    assert.match(fs.readFileSync(file, 'utf8'), /<RootDocument\b/, file);
  }
});
