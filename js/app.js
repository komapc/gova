/**
 * app.js — Ĉefa koordinado por Gova (Minimuma UI kun Swipe)
 */

(() => {
  'use strict';

  // --- DOM-Elementoj ---
  const elMain = document.getElementById('main');
  const elScreensContainer = document.getElementById('screens-container');
  const elDots = document.querySelectorAll('.dot');
  
  // Ĉefaj altecoj sur ambaŭ ekranoj
  const elAltMin = document.getElementById('alt-val-min');
  const elAltInf = document.getElementById('alt-val-inf');
  const elAltUnits = document.querySelectorAll('.altitude-unit');
  
  const elStatusIndicator = document.getElementById('status-indicator');
  const elBaseIndicator = document.getElementById('base-indicator');
  const elPullIndicator = document.getElementById('pull-indicator');
  
  const elSettingsOverlay = document.getElementById('settings-overlay');
  const elStatusDot = document.getElementById('status-dot');
  const elStatusText = document.getElementById('status-text');
  const elAccuracyText = document.getElementById('accuracy-text');
  
  const elUnitM = document.getElementById('unit-m');
  const elUnitFt = document.getElementById('unit-ft');
  const elBtnSetBase = document.getElementById('btn-set-base');
  const elBtnClearBase = document.getElementById('btn-clear-base');
  const elBaseHeightInfo = document.getElementById('base-height-info');
  const elBtnCloseSettings = document.getElementById('btn-close-settings');
  
  const elBtnViewHistory = document.getElementById('btn-view-history');
  const elBtnSavePoint = document.getElementById('btn-save-point');
  const elBtnViewPoints = document.getElementById('btn-view-points');
  const elPointsCount = document.getElementById('points-count');
  const elTodayHighPoint = document.getElementById('today-high-point');
  const elTodayLowPoint = document.getElementById('today-low-point');
  const elInstallSection = document.getElementById('install-section');
  const elBtnInstall = document.getElementById('btn-install');
  
  const elToast = document.getElementById('toast');
  
  // Detala krado
  const elValGps = document.querySelector('.val-gps');
  const elValAcc = document.querySelector('.val-acc');
  const elValMsl = document.querySelector('.val-msl');
  const elValAgl = document.querySelector('.val-agl');
  const elValBaro = document.querySelector('.val-baro');
  const elValSign = document.querySelector('.val-sign');
  const elItemBaro = document.querySelector('.item-baro');

  // --- Stato ---
  let currentUnit = Storage.getUnit();
  let currentScreen = 0; 
  let isRefreshing = false;
  
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isPulling = false;
  let isSwiping = false;
  let isMouseDown = false;

  let longPressTimer = null;
  const LONG_PRESS_DURATION = 500;
  const DEBOUNCE_REFRESH = 2000;
  const PULL_THRESHOLD = 80;
  const SWIPE_THRESHOLD = 50;
  let lastRefreshTime = 0;
  let lastGpsAlt = null;
  let lastMslAlt = null;
  let lastBaroAlt = null;
  let lastAccuracy = null;
  let wakeLock = null;
  let smoothedAlt = null;
  const SMOOTHING_FACTOR = 0.3;

  async function _requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      _requestWakeLock();
    }
  });

  // --- Sinkronigo inter paĝoj ---
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('gova_settings');
    channel.onmessage = (ev) => {
      if (ev.data?.type === 'unit_change') {
        currentUnit = ev.data.unit;
        _refreshDisplayedValues();
      }
    };
  }

  // --- Ŝarĝi kaŝmemoron ---
  function _loadCachedValues() {
    const lastAlt = Storage.getLastAlt();
    if (lastAlt !== null) {
      _updateAltitudeDisplay(lastAlt, Storage.getLastAccuracy(), false);
    }
    _setStatus('searching');
  }

  function _refreshDisplayedValues() {
    const lastAlt = Storage.getLastAlt() || lastGpsAlt;
    if (lastAlt !== null) {
      _updateAltitudeDisplay(lastAlt, lastAccuracy || Storage.getLastAccuracy(), false);
    }
  }

  // --- Montri altecon ---
  function _updateAltitudeDisplay(meters, accuracyMeters, animate = true) {
      const baseHeight = Storage.getBaseHeight();
      const rawAlt = lastBaroAlt ?? lastMslAlt ?? meters;

      if (rawAlt === null) return;

      // Glatigo (Smoothing)
      if (smoothedAlt === null || !animate) {
        smoothedAlt = rawAlt;
      } else {
        smoothedAlt = smoothedAlt + SMOOTHING_FACTOR * (rawAlt - smoothedAlt);
      }

      const currentAlt = smoothedAlt;
      const displayAlt = Units.getDisplayAltitude(currentAlt, baseHeight);
    const isRelative = baseHeight !== null;
    const formatted = Units.formatAltitude(displayAlt, currentUnit, isRelative);
    const mslFormatted = Units.formatAltitude(currentAlt, currentUnit, false);

    // Ĝisdatigi ĉefajn numerojn
    if (elAltMin) {
      if (animate) {
        elAltMin.classList.add('updating');
        setTimeout(() => elAltMin.classList.remove('updating'), 300);
      }
      elAltMin.textContent = mslFormatted.value;
    }

    if (elAltInf) {
      if (animate) {
        elAltInf.classList.add('updating');
        setTimeout(() => elAltInf.classList.remove('updating'), 300);
      }
      elAltInf.textContent = formatted.prefix + formatted.value;
    }

    if (elValSign && accuracyMeters !== null) {
      let quality = '—';
      if (accuracyMeters < 5) quality = '⭐⭐⭐⭐⭐';
      else if (accuracyMeters < 10) quality = '⭐⭐⭐⭐';
      else if (accuracyMeters < 25) quality = '⭐⭐⭐';
      else if (accuracyMeters < 50) quality = '⭐⭐';
      else quality = '⭐';
      elValSign.textContent = quality;
    }

    elAltUnits.forEach(el => {
      if (el) el.textContent = formatted.unit;
    });
    
    // Ĝisdatigi detalan kradon
    if (elValGps && meters !== null) {
      const gpsFmt = Units.formatAltitude(meters, currentUnit, false);
      elValGps.textContent = `${gpsFmt.value} ${gpsFmt.unit}`;
    }

    if (elValMsl && lastMslAlt !== null) {
      const mslFmt = Units.formatAltitude(lastMslAlt, currentUnit, false);
      const src = GPS.getLastMSLSource ? GPS.getLastMSLSource() : '';
      const srcLabel = src ? ` (${src})` : '';
      elValMsl.textContent = `${mslFmt.value} ${mslFmt.unit}${srcLabel}`;
    }

    if (elValAgl && lastGpsAlt !== null && lastMslAlt !== null) {
      const aglAlt = Math.max(0, lastGpsAlt - lastMslAlt);
      const aglFmt = Units.formatAltitude(aglAlt, currentUnit, false);
      elValAgl.textContent = `${aglFmt.value} ${aglFmt.unit}`;
    }

    if (elValBaro && lastBaroAlt !== null) {
      const baroFmt = Units.formatAltitude(lastBaroAlt, currentUnit, false);
      elValBaro.textContent = `${baroFmt.value} ${baroFmt.unit}`;
      if (elItemBaro) elItemBaro.classList.remove('hidden');
    }
    
    if (elBaseIndicator) elBaseIndicator.classList.toggle('hidden', !isRelative);
    
    if (accuracyMeters !== null) {
      const accStr = Units.formatAccuracy(accuracyMeters, currentUnit);
      if (elAccuracyText) elAccuracyText.textContent = `Precizeco: ${accStr}`;
      if (elValAcc) elValAcc.textContent = accStr;
    }
    
    Storage.setLastAlt(meters);
    if (accuracyMeters !== null) Storage.setLastAccuracy(accuracyMeters);
  }

  function _setStatus(state, text = '') {
    if (elStatusIndicator) elStatusIndicator.dataset.state = state;
    if (elStatusDot) elStatusDot.dataset.state = state;
    
    const statusTexts = { 
      searching: I18n.get('searching'), 
      locked: I18n.get('locked'), 
      error: I18n.get('error') 
    };
    if (elStatusText) elStatusText.textContent = text || statusTexts[state] || '???';
  }

  function _showToast(message) {
    if (!elToast) return;
    elToast.textContent = message;
    elToast.classList.remove('hidden');
    setTimeout(() => elToast.classList.add('hidden'), 3000);
  }

  // --- GPS-Sukceso ---
  async function _onGpsSuccess(position, mslAlt, baroAlt) {
    const coords = position.coords;
    lastGpsAlt = coords.altitude;
    lastMslAlt = mslAlt;
    lastBaroAlt = baroAlt || lastBaroAlt;
    lastAccuracy = coords.altitudeAccuracy;

    if (lastGpsAlt === null && lastMslAlt === null && lastBaroAlt === null) return;

    _updateAltitudeDisplay(lastGpsAlt, lastAccuracy, true);
    _setStatus('locked', lastMslAlt !== null ? `${I18n.get('locked')} + MSL` : I18n.get('locked'));

    const finalAlt = lastBaroAlt ?? lastMslAlt ?? lastGpsAlt;
    History.add(finalAlt, lastAccuracy || 0, coords.latitude, coords.longitude);
    SavedPoints.updateTodayPoints(finalAlt, coords.latitude, coords.longitude);
  }

  function _onBaroUpdate(alt) {
    lastBaroAlt = alt;
    _updateAltitudeDisplay(lastGpsAlt, lastAccuracy, false);
  }

  function _onGpsError(err) {
    const msg = GPS.getErrorMessage(err);
    _setStatus('error', I18n.get('error'));
    _showToast(msg);
  }

  async function _manualRefresh() {
    const now = Date.now();
    if (now - lastRefreshTime < DEBOUNCE_REFRESH || isRefreshing) return;
    lastRefreshTime = now;
    isRefreshing = true;

    if (elMain) elMain.classList.add('refreshing');
    _setStatus('searching', I18n.get('searching'));

    try {
      GPS.stopAutoRefresh();
      const pos = await GPS.getOnce();
      const mslAlt = await GPS.getMSLAltitude(pos.coords.latitude, pos.coords.longitude);
      await _onGpsSuccess(pos, mslAlt, null);
    } catch (err) {
      _onGpsError(err);
    } finally {
      isRefreshing = false;
      if (elMain) elMain.classList.remove('refreshing');
      GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
    }
  }

  // --- Gesta Administrado ---
  function _handleTouchStart(e) {
    if (!e.touches) {
      isMouseDown = true;
    }
    touchStartX = e.touches ? e.touches[0].clientX : e.clientX;
    touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
    touchStartTime = Date.now();
    isPulling = false;
    isSwiping = false;
    
    longPressTimer = setTimeout(() => {
      if (!isSwiping && !isPulling) {
        _openSettings();
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }, LONG_PRESS_DURATION);
  }

  function _handleTouchMove(e) {
    if (!e.touches && !isMouseDown) return;
    
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = currentX - touchStartX;
    const deltaY = currentY - touchStartY;

    if (!isPulling && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
      isSwiping = true;
      clearTimeout(longPressTimer);
    }

    if (!isSwiping && elSettingsOverlay && elSettingsOverlay.classList.contains('hidden') && !isRefreshing) {
      if (deltaY > 10 && touchStartY < 100) {
        isPulling = true;
        clearTimeout(longPressTimer);
        if (elPullIndicator) {
          elPullIndicator.classList.remove('hidden');
          elPullIndicator.classList.add('visible');
          elPullIndicator.classList.toggle('pulling', deltaY >= PULL_THRESHOLD);
        }
      }
    }
  }

  function _handleTouchEnd(e) {
    if (!e.changedTouches) isMouseDown = false;
    const touchDuration = Date.now() - touchStartTime;
    const currentX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = currentX - touchStartX;
    
    clearTimeout(longPressTimer);
    
    if (isPulling) {
      const currentY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      if (currentY - touchStartY >= PULL_THRESHOLD) _triggerPullRefresh();
      else _hidePullIndicator();
      isPulling = false;
      return;
    }

    if (isSwiping) {
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        _setScreen(deltaX > 0 ? 0 : 1);
      }
      isSwiping = false;
      return;
    }
    
    if (touchDuration < LONG_PRESS_DURATION) _manualRefresh();
  }

  function _setScreen(index) {
    currentScreen = index;
    if (elScreensContainer) elScreensContainer.dataset.currentScreen = currentScreen;
    elDots.forEach((dot, i) => dot.classList.toggle('active', i === currentScreen));
  }

  function _triggerPullRefresh() {
    if (elPullIndicator) {
      elPullIndicator.classList.add('refreshing');
      elPullIndicator.classList.remove('pulling');
    }
    _manualRefresh().finally(() => setTimeout(_hidePullIndicator, 500));
  }

  function _hidePullIndicator() {
    if (elPullIndicator) {
      elPullIndicator.classList.remove('visible', 'pulling', 'refreshing');
      setTimeout(() => elPullIndicator.classList.add('hidden'), 300);
    }
  }

  // --- Agordoj ---
  function _openSettings() {
    if (elSettingsOverlay) elSettingsOverlay.classList.remove('hidden');
    _updateSettingsUI();
    if (elBtnCloseSettings) elBtnCloseSettings.focus();
  }

  function _closeSettings() {
    if (elSettingsOverlay) elSettingsOverlay.classList.add('hidden');
  }

  function _updateSettingsUI() {
    if (elUnitM) elUnitM.classList.toggle('active', currentUnit === 'm');
    if (elUnitFt) elUnitFt.classList.toggle('active', currentUnit === 'ft');
    
    const baseHeight = Storage.getBaseHeight();
    if (elBtnClearBase) elBtnClearBase.disabled = baseHeight === null;
    if (elBaseHeightInfo) {
      if (baseHeight !== null) {
        const fmt = Units.formatAltitude(baseHeight, currentUnit, false);
        elBaseHeightInfo.textContent = `${I18n.get('hasBase')}${fmt.value} ${fmt.unit}`;
      } else {
        elBaseHeightInfo.textContent = I18n.get('noBase');
      }
    }
    _updateSavedPointsUI();
  }
  
  function _updateSavedPointsUI() {
    const summary = SavedPoints.getSummary();
    if (elPointsCount) elPointsCount.textContent = summary.count;
    
    [ {el: elTodayHighPoint, p: summary.todayHigh}, {el: elTodayLowPoint, p: summary.todayLow} ].forEach(item => {
      if (!item.el) return;
      const valEl = item.el.querySelector('.point-value');
      if (!valEl) return;
      if (item.p) {
        const fmt = Units.formatAltitude(item.p.altitude, currentUnit, false);
        const time = new Date(item.p.timestamp).toLocaleTimeString('eo', { hour: '2-digit', minute: '2-digit' });
        valEl.textContent = `${fmt.value} ${fmt.unit} (${time})`;
      } else {
        valEl.textContent = '—';
      }
    });
  }

  function _initApp() {
    try {
      I18n.init(); // Detekti lingvon kaj ĝisdatigi UI
      _loadCachedValues();
      Theme.init();
      
      // Instalo-administrado
      Install.init(
        () => { if (elInstallSection) elInstallSection.classList.remove('hidden'); },
        () => { if (elInstallSection) elInstallSection.classList.add('hidden'); }
      );

      if (GPS.isAvailable()) {
        GPS.startBarometer(_onBaroUpdate);
        GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
      }
      _requestWakeLock();
    } catch (e) {
      console.error('Eraro dum inicializado:', e);
    }
  }

  // --- Eventoj ---
  if (elMain) {
    elMain.addEventListener('touchstart', _handleTouchStart, { passive: true });
    elMain.addEventListener('touchend', _handleTouchEnd, { passive: true });
    elMain.addEventListener('touchmove', _handleTouchMove, { passive: true });
    elMain.addEventListener('mousedown', _handleTouchStart);
    elMain.addEventListener('mousemove', _handleTouchMove);
    elMain.addEventListener('mouseup', _handleTouchEnd);
    elMain.addEventListener('mouseleave', _handleTouchEnd);
    elMain.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  // Lingvo-butonoj
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => {
      I18n.setLang(btn.dataset.lang);
      _updateSettingsUI();
      _refreshDisplayedValues();
    };
  });

  if (elUnitM) elUnitM.onclick = () => { currentUnit = 'm'; Storage.setUnit('m'); _refreshDisplayedValues(); _updateSettingsUI(); if (window.BroadcastChannel) new BroadcastChannel('gova_settings').postMessage({type: 'unit_change', unit: 'm'}); };
  if (elUnitFt) elUnitFt.onclick = () => { currentUnit = 'ft'; Storage.setUnit('ft'); _refreshDisplayedValues(); _updateSettingsUI(); if (window.BroadcastChannel) new BroadcastChannel('gova_settings').postMessage({type: 'unit_change', unit: 'ft'}); };
  if (elBtnSetBase) elBtnSetBase.onclick = () => {
    const alt = lastBaroAlt ?? lastGpsAlt ?? Storage.getLastAlt();
    if (alt) { 
      Storage.setBaseHeight(alt); 
      _updateSettingsUI(); 
      _refreshDisplayedValues(); 
      _showToast(I18n.get('toastBaseSet')); 
    }
  };
  if (elBtnClearBase) elBtnClearBase.onclick = () => { 
    Storage.clearBaseHeight(); 
    _updateSettingsUI(); 
    _refreshDisplayedValues(); 
    _showToast(I18n.get('toastBaseCleared')); 
  };
  
  const elThemeAuto = document.getElementById('theme-auto');
  const elThemeLight = document.getElementById('theme-light');
  const elThemeDark = document.getElementById('theme-dark');
  if (elThemeAuto) elThemeAuto.onclick = () => { Theme.set('auto'); _updateThemeUI(); };
  if (elThemeLight) elThemeLight.onclick = () => { Theme.set('light'); _updateThemeUI(); };
  if (elThemeDark) elThemeDark.onclick = () => { Theme.set('dark'); _updateThemeUI(); };

  function _updateThemeUI() {
    const theme = Theme.get();
    if (elThemeAuto) elThemeAuto.classList.toggle('active', theme === 'auto');
    if (elThemeLight) elThemeLight.classList.toggle('active', theme === 'light');
    if (elThemeDark) elThemeDark.classList.toggle('active', theme === 'dark');
  }

  if (elBtnViewHistory) elBtnViewHistory.onclick = () => { window.location.href = 'history.html'; };
  if (elBtnViewPoints) elBtnViewPoints.onclick = () => { window.location.href = 'points.html'; };
  
  if (elBtnSavePoint) elBtnSavePoint.onclick = () => {
    const currentAlt = lastBaroAlt ?? lastGpsAlt ?? Storage.getLastAlt();
    if (currentAlt === null) return _showToast(I18n.get('toastNoGps'));
    const history = window.History ? window.History.getAll() : [];
    if (!history || history.length === 0) return _showToast(I18n.get('toastNoLoc'));
    const lastEntry = history[history.length - 1];
    const point = SavedPoints.save(currentAlt, lastEntry.latitude, lastEntry.longitude);
    if (point) {
      _showToast(I18n.get('toastSaved'));
      _updateSavedPointsUI();
    }
  };

  if (elBtnInstall) elBtnInstall.onclick = async () => {
    const success = await Install.prompt();
    if (success) _showToast('Aplikaĵo instalita!', 3000);
  };
  
  if (elBtnCloseSettings) elBtnCloseSettings.onclick = _closeSettings;
  if (elSettingsOverlay) elSettingsOverlay.onclick = (e) => { if (e.target === elSettingsOverlay) _closeSettings(); };
  
  document.onkeydown = (e) => {
    if (e.key === 'Escape') _closeSettings();
    if (e.key === 'ArrowRight') _setScreen(1);
    if (e.key === 'ArrowLeft') _setScreen(0);
    if (e.key === 's' && elSettingsOverlay && elSettingsOverlay.classList.contains('hidden')) _openSettings();
    if (e.key === ' ' && elSettingsOverlay && elSettingsOverlay.classList.contains('hidden')) { e.preventDefault(); _manualRefresh(); }
  };

  _initApp();
  setTimeout(_updateThemeUI, 100);
})();
