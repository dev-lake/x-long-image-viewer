(() => {
  'use strict';
  const supported = ['zh-CN', 'en', 'ja', 'pt-BR'];
  const preferenceKey = 'x-image-viewer-language';
  const parts = location.pathname.split('/').filter(Boolean);
  const pathLocale = supported.find(locale => locale.toLowerCase() === parts[0]?.toLowerCase());
  const isHomeEntry = location.pathname === '/' || location.pathname === '/index.html';
  const isPrivacyEntry = ['/privacy', '/privacy/', '/privacy.html'].includes(location.pathname);
  let savedLocale;
  try { savedLocale = localStorage.getItem(preferenceKey); } catch { /* Browsing can continue without storage. */ }

  function matchLocale(tag) {
    const language = String(tag).toLowerCase().split(/[-_]/)[0];
    return { zh: 'zh-CN', en: 'en', ja: 'ja', pt: 'pt-BR' }[language];
  }

  let locale = pathLocale || (supported.includes(savedLocale) ? savedLocale : null)
    || (navigator.languages || [navigator.language]).map(matchLocale).find(Boolean) || 'en';

  function pagePath(language, page) {
    return `/${language}/${page === 'privacy' ? 'privacy/' : ''}`;
  }

  // Only legacy entry URLs redirect; unknown URLs keep their actual 404 response.
  if (!pathLocale && (isHomeEntry || isPrivacyEntry)) {
    const target = new URL(pagePath(locale, isPrivacyEntry ? 'privacy' : 'home'), location.origin);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
  }

  let messages = {};
  const ready = document.readyState === 'loading'
    ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
    : Promise.resolve();

  function t(key, parameters = {}) {
    let value = messages[key] || key;
    for (const [name, replacement] of Object.entries(parameters)) value = value.replaceAll(`{${name}}`, String(replacement));
    return value;
  }

  async function loadMessages(language) {
    const embedded = document.querySelector('#locale-messages');
    if (embedded?.dataset.locale === language) return JSON.parse(embedded.textContent);
    const response = await fetch(`/${language}/messages.json`);
    if (!response.ok) throw new Error('Language could not be loaded');
    return response.json();
  }

  function updateLinks() {
    document.querySelectorAll('[data-local-link]').forEach(link => {
      link.href = pagePath(locale, link.dataset.localLink);
    });
    document.querySelectorAll('.language-select').forEach(select => {
      select.value = locale;
      select.setAttribute('aria-label', t('language.label'));
    });
  }

  async function updateErrorPage(language) {
    messages = await loadMessages(language);
    locale = language;
    window.siteI18n.locale = locale;
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      if (element.dataset.i18n in messages) element.innerHTML = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(element => {
      for (const declaration of element.dataset.i18nAttr.split(';')) {
        const [attribute, key] = declaration.split(':');
        if (key in messages) element.setAttribute(attribute, t(key));
      }
    });
    updateLinks();
  }

  window.siteI18n = { locale, t, ready: ready.then(async () => {
    const isError = document.documentElement.dataset.page === 'error';
    if (isError) await updateErrorPage(locale);
    else { messages = await loadMessages(locale); updateLinks(); }
    document.querySelectorAll('.language-select').forEach(select => {
      select.addEventListener('change', async () => {
        const nextLocale = select.value;
        if (!supported.includes(nextLocale)) return;
        try { localStorage.setItem(preferenceKey, nextLocale); } catch { /* URL selection still works. */ }
        if (isError) {
          try { await updateErrorPage(nextLocale); }
          catch { select.value = locale; }
          return;
        }
        const target = new URL(pagePath(nextLocale, document.documentElement.dataset.page), location.origin);
        target.search = location.search;
        target.hash = location.hash;
        location.assign(target.href);
      });
    });
  }) };
})();
