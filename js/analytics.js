/**
 * analytics.js — Privacy-aware Google Analytics loader.
 *
 * Defaults to OFF. Loads gtag only if the user has explicitly opted in
 * via the settings toggle, and never when the browser advertises
 * Do-Not-Track.
 */

const Analytics = (() => {
  const KEY = 'gova_analytics_consent'; // '1' = opted in, anything else = off
  const GA_ID = 'G-E1VVXHTP77';
  let _loaded = false;

  function dntEnabled() {
    const v = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return v === '1' || v === 'yes';
  }

  function consented() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  }

  function _load() {
    if (_loaded) return;
    if (dntEnabled()) return;
    _loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  }

  function setConsent(on) {
    try {
      if (on) localStorage.setItem(KEY, '1');
      else localStorage.removeItem(KEY);
    } catch {}
    if (on && !dntEnabled()) _load();
  }

  function init() {
    if (consented()) _load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    consented,
    setConsent,
    dntEnabled,
  };
})();
