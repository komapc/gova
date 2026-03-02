/**
 * install.js — PWA-instalo-administrado por Gova
 */

const Install = (() => {
  let deferredPrompt = null;

  /**
   * Kontrolas ĉu la aplikaĵo estas jam instalita.
   * @returns {boolean}
   */
  function isInstalled() {
    // Kontroli ĉu rulas en standalone-reĝimo
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // iOS Safari
    if (window.navigator.standalone === true) {
      return true;
    }

    return false;
  }

  /**
   * Kontrolas ĉu instalo estas disponebla.
   * @returns {boolean}
   */
  function canInstall() {
    return deferredPrompt !== null;
  }

  /**
   * Montras instalo-dialogon.
   * @returns {Promise<boolean>} - true se uzanto akceptis
   */
  async function prompt() {
    if (!deferredPrompt) {
      return false;
    }

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      deferredPrompt = null;
      return true;
    }

    return false;
  }

  /**
   * Inicializas instalo-administradon.
   * @param {Function} onInstallable - Callback kiam instalo eblas
   * @param {Function} onInstalled - Callback kiam instalita
   */
  function init(onInstallable, onInstalled) {
    // Kapti beforeinstallprompt-eventon
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      if (onInstallable) {
        onInstallable();
      }
    });

    // Kapti appinstalled-eventon
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      
      if (onInstalled) {
        onInstalled();
      }
    });

    // Kontroli ĉu jam instalita
    if (isInstalled() && onInstalled) {
      onInstalled();
    }
  }

  /**
   * Redonas instrukciojn por mana instalo (iOS).
   * @returns {string}
   */
  function getManualInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      return 'Tuŝu la "Dividi" butonon kaj elektu "Aldoni al Hejmekrano"';
    }

    return 'Uzu la menuon de via retumilo por instali ĉi tiun aplikaĵon';
  }

  return {
    isInstalled,
    canInstall,
    prompt,
    init,
    getManualInstructions
  };
})();
