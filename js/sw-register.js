/**
 * sw-register.js — Service Worker registrado kun aŭtomata ĝisdatigo
 *
 * Antaŭe la cache-unua SW povis "fiksi" malnovan version ĝis la uzanto mane
 * vakigis la kaŝmemoron. Nun la app mem kontrolas novan version (ĉe ŝargo kaj
 * ĉe re-fokuso) kaj, kiam nova SW ekregas, reŝargas sin unufoje sur ĝin.
 */

if ('serviceWorker' in navigator) {
  let refreshing = false;

  // Kiam nova SW ekregas la paĝon, reŝargu unufoje por ruli la novan kodon.
  // (sw.js vokas skipWaiting()+clients.claim(), do tio okazas tuj post instalo.)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none', // ĉiam prenu freŝan sw.js, ignoru HTTP-kaŝmemoron
      });
      console.log('[SW] Registrita:', reg.scope);

      // Kontrolu novan version tuj, kaj ĉiufoje kiam la app revenas al fokuso.
      const checkForUpdate = () => { reg.update().catch(() => {}); };
      checkForUpdate();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
      // Ankaŭ periode (ekz. se la app restas malfermita longe).
      setInterval(checkForUpdate, 60 * 60 * 1000);
    } catch (err) {
      console.warn('[SW] Registrado malsukcesis:', err);
    }
  });
}
