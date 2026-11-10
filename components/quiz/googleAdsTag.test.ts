import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

test('the shared Google tag preserves Analytics without the manually added Ads configuration', () => {
  const source = fs.readFileSync('components/RootDocument.tsx', 'utf8');
  assert.equal([...source.matchAll(/src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/g)].length, 1);
  assert.match(source, /src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-44LV753KWN"/);
  assert.doesNotMatch(source, /AW-18146485081/, 'Ads installation is managed outside the app by Cloudflare');
  const initialization = source.match(/<Script id="google-analytics"[^>]*>\s*\{`([\s\S]*?)`\}/)?.[1];
  assert(initialization, 'shared Google tag initialization exists');
  const context = vm.createContext({ dataLayer: [] as unknown[] });
  context.window = context;
  vm.runInContext(initialization, context);
  const commands = JSON.parse(JSON.stringify(context.dataLayer));
  assert.equal(commands.filter((command: Record<string, unknown>) => command[0] === 'js').length, 1);
  assert.deepEqual(commands.filter((command: Record<string, unknown>) => command[0] === 'config').map((command: Record<string, unknown>) => Object.values(command)), [
    ['config', 'G-44LV753KWN', { send_page_view: false }],
  ]);
  assert.equal(commands.filter((command: Record<string, unknown>) => command[0] === 'event').length, 0, 'base tag does not invent conversion events');
});

test('English, localized and not-found documents all use the tagged shared root', () => {
  for (const file of ['app/(default)/layout.tsx', 'app/[locale]/layout.tsx', 'app/global-not-found.tsx']) {
    assert.match(fs.readFileSync(file, 'utf8'), /<RootDocument\b/, file);
  }
});
