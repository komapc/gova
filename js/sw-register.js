/**
 * sw-register.js — Service Worker registrado
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
      });
      console.log('[SW] Registrita:', reg.scope);

      // Sciigos la uzanton pri ĝisdatigo se nova versio disponeblas
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            console.log('[SW] Nova versio disponeblas');
            // Opcio: montri "ĝisdatigi" tiparon
          }
        });
      });
    } catch (err) {
      console.warn('[SW] Registrado malsukcesis:', err);
    }
  });
}
