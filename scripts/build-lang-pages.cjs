#!/usr/bin/env node
/**
 * build-lang-pages.cjs — generas la lingvajn ĉef-paĝojn de Gova.
 *
 *   /        (index.html)     — angla, x-default
 *   /ru/     (ru/index.html)  — rusa
 *   /eo/     (eo/index.html)  — Esperanto
 *
 * index.html estas la ŝablono: la app-ŝelo (korpo, skriptoj) estas redaktata
 * nur tie. Ĉi tiu skripto anstataŭigas la blokojn inter
 * <!-- lang-head --> / <!-- /lang-head --> kaj <!-- lang-intro --> /
 * <!-- /lang-intro -->, plenigas la statikajn [data-i18n]-tekstojn el
 * js/i18n.js kaj skribas la tri paĝojn. La sub-paĝoj ricevas <base href="/">
 * por ke ĉiuj relativaj vojoj (css/, js/, sw.js, about.html…) restu ĉe la radiko.
 *
 *   node scripts/build-lang-pages.cjs          # skribi
 *   node scripts/build-lang-pages.cjs --check  # nur kontroli (npm test)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://gova.lipu.dev';

const PAGES = {
  en: {
    file: 'index.html',
    url: `${SITE}/`,
    ogLocale: 'en_US',
    preset: false,
    title: 'What Is My Altitude? Free GPS &amp; Barometer Altimeter — Gova',
    description: 'Gova is the cleanest, most minimalist altimeter app: your altitude above sea level as one big number, from GPS and barometer. Free, no ads, works offline.',
    ogTitle: 'What Is My Altitude? Gova — the cleanest, minimalist GPS altimeter',
    ogImageAlt: 'Gova — GPS &amp; barometric altimeter. No ads, no tracking, works offline.',
    ldDescription: 'The cleanest, most minimalist GPS altimeter — no ads, no tracking, no accounts, no servers. Free, open-source, works offline. Altitude above sea level via GPS, EGM96 geoid (MSL), barometer and SRTM terrain.',
    keywords: 'altimeter app, GPS altitude, barometric altimeter, elevation tracker, online altimeter, free altimeter, PWA altimeter, SRTM elevation, MSL altitude, altitude monitor, web altimeter, gova, precise altimeter, altitude tracker',
  },
  ru: {
    file: 'ru/index.html',
    url: `${SITE}/ru/`,
    ogLocale: 'ru_RU',
    preset: true,
    title: 'Высота над уровнем моря сейчас — простой высотомер | Gova',
    description: 'Gova — самый простой и чистый высотомер онлайн: ваша высота над уровнем моря одной большой цифрой, по GPS и барометру. Бесплатно, без рекламы, работает офлайн.',
    ogTitle: 'Высота над уровнем моря сейчас — Gova, самый простой высотомер онлайн',
    ogImageAlt: 'Gova — высотомер по GPS и барометру. Без рекламы и слежки, работает офлайн.',
    ldDescription: 'Самый простой и чистый высотомер: без рекламы, слежки, аккаунтов и серверов. Бесплатный, с открытым кодом, работает офлайн. Высота над уровнем моря по GPS с поправкой на геоид EGM96, барометру и рельефу SRTM.',
  },
  eo: {
    file: 'eo/index.html',
    url: `${SITE}/eo/`,
    ogLocale: 'eo',
    preset: true,
    title: 'Gova — Alteco-Monitorilo: GPS- kaj barometra altimetro',
    description: 'Gova: la plej simpla kaj pura altimetro — senpaga kaj preciza, per GPS, barometro, EGM96-geoido kaj SRTM-tereno; funkcias senrete.',
    ogTitle: 'Gova — Alteco-Monitorilo · la plej simpla altimetro',
    ogImageAlt: 'Gova — GPS- kaj barometra altimetro. Sen reklamoj, sen spurado, funkcias senrete.',
    ldDescription: 'La plej simpla kaj pura GPS-altimetro — sen reklamoj, sen spurado, sen kontoj, sen serviloj. Senpaga, malfermkoda, funkcias senrete. Alteco per GPS, EGM96-geoido (marnivelo), barometro kaj SRTM-tereno.',
  },
};

const LANG_LINKS = [
  ['en', '/', 'English'],
  ['ru', '/ru/', 'Русский'],
  ['eo', '/eo/', 'Esperanto'],
];

function loadStrings() {
  const code = fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf-8');
  const ctx = vm.createContext({});
  return vm.runInContext(`${code}\n;I18n.STRINGS`, ctx, { filename: 'js/i18n.js' });
}

const escText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => escText(s).replace(/"/g, '&quot;');

function headBlock(lang) {
  const p = PAGES[lang];
  const alternates = LANG_LINKS.map(([l, href]) =>
    `  <link rel="alternate" hreflang="${l}" href="${SITE}${href}" />`).join('\n');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Gova',
    url: p.url,
    image: `${SITE}/icons/icon-512.png`,
    operatingSystem: 'Web, Android, iOS',
    applicationCategory: 'UtilitiesApplication',
    description: p.ldDescription,
    inLanguage: lang,
    isAccessibleForFree: true,
    featureList: [
      'GPS altitude (WGS84)',
      'Mean-sea-level altitude via EGM96 geoid correction',
      'Barometric altitude',
      'Online terrain elevation (SRTM)',
      'Works fully offline',
      'No ads, no tracking, no accounts',
    ],
    author: { '@type': 'Person', name: 'komapc', url: 'https://github.com/komapc' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  const ldJson = JSON.stringify(ld, null, 2).replace(/\n/g, '\n  ');
  return [
    '<!-- lang-head -->',
    `  <link rel="canonical" href="${p.url}" />`,
    alternates,
    `  <link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
    '',
    '  <!-- Social Media Preview (Open Graph / WhatsApp) -->',
    `  <meta property="og:title" content="${p.ogTitle}" />`,
    `  <meta property="og:description" content="${p.description}" />`,
    `  <meta property="og:image" content="${SITE}/icons/og-image.png" />`,
    '  <meta property="og:image:width" content="1200" />',
    '  <meta property="og:image:height" content="630" />',
    `  <meta property="og:image:alt" content="${p.ogImageAlt}" />`,
    `  <meta property="og:url" content="${p.url}" />`,
    '  <meta property="og:type" content="website" />',
    '  <meta property="og:site_name" content="Gova" />',
    `  <meta property="og:locale" content="${p.ogLocale}" />`,
    '',
    '  <!-- Twitter Card -->',
    '  <meta name="twitter:card" content="summary_large_image" />',
    `  <meta name="twitter:title" content="${p.ogTitle}" />`,
    `  <meta name="twitter:description" content="${p.description}" />`,
    `  <meta name="twitter:image" content="${SITE}/icons/og-image.png" />`,
    '',
    `  <meta name="description" content="${p.description}" />`,
    ...(p.keywords ? [`  <meta name="keywords" content="${p.keywords}" />`] : []),
    `  <title>${p.title}</title>`,
    '',
    '  <!-- Structured Data (JSON-LD) -->',
    '  <script type="application/ld+json">',
    `  ${ldJson}`,
    '  </script>',
    '  <!-- /lang-head -->',
  ].join('\n');
}

function introBlock(lang, S) {
  const t = (k) => escText(S[lang][k] || S.en[k]);
  const langLinks = LANG_LINKS.map(([l, href, name]) =>
    `      <a href="${href}" hreflang="${l}" lang="${l}" data-set-lang="${l}"${l === lang ? ' aria-current="page"' : ''}>${name}</a>`).join('\n');
  return [
    '<!-- lang-intro -->',
    '  <header class="app-intro">',
    `    <h1 class="app-intro-title" data-i18n="introTitle">${t('introTitle')}</h1>`,
    `    <p class="app-intro-text" data-i18n="introLede">${t('introLede')}</p>`,
    '    <nav class="app-intro-links" aria-label="Gova">',
    `      <a href="about.html" data-i18n="about">${t('about')}</a>`,
    `      <a href="history.html" data-i18n="history">${t('history')}</a>`,
    `      <a href="points.html" data-i18n="points">${t('points')}</a>`,
    `      <a href="privacy.html" data-i18n="privacy">${t('privacy')}</a>`,
    '    </nav>',
    '    <nav class="app-intro-links" aria-label="Language / Язык / Lingvo">',
    langLinks,
    '    </nav>',
    '  </header>',
    '  <!-- /lang-intro -->',
  ].join('\n');
}

function replaceBlock(html, name, block) {
  const re = new RegExp(`<!-- ${name} -->[\\s\\S]*?<!-- /${name} -->`);
  if (!re.test(html)) throw new Error(`index.html: marker <!-- ${name} --> not found`);
  return html.replace(re, () => block);
}

function render(template, lang, S) {
  const p = PAGES[lang];
  const str = (k) => S[lang][k] || S.en[k];
  let html = template;

  // <html lang>: sub-paĝoj deklaras sian UI-lingvon (vidu I18n.init)
  html = html.replace(/<html\b[^>]*>/, p.preset
    ? `<html lang="${lang}" data-ui-lang="${lang}">`
    : `<html lang="${lang}">`);

  // <base href="/"> nur por la sub-paĝoj
  html = html.replace(/\n {2}<base href="\/" \/>/, '');
  if (p.preset) html = html.replace(/(<meta charset="UTF-8" \/>)/, '$1\n  <base href="/" />');

  html = replaceBlock(html, 'lang-head', headBlock(lang));
  html = replaceBlock(html, 'lang-intro', introBlock(lang, S));

  // Statikaj tekstoj = tradukoj, por ke la paĝo legiĝu same sen JavaScript
  html = html.replace(/(<(\w+)\b[^>]*\sdata-i18n="(\w+)"[^>]*>)([^<]*)(<\/\2>)/g,
    (m, open, tag, key, text, close) => {
      const v = str(key);
      if (!v) return m;
      const lead = text.match(/^\s*/)[0];
      const trail = text.match(/\s*$/)[0];
      return open + lead + escText(v) + trail + close;
    });
  html = html.replace(/(<[^>]*\sdata-i18n-aria="(\w+)"[^>]*>)/g, (tag, _t, key) => {
    const v = str(key);
    return v ? tag.replace(/aria-label="[^"]*"/, `aria-label="${escAttr(v)}"`) : tag;
  });

  // Aktiva lingvo-butono
  html = html.replace(/<button class="lang-btn( active)?" data-lang="(\w+)">/g,
    (m, _a, l) => `<button class="lang-btn${l === lang ? ' active' : ''}" data-lang="${l}">`);
  return html;
}

function build() {
  const S = loadStrings();
  const template = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
  const out = {};
  for (const lang of Object.keys(PAGES)) out[PAGES[lang].file] = render(template, lang, S);
  return out;
}

function check() {
  const stale = [];
  for (const [file, html] of Object.entries(build())) {
    const p = path.join(ROOT, file);
    if (!fs.existsSync(p) || fs.readFileSync(p, 'utf-8') !== html) stale.push(file);
  }
  return stale;
}

module.exports = { build, check, PAGES };

if (require.main === module) {
  if (process.argv.includes('--check')) {
    const stale = check();
    if (stale.length) {
      console.error(`Stale language pages: ${stale.join(', ')} — run: npm run build:lang`);
      process.exit(1);
    }
    console.log('Language pages up to date.');
  } else {
    for (const [file, html] of Object.entries(build())) {
      fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
      fs.writeFileSync(path.join(ROOT, file), html);
      console.log(`wrote ${file}`);
    }
  }
}
