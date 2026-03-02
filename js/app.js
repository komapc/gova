/**
 * app.js — Ĉefa koordinado por Gova
 */

(() => {
  'use strict';

  // --- DOM-Elementoj ---
  const elAltitude = document.getElementById('altitude-value');
  const elUnit = document.getElementById('altitude-unit');
  const elAccuracy = document.getElementById('accuracy-label');
  const elLocationName = document.getElementById('location-name');
  const elLastUpdate = document.getElementById('last-update');
  const elGpsStatus = document.getElementById('gps-status');
  const elStatusText = document.getElementById('status-text');
  const elRefreshBtn = document.getElementById('btn-refresh');
  const elErrorMsg = document.getElementById('error-message');
  const elOfflineBanner = document.getElementById('offline-banner');

  // --- Stato ---
  let currentUnit = Storage.getUnit();
  let isRefreshing = false;

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
    const lastAcc = Storage.getLastAccuracy();
    const lastLoc = Storage.getLastLocation();

    if (lastAlt !== null) {
      _updateAltitudeDisplay(lastAlt, lastAcc, false);
    }
    if (lastLoc) {
      elLocationName.textContent = lastLoc;
    }
    _setStatus('searching', 'Serĉas GPS...');
  }

  // --- Ĝisdatigi montrata valorojn sen novaj GPS-datumoj ---
  function _refreshDisplayedValues() {
    const lastAlt = Storage.getLastAlt();
    const lastAcc = Storage.getLastAccuracy();
    if (lastAlt !== null) {
      _updateAltitudeDisplay(lastAlt, lastAcc, false);
    }
    elUnit.textContent = Units.getUnitLabel(currentUnit);
  }

  // --- Montri altecon ---
  function _updateAltitudeDisplay(meters, accuracyMeters, animate = true) {
    const { value, unit } = Units.formatAltitude(meters, currentUnit);
    const accStr = Units.formatAccuracy(accuracyMeters, currentUnit);

    if (animate) {
      elAltitude.classList.add('updating');
      setTimeout(() => elAltitude.classList.remove('updating'), 300);
    }

    elAltitude.textContent = value;
    elUnit.textContent = unit;
    elAccuracy.textContent = accStr ? `precizeco ${accStr}` : '';
  }

  // --- Agordi GPS-staton ---
  function _setStatus(state, text) {
    elGpsStatus.dataset.state = state;
    elStatusText.textContent = text;
  }

  // --- Montri eraron ---
  function _showError(msg) {
    elErrorMsg.textContent = msg;
    elErrorMsg.classList.add('visible');
    setTimeout(() => elErrorMsg.classList.remove('visible'), 6000);
  }

  // --- Formati horon ---
  function _formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

    // Konservi en localStorage
    Storage.setLastAlt(altMeters);
    if (accuracy !== null) Storage.setLastAccuracy(accuracy);

    // Ĝisdatigi montrado
    _updateAltitudeDisplay(altMeters, accuracy, true);
    _setStatus('locked', mslAlt !== null ? 'GPS + MSL-korekcio' : 'GPS ŝlosita');
    elLastUpdate.textContent = `ĝisdatigita ${_formatTime(new Date())}`;

    elErrorMsg.classList.remove('visible');

    // Akiri loknomon (senbloka)
    const lat = coords.latitude;
    const lon = coords.longitude;
    LocationName.getName(lat, lon).then((name) => {
      if (name) {
        elLocationName.textContent = name;
        Storage.setLastLocation(name);
      }
    });
  }

  // --- GPS-Eraro-Callback ---
  function _onGpsError(err) {
    const msg = GPS.getErrorMessage(err);
    _setStatus('error', 'GPS-eraro');
    _showError(msg);

    // Se ni havas kaŝmemoritajn datumojn, daŭrigu montri ilin
    const lastAlt = Storage.getLastAlt();
    if (lastAlt !== null) {
      _setStatus('searching', 'Uzas lastan konatan altecon');
    }
  }

  // --- Mana Refreŝo ---
  async function _manualRefresh() {
    if (isRefreshing) return;
    isRefreshing = true;

    elRefreshBtn.disabled = true;
    elRefreshBtn.classList.add('spinning');
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
      elRefreshBtn.disabled = false;
      elRefreshBtn.classList.remove('spinning');
      // Restarigi aŭtomatan ĝisdatigon
      GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
    }
  }

  // --- Paŭzi kiam kaŝita ---
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      GPS.stopAutoRefresh();
    } else {
      GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
    }
  });

  // --- Ofline/Rete-Eventoj ---
  function _updateOnlineStatus() {
    if (!navigator.onLine) {
      elOfflineBanner.classList.add('visible');
    } else {
      elOfflineBanner.classList.remove('visible');
      LocationName.clearCache();
    }
  }

  window.addEventListener('online', _updateOnlineStatus);
  window.addEventListener('offline', _updateOnlineStatus);

  // --- Okazaĵ-Aŭskultiloj ---
  elRefreshBtn.addEventListener('click', _manualRefresh);

  // --- Inicializado ---
  function init() {
    _updateOnlineStatus();
    _loadCachedValues();

    if (!GPS.isAvailable()) {
      _setStatus('error', 'GPS ne disponebla');
      _showError('Via aparato aŭ retumilo ne subtenas GPS');
      return;
    }

    GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
  }

  init();
})();
