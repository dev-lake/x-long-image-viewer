import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const landing = new URL('../landing/', import.meta.url);
const languageSource = await readFile(new URL('language.js', landing), 'utf8');
const locales = ['zh-CN', 'en', 'ja', 'pt-BR'];

// Keep DOMContentLoaded pending: these cases exercise the navigation decision
// before any page DOM or network response is available.
function detect({ path = '/', languages = ['en-US'], saved = null, blockedStorage = false, search = '', hash = '' } = {}) {
  const redirects = [];
  const context = {
    URL,
    document: { readyState: 'loading', addEventListener() {} },
    location: {
      pathname: path,
      origin: 'https://example.test',
      search,
      hash,
      replace(url) { redirects.push(url); }
    },
    navigator: { languages, language: languages[0] },
    localStorage: {
      getItem() {
        if (blockedStorage) throw new Error('Storage disabled');
        return saved;
      }
    },
    window: {}
  };
  vm.runInNewContext(languageSource, context, { filename: 'language.js' });
  return { locale: context.window.siteI18n.locale, redirects };
}

test('root selects the first supported browser language, normalizing case and region', () => {
  const result = detect({ languages: ['fr-FR', 'JA-jp', 'en-US'] });
  assert.equal(result.locale, 'ja');
  assert.deepEqual(result.redirects, ['https://example.test/ja/']);
});

test('Chinese and Portuguese regional browser tags use the available translations', () => {
  for (const [tag, expected] of [['zh-HK', 'zh-CN'], ['ZH_cn', 'zh-CN'], ['pt-PT', 'pt-BR'], ['PT_br', 'pt-BR']]) {
    assert.equal(detect({ languages: [tag] }).locale, expected, tag);
  }
});

test('a saved manual preference wins over browser preferences', () => {
  const result = detect({ saved: 'pt-BR', languages: ['ja-JP'] });
  assert.equal(result.locale, 'pt-BR');
  assert.deepEqual(result.redirects, ['https://example.test/pt-BR/']);
});

test('an explicit locale URL wins over storage and browser language without redirecting', () => {
  const result = detect({ path: '/ja/privacy/', saved: 'en', languages: ['pt-BR'] });
  assert.equal(result.locale, 'ja');
  assert.deepEqual(result.redirects, []);
});

test('unsupported browser languages and stale saved preferences fall back to English', () => {
  const result = detect({ saved: 'fr', languages: ['de-DE', 'fr-FR'] });
  assert.equal(result.locale, 'en');
  assert.deepEqual(result.redirects, ['https://example.test/en/']);
});

test('blocked browser storage still permits automatic language selection', () => {
  const result = detect({ blockedStorage: true, languages: ['ja-JP'] });
  assert.equal(result.locale, 'ja');
  assert.deepEqual(result.redirects, ['https://example.test/ja/']);
});

test('legacy privacy entry URLs go to the localized policy instead of the homepage', () => {
  for (const path of ['/privacy', '/privacy/', '/privacy.html']) {
    assert.deepEqual(detect({ path, languages: ['en-GB'] }).redirects, ['https://example.test/en/privacy/'], path);
  }
});

test('unknown URLs keep their path so the actual 404 response is preserved', () => {
  for (const [path, expected] of [['/missing', 'pt-BR'], ['/ja/missing', 'ja']]) {
    const result = detect({ path, languages: ['pt-BR'], saved: 'pt-BR' });
    assert.equal(result.locale, expected, path);
    assert.deepEqual(result.redirects, [], path);
  }
});

test('automatic redirects preserve query parameters and section anchors', () => {
  const result = detect({ path: '/index.html', languages: ['en-US'], search: '?ref=share&campaign=2', hash: '#features' });
  assert.deepEqual(result.redirects, ['https://example.test/en/?ref=share&campaign=2#features']);
});

test('all generated locale pages have matching language, canonical, and alternate URLs', async () => {
  const ogLocales = { 'zh-CN': 'zh_CN', en: 'en_US', ja: 'ja_JP', 'pt-BR': 'pt_BR' };
  for (const locale of locales) {
    for (const page of ['', 'privacy/']) {
      const html = await readFile(new URL(`${locale}/${page}index.html`, landing), 'utf8');
      const url = `https://x-image-viewer.devlake.app/${locale}/${page}`;
      assert.ok(html.includes(`<html lang="${locale}"`), `${locale}/${page} html language`);
      assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `${locale}/${page} canonical`);
      assert.match(html, /<title[^>]*>[^<]+<\/title>/, `${locale}/${page} title`);
      for (const alternate of locales) {
        assert.ok(html.includes(`hreflang="${alternate}" href="https://x-image-viewer.devlake.app/${alternate}/${page}"`), `${locale}/${page} alternate ${alternate}`);
      }
      assert.ok(html.includes(`<option value="${locale}"`) && new RegExp(`<option value="${locale}"[^>]* selected>`).test(html), `${locale}/${page} selected language`);
      const payload = html.match(/<script id="locale-messages"[^>]*>([\s\S]*?)<\/script>/);
      assert.ok(payload, `${locale}/${page} embedded control messages`);
      const messages = JSON.parse(payload[1]);
      assert.equal(typeof messages['toast.copyAll'], 'string');
      if (!page) assert.ok(html.includes(`<meta property="og:locale" content="${ogLocales[locale]}">`), `${locale} Open Graph locale`);
    }
  }
});

test('English and Portuguese pages contain no untranslated Chinese copy', async () => {
  for (const locale of ['en', 'pt-BR']) {
    for (const page of ['', 'privacy/']) {
      const html = await readFile(new URL(`${locale}/${page}index.html`, landing), 'utf8');
      // Native-language selector names are intentional. Runtime JSON is tested
      // separately through the localized messages and demo controls.
      const publicCopy = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<option\b[\s\S]*?<\/option>/gi, '');
      assert.doesNotMatch(publicCopy, /[\p{Script=Han}]/u, `${locale}/${page}`);
    }
  }
});
