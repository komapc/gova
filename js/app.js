/**
 * app.js — Ĉefa koordinado por Gova (Minimuma UI)
 */

(() => {
  'use strict';

  // --- DOM-Elementoj ---
  const elMain = document.getElementById('main');
  const elAltitude = document.getElementById('altitude-value');
  const elUnit = document.getElementById('altitude-unit');
  const elStatusIndicator = document.getElementById('status-indicator');
  const elBaseIndicator = document.getElementById('base-indicator');
  
  const elSettingsOverlay = document.getElementById('settings-overlay');
  const elSettingsSheet = document.getElementById('settings-sheet');
  const elStatusDot = document.getElementById('status-dot');
  const elStatusText = document.getElementById('status-text');
  const elAccuracyText = document.getElementById('accuracy-text');
  
  const elUnitM = document.getElementById('unit-m');
  const elUnitFt = document.getElementById('unit-ft');
  const elBtnSetBase = document.getElementById('btn-set-base');
  const elBtnClearBase = document.getElementById('btn-clear-base');
  const elBaseHeightInfo = document.getElementById('base-height-info');
  const elBtnCloseSettings = document.getElementById('btn-close-settings');
  
  const elToast = document.getElementById('toast');

  // --- Stato ---
  let currentUnit = Storage.getUnit();
  let isRefreshing = false;
  let touchStartTime = 0;
  let longPressTimer = null;
  const LONG_PRESS_DURATION = 500; // ms
  const DEBOUNCE_REFRESH = 2000; // ms
  let lastRefreshTime = 0;

  // --- BroadcastChannel por unuo-sinkronigo inter paĝoj ---
  let _channel = null;
  if ('BroadcastChannel' in window) {
    _channel = new BroadcastChannel('gova_settings');
    _channel.addEventListener('message', (ev) => {
      if (ev.data?.type === 'unit_change') {
        currentUnit = ev.data.unit;
        _refreshDisplayedValues();
      }
    });
  }

  // --- Ŝarĝi kaŝmemorajn valorojn tuj ---
  function _loadCachedValues() {
    const lastAlt = Storage.getLastAlt();
    if (lastAlt !== null) {
      _updateAltitudeDisplay(lastAlt, Storage.getLastAccuracy(), false);
    }
    _setStatus('searching');
  }

  // --- Ĝisdatigi montrata valorojn sen novaj GPS-datumoj ---
  function _refreshDisplayedValues() {
    const lastAlt = Storage.getLastAlt();
    if (lastAlt !== null) {
      _updateAltitudeDisplay(lastAlt, Storage.getLastAccuracy(), false);
    }
  }

  // --- Montri altecon ---
  function _updateAltitudeDisplay(meters, accuracyMeters, animate = true) {
    const baseHeight = Storage.getBaseHeight();
    const displayAlt = Units.getDisplayAltitude(meters, baseHeight);
    const isRelative = baseHeight !== null;
    
    const formatted = Units.formatAltitude(displayAlt, currentUnit, isRelative);

    if (animate) {
      elAltitude.classList.add('updating');
      setTimeout(() => elAltitude.classList.remove('updating'), 300);
    }

    elAltitude.textContent = formatted.prefix + formatted.value;
    elUnit.textContent = formatted.unit;
    
    // Montri/kaŝi bazan indikilón
    elBaseIndicator.classList.toggle('hidden', !isRelative);
    
    // Ĝisdatigi precizecon en agordoj
    if (accuracyMeters !== null) {
      const accStr = Units.formatAccuracy(accuracyMeters, currentUnit);
      elAccuracyText.textContent = `Precizeco: ${accStr}`;
    } else {
      elAccuracyText.textContent = '';
    }
    
    // Konservi en localStorage
    Storage.setLastAlt(meters);
    if (accuracyMeters !== null) Storage.setLastAccuracy(accuracyMeters);
  }

  // --- Agordi GPS-staton ---
  function _setStatus(state, text = '') {
    elStatusIndicator.dataset.state = state;
    elStatusDot.dataset.state = state;
    
    const statusTexts = {
      searching: 'Serĉas GPS...',
      locked: 'GPS ŝlosita',
      error: 'GPS-eraro',
    };
    
    elStatusText.textContent = text || statusTexts[state] || 'Nekonata stato';
  }

  // --- Montri toaston ---
  function _showToast(message, duration = 3000) {
    elToast.textContent = message;
    elToast.classList.remove('hidden');
    
    setTimeout(() => {
      elToast.classList.add('hidden');
    }, duration);
  }

  // --- GPS-Sukseso-Callback ---
  async function _onGpsSuccess(position, mslAlt) {
    const coords = position.coords;

    // Uzu MSL-altecon se disponebla, alie WGS84-elipsoido
    const altMeters = mslAlt !== null ? mslAlt : coords.altitude;
    const accuracy = coords.altitudeAccuracy;

    if (altMeters === null || altMeters === undefined) {
      _setStatus('searching', 'Atendas altec-datumon...');
      return;
    }

    // Ĝisdatigi montrado
    _updateAltitudeDisplay(altMeters, accuracy, true);
    _setStatus('locked', mslAlt !== null ? 'GPS + MSL-korekcio' : 'GPS ŝlosita');
  }

  // --- GPS-Eraro-Callback ---
  function _onGpsError(err) {
    const msg = GPS.getErrorMessage(err);
    _setStatus('error', 'GPS-eraro');
    _showToast(msg, 4000);

    // Se ni havas kaŝmemoritajn datumojn, daŭrigu montri ilin
    const lastAlt = Storage.getLastAlt();
    if (lastAlt !== null) {
      _setStatus('searching', 'Uzas lastan konatan altecon');
    }
  }

  // --- Mana Refreŝo ---
  async function _manualRefresh() {
    // Debounce: ne permesi tro oftajn refreŝojn
    const now = Date.now();
    if (now - lastRefreshTime < DEBOUNCE_REFRESH) {
      return;
    }
    lastRefreshTime = now;
    
    if (isRefreshing) return;
    isRefreshing = true;

    elMain.classList.add('refreshing');
    _setStatus('searching', 'Serĉas...');

    try {
      GPS.stopAutoRefresh();
      const pos = await GPS.getOnce();
      const coords = pos.coords;
      const mslAlt = await GPS.getMSLAltitude(coords.latitude, coords.longitude);
      await _onGpsSuccess(pos, mslAlt);
    } catch (err) {
      _onGpsError(err);
    } finally {
      isRefreshing = false;
      elMain.classList.remove('refreshing');
      // Restarigi aŭtomatan ĝisdatigon
      GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
    }
  }

  // --- Tuŝ/Muso-Eventoj por Tap/Long-Press ---
  function _handleTouchStart(e) {
    touchStartTime = Date.now();
    
    longPressTimer = setTimeout(() => {
      // Long press detektita - malfermi agordojn
      _openSettings();
      // Haptika reago se disponebla
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, LONG_PRESS_DURATION);
  }

  function _handleTouchEnd(e) {
    const touchDuration = Date.now() - touchStartTime;
    
    clearTimeout(longPressTimer);
    
    if (touchDuration < LONG_PRESS_DURATION) {
      // Mallonga tuŝo - refreŝi
      _manualRefresh();
    }
  }

  function _handleTouchMove(e) {
    // Nuligi long press se fingro moviĝas
    clearTimeout(longPressTimer);
  }

  // --- Agordoj-Administrado ---
  function _openSettings() {
    elSettingsOverlay.classList.remove('hidden');
    _updateSettingsUI();
    
    // Fokuso-kapto
    elBtnCloseSettings.focus();
  }

  function _closeSettings() {
    elSettingsOverlay.classList.add('hidden');
  }

  function _updateSettingsUI() {
    // Ĝisdatigi unuo-butonojn
    const isMeters = currentUnit === 'm';
    elUnitM.classList.toggle('active', isMeters);
    elUnitFt.classList.toggle('active', !isMeters);
    elUnitM.setAttribute('aria-pressed', isMeters);
    elUnitFt.setAttribute('aria-pressed', !isMeters);
    
    // Ĝisdatigi baza-alteco-informojn
    const baseHeight = Storage.getBaseHeight();
    const hasBase = baseHeight !== null;
    
    elBtnClearBase.disabled = !hasBase;
    
    if (hasBase) {
      const formatted = Units.formatAltitude(baseHeight, currentUnit, false);
      elBaseHeightInfo.textContent = `Bazo: ${formatted.value} ${formatted.unit}`;
    } else {
      elBaseHeightInfo.textContent = 'Neniu baza alteco agordita';
    }
  }

  // --- Unuo-Ŝanĝo ---
  function _changeUnit(newUnit) {
    if (newUnit === currentUnit) return;
    
    currentUnit = newUnit;
    Storage.setUnit(newUnit);
    _refreshDisplayedValues();
    _updateSettingsUI();
    
    // Dissendi ŝanĝon al aliaj paĝoj
    if (_channel) {
      _channel.postMessage({ type: 'unit_change', unit: newUnit });
    }
  }

  // --- Baza Alteco Kontroloj ---
  function _setBaseHeight() {
    const currentAlt = Storage.getLastAlt();
    if (currentAlt === null) {
      _showToast('Neniu GPS-datumo disponebla');
      return;
    }
    
    Storage.setBaseHeight(currentAlt);
    _updateSettingsUI();
    _refreshDisplayedValues();
    _showToast('Baza alteco agordita');
  }

  function _clearBaseHeight() {
    Storage.clearBaseHeight();
    _updateSettingsUI();
    _refreshDisplayedValues();
    _showToast('Baza alteco forigita');
  }

  // --- Paŭzi kiam kaŝita ---
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      GPS.stopAutoRefresh();
    } else {
      GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
    }
  });

  // --- Okazaĵ-Aŭskultiloj ---
  
  // Tuŝ-eventoj por ĉefa ekrano
  elMain.addEventListener('touchstart', _handleTouchStart, { passive: true });
  elMain.addEventListener('touchend', _handleTouchEnd, { passive: true });
  elMain.addEventListener('touchmove', _handleTouchMove, { passive: true });
  
  // Muso-eventoj por labortablo
  elMain.addEventListener('mousedown', _handleTouchStart);
  elMain.addEventListener('mouseup', _handleTouchEnd);
  
  // Preventi kuntekstan menuon
  elMain.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // Unuo-butonoj
  elUnitM.addEventListener('click', () => _changeUnit('m'));
  elUnitFt.addEventListener('click', () => _changeUnit('ft'));
  
  // Baza-alteco-butonoj
  elBtnSetBase.addEventListener('click', _setBaseHeight);
  elBtnClearBase.addEventListener('click', _clearBaseHeight);
  
  // Fermi agordojn
  elBtnCloseSettings.addEventListener('click', _closeSettings);
  
  // Fermi agordojn per klako ekster la folio
  elSettingsOverlay.addEventListener('click', (e) => {
    if (e.target === elSettingsOverlay) {
      _closeSettings();
    }
  });
  
  // Klavaro-alirebleco
  document.addEventListener('keydown', (e) => {
    // Escape fermas agordojn
    if (e.key === 'Escape' && !elSettingsOverlay.classList.contains('hidden')) {
      _closeSettings();
    }
    
    // 's' malfermas agordojn
    if (e.key === 's' && elSettingsOverlay.classList.contains('hidden')) {
      _openSettings();
    }
    
    // Space refreŝas
    if (e.key === ' ' && elSettingsOverlay.classList.contains('hidden')) {
      e.preventDefault();
      _manualRefresh();
    }
  });

  // --- Inicializado ---
  function init() {
    _loadCachedValues();

    if (!GPS.isAvailable()) {
      _setStatus('error', 'GPS ne disponebla');
      _showToast('Via aparato aŭ retumilo ne subtenas GPS', 6000);
      return;
    }

    GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
  }

  init();
})();
