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
  const elAltXs = document.getElementById('alt-val-xs');
  const elXsScene = document.getElementById('xs-scene');
  const elXsCaption = document.getElementById('xs-caption');
  const elAltUnits = document.querySelectorAll('.altitude-unit');
  
  const elStatusIndicator = document.getElementById('status-indicator');
  const elFixFresh = document.getElementById('fix-fresh');
  const elPullIndicator = document.getElementById('pull-indicator');

  const elSettingsOverlay = document.getElementById('settings-overlay');
  const elStatusDot = document.getElementById('status-dot');
  const elStatusText = document.getElementById('status-text');

  const elUnitM = document.getElementById('unit-m');
  const elUnitFt = document.getElementById('unit-ft');
  const elBtnSetBase = document.getElementById('btn-set-base');
  const elBtnClearBase = document.getElementById('btn-clear-base');
  const elBaseHeightInfo = document.getElementById('base-height-info');
  const elBtnCloseSettings = document.getElementById('btn-close-settings');

  const elBtnSavePoint = document.getElementById('btn-save-point');
  const elPointsCount = document.getElementById('points-count');
  const elTodayHighPoint = document.getElementById('today-high-point');
  const elTodayLowPoint = document.getElementById('today-low-point');
  const elInstallSection = document.getElementById('install-section');
  const elBtnInstall = document.getElementById('btn-install');
  
  const elToast = document.getElementById('toast');
  
  // Detala krado
  const elValGps = document.querySelector('.val-gps');
  const elValAcc = document.querySelector('.val-acc');
  const elValSrtm = document.querySelector('.val-srtm');
  const elValAster = document.querySelector('.val-aster');
  const elValZen = document.querySelector('.val-zen');
  const elValAgl = document.querySelector('.val-agl');
  const elValBaro = document.querySelector('.val-baro');
  const elValSign = document.querySelector('.val-sign');

  const elCoordsPanel = document.getElementById('coords-panel');
  const elValITM = document.getElementById('val-itm');

  // --- Stato ---
  let currentUnit = Storage.getUnit();
  let currentScreen = 0;
  let isRefreshing = false;

  const DEBOUNCE_REFRESH = 2000;
  let lastRefreshTime = 0;
  let lastGpsAlt = null;   // raw GPS altitude — WGS84 ellipsoidal (as the browser reports it)
  let lastMslAlt = null;   // geoid-corrected mean-sea-level altitude (lastGpsAlt - N)
  let lastElevations = { srtm: null, aster: null, zen: null };
  let lastBaroAlt = null;
  let lastAccuracy = null;
  let lastFixTs = null;     // position.timestamp de la lasta fikso
  let lastNewFixMs = null;  // kiam ni laste vidis NOVAN fikson (Date.now)
  let wakeLock = null;
  let smoothedAlt = null;
  const SMOOTHING_FACTOR = 0.3;
  let lastLat = null;
  let lastLon = null;

  async function _requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch (err) {
      console.warn('Wake Lock error:', err);
      wakeLock = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && wakeLock === null) {
      _requestWakeLock();
    }
  });

  // --- Sinkronigo inter paĝoj ---
  let settingsChannel = null;
  if ('BroadcastChannel' in window) {
    settingsChannel = new BroadcastChannel('gova_settings');
    settingsChannel.onmessage = (ev) => {
      if (ev.data?.type === 'unit_change') {
        currentUnit = ev.data.unit;
        _refreshDisplayedValues();
      }
    };
  }
  function _broadcastUnit(unit) {
    if (settingsChannel) settingsChannel.postMessage({ type: 'unit_change', unit });
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

  // La barometro rajtas regi la montron nur kiam ĝi havas validan absolutan
  // ankron (kalibrita kontraŭ ter-MSL). Alie ĝia kruda valoro uzas la normon
  // 1013.25 hPa kaj povas erari je ±100m — do ni retropaŝas al MSL/GPS.
  function _effectiveBaroAlt() {
    return (lastBaroAlt !== null && GPS.isBarometerCalibrated()) ? lastBaroAlt : null;
  }

  // --- Montri altecon ---
  function _updateAltitudeDisplay(meters, accuracyMeters, animate = true) {
    const baseHeight = Storage.getBaseHeight();
    const rawAlt = _effectiveBaroAlt() ?? meters;
    
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

    if (elAltXs) elAltXs.textContent = mslFormatted.value;

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
    if (elValGps && lastGpsAlt !== null) {
      const gpsFmt = Units.formatAltitude(lastGpsAlt, currentUnit, false);
      elValGps.textContent = `${gpsFmt.value} ${gpsFmt.unit}`;
      if (elValAcc) elValAcc.textContent = `±${Math.round(accuracyMeters)}m`;
    }

    // Detala krado: plenigu valoron kaj kaŝu malplenajn kampojn (#1 UI/UX).
    const _setField = (el, value) => {
      if (!el) return;
      const has = value !== null && value !== undefined;
      if (has) {
        const f = Units.formatAltitude(value, currentUnit, false);
        el.textContent = `${f.value} ${f.unit}`;
      }
      el.closest('.info-item')?.classList.toggle('hidden', !has);
    };

    // Ter-fontoj
    _setField(elValSrtm, lastElevations.srtm);
    _setField(elValAster, lastElevations.aster);
    _setField(elValZen, lastElevations.zen);

    // GROUND (alteco super la tereno). La terfontoj estas MSL-referencaj, do ni
    // uzas la geoid-korektitan MSL-altecon (NE la krudan elipsoidan GPS), alie
    // la geoid-undulacio N aldoniĝas kiel konstanta eraro (~36 m en Svedio).
    const groundAlt = lastElevations.zen ?? lastElevations.srtm ?? lastElevations.aster;
    const aglAlt = (lastMslAlt !== null && lastMslAlt !== undefined && groundAlt !== null && groundAlt !== undefined)
      ? Math.max(0, lastMslAlt - groundAlt)
      : null;
    _setField(elValAgl, aglAlt);

    // Barometro
    _setField(elValBaro, lastBaroAlt);

    _updateCrossSection();
  }

  // --- Tra-tranĉo (Ekrano 3): Vi → Tero → Maro sur unu akso ---
  const XS_TOP = 9, XS_BOT = 93, XS_MINGAP = 15; // aks-marĝenoj kaj min. interspaco (%)

  function _xsLayout(you, ground) {
    const sea = 0;
    const agl = Math.max(0, you - ground);
    const merged = agl < 2; // staras sur la tero → kunfandi Vi+Tero
    const vals = merged ? [you, sea] : [you, ground, sea];
    let vmax = Math.max(...vals), vmin = Math.min(...vals);
    if (vmax === vmin) { vmax += 1; vmin -= 1; }
    const span = XS_BOT - XS_TOP;
    const ideal = (v) => XS_TOP + (vmax - v) / (vmax - vmin) * span;
    const nodes = (merged
      ? [{ k: 'you', v: you }, { k: 'sea', v: sea }]
      : [{ k: 'you', v: you }, { k: 'grd', v: ground }, { k: 'sea', v: sea }]
    ).map((n) => ({ ...n, ideal: ideal(n.v) })).sort((a, b) => a.ideal - b.ideal);
    // kontraŭ-kolizio: disigi najbarojn ĝis XS_MINGAP sen rompi la ordon
    nodes.forEach((n, i) => { n.pct = i ? Math.max(n.ideal, nodes[i - 1].pct + XS_MINGAP) : n.ideal; });
    const over = nodes[nodes.length - 1].pct - XS_BOT;
    if (over > 0) nodes.forEach((n) => { n.pct -= over; });
    if (nodes[0].pct < XS_TOP) {
      nodes[0].pct = XS_TOP;
      for (let i = 1; i < nodes.length; i++) nodes[i].pct = Math.max(nodes[i].pct, nodes[i - 1].pct + XS_MINGAP);
    }
    const P = {}; nodes.forEach((n) => { P[n.k] = n.pct; });
    return { agl, merged, P, grdPct: merged ? P.you : P.grd };
  }

  function _xsFmt(v) {
    return Units.formatAltitude(v, currentUnit, false).value;
  }

  function _xsNode(cls, topPct, title, sub, valStr) {
    return `<div class="xs-node ${cls}" style="top:${topPct.toFixed(1)}%;">
      <span class="xs-dot"></span>
      <span class="xs-txt"><b>${title}</b><small>${sub}</small></span>
      <span class="xs-val">${valStr}</span></div>`;
  }

  // 2-noda raskladka (Vi + Maro) kiam tereno ankoraŭ ne disponeblas
  function _xsLayoutPair(you) {
    const sea = 0;
    let vmax = Math.max(you, sea), vmin = Math.min(you, sea);
    if (vmax === vmin) { vmax += 1; vmin -= 1; }
    const span = XS_BOT - XS_TOP;
    const pct = (v) => XS_TOP + (vmax - v) / (vmax - vmin) * span;
    let youP = pct(you), seaP = pct(sea);
    if (Math.abs(youP - seaP) < XS_MINGAP) {
      if (youP <= seaP) seaP = Math.min(XS_BOT, youP + XS_MINGAP);
      else seaP = Math.max(XS_TOP, youP - XS_MINGAP);
    }
    return { youP, seaP };
  }

  function _updateCrossSection() {
    if (!elXsScene) return;
    const you = smoothedAlt;
    if (you === null || you === undefined) { elXsScene.innerHTML = ''; return; }
    const ground = lastElevations.zen ?? lastElevations.srtm ?? lastElevations.aster;
    const unit = Units.formatAltitude(0, currentUnit, false).unit;

    if (elXsCaption) elXsCaption.textContent = you < 0 ? I18n.get('belowSeaCap') : I18n.get('aboveSeaCap');

    // Tereno ankoraŭ ne ŝarĝita → montri nur Vi + Maro (sen tero-bendo / sen "super tero").
    if (ground === null || ground === undefined) {
      const P = _xsLayoutPair(you);
      elXsScene.style.setProperty('--grd', '101%'); // kaŝi la ter-bendon
      let h = '<div class="xs-sky"></div><div class="xs-axis"></div>';
      h += _xsNode('xs-you', P.youP, I18n.get('youLabel'), I18n.get('youSub'), `${_xsFmt(you)} ${unit}`);
      h += _xsNode('xs-sea', P.seaP, I18n.get('seaLabel'), I18n.get('seaSub'), `0 ${unit}`);
      h += `<div class="xs-hint">${I18n.get('terrainLoading')}</div>`;
      elXsScene.innerHTML = h;
      return;
    }

    const L = _xsLayout(you, ground);

    elXsScene.style.setProperty('--grd', L.grdPct.toFixed(1) + '%');
    let html = '<div class="xs-sky"></div><div class="xs-earth"></div>'
      + '<div class="xs-surface-line"></div><div class="xs-axis"></div>';

    if (L.merged) {
      html += _xsNode('xs-on', L.P.you, I18n.get('youLabel'), I18n.get('onGroundSub'), `${_xsFmt(you)} ${unit}`);
    } else {
      html += _xsNode('xs-you', L.P.you, I18n.get('youLabel'), I18n.get('youSub'), `${_xsFmt(you)} ${unit}`);
      const t = L.P.you, g = L.P.grd, h = g - t;
      html += `<div class="xs-brace" style="top:${t.toFixed(1)}%; height:${h.toFixed(1)}%;"></div>`;
      html += `<div class="xs-brace-tag" style="top:${((t + g) / 2).toFixed(1)}%;">`
        + `<b>${I18n.get('aboveGroundLabel')}</b><span>${_xsFmt(L.agl)} ${unit}</span></div>`;
      html += _xsNode('xs-grd', g, I18n.get('groundLabel'), I18n.get('groundSub'), `${_xsFmt(ground)} ${unit}`);
    }
    html += _xsNode('xs-sea', L.P.sea, I18n.get('seaLabel'), I18n.get('seaSub'), `0 ${unit}`);
    elXsScene.innerHTML = html;
  }

  // --- Fikso-freŝeco: ĉu la alteco estas viva aŭ "frostiĝinta" ---
  const FIX_LIVE_MAX_MS = 8000; // pli juna ol tio = viva (≈ maximumAge + marĝeno)

  function _fmtAge(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.round(s / 60);
    if (m < 60) return `${m}m`;
    return `${Math.round(m / 60)}h`;
  }

  function _updateFixFreshness() {
    if (!elFixFresh) return;
    if (lastNewFixMs === null) { elFixFresh.textContent = ''; elFixFresh.dataset.state = ''; return; }
    const age = Date.now() - lastNewFixMs;
    const live = age <= FIX_LIVE_MAX_MS;
    elFixFresh.dataset.state = live ? 'live' : 'stale';
    elFixFresh.textContent = live ? `● ${I18n.get('fixLive')}` : `● ${_fmtAge(age)}`;
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

  function _updateCoordsDisplay() {
    if (!elCoordsPanel || elCoordsPanel.classList.contains('hidden')) return;
    if (lastLat === null || lastLon === null) return;
    if (elValITM) elValITM.textContent = Coords.format(Coords.toITM(lastLat, lastLon));
  }

  // --- GPS-Sukceso ---
  async function _onGpsSuccess(position, elevations, baroAlt) {
    const coords = position.coords;
    // Fikso-freŝeco: nur kiam position.timestamp ŝanĝiĝas, temas pri NOVA fikso.
    // Se la telefono redonas kaŝmemoritan/retan pozicion, la stampo ne moviĝas,
    // do la indikilo montros kreskantan aĝon ("frostiĝinta").
    const ts = position.timestamp || Date.now();
    if (ts !== lastFixTs) { lastFixTs = ts; lastNewFixMs = Date.now(); }
    _updateFixFreshness();
    lastGpsAlt = coords.altitude;
    lastLat = coords.latitude;
    lastLon = coords.longitude;
    // Browsers report altitude relative to the WGS84 ellipsoid, but terrain
    // elevations (and what users expect as "altitude") are mean-sea-level. Cancel
    // the geoid undulation N so MSL altitude and GROUND are correct everywhere
    // (the ~36 m "GROUND makes no sense in Sweden" bug). Falls back to the raw
    // value if the geoid model or coordinates are unavailable.
    lastMslAlt = (lastGpsAlt !== null && lastLat !== null && typeof Geoid !== 'undefined')
      ? lastGpsAlt - Geoid.meanSeaLevel(lastLat, lastLon)
      : lastGpsAlt;
    lastElevations = elevations ?? lastElevations;
    lastBaroAlt = baroAlt ?? lastBaroAlt; // ?? not || so a legit 0 m reading is kept
    // Uzi horizontalan precizecon kiel alternativon
    lastAccuracy = coords.altitudeAccuracy || coords.accuracy;

    // Kalibri la barometron al ter-MSL (NE al kruda GPS-alteco, kiu estas
    // elipsoida). Tio donas al la barometro ĝustan absolutan ankron.
    const terrainMsl = lastElevations.zen ?? lastElevations.srtm ?? lastElevations.aster;
    if (lastBaroAlt !== null && terrainMsl !== null && GPS.needsCalibration()) {
      // Post-kalibrade la barometro legas ĝuste la ter-referencon, do ni
      // sinkronigas lastBaroAlt tuj (alie ĝi restus malfreŝa unu ciklon).
      if (GPS.calibrateBarometer(terrainMsl)) lastBaroAlt = terrainMsl;
    }

    if (lastGpsAlt === null && (lastElevations.zen === null) && lastBaroAlt === null) return;

    _updateAltitudeDisplay(lastMslAlt, lastAccuracy, true);
    _updateCoordsDisplay();
    _setStatus('locked', lastElevations.srtm !== null ? `${I18n.get('locked')} + MSL` : I18n.get('locked'));

    // Record the SAME altitude we display (calibrated baro, else GPS-MSL) so
    // History/Storage match the headline. Terrain elevation is a last-resort
    // fallback only for devices that report no GPS altitude — it is ground
    // level, not the user's altitude, so it must not override a real MSL fix.
    const finalAlt = _effectiveBaroAlt() ?? lastMslAlt ?? lastElevations.zen ?? lastElevations.srtm;
    if (finalAlt !== null && finalAlt !== undefined) {
      Storage.setLastAlt(finalAlt);
      if (lastAccuracy !== null) Storage.setLastAccuracy(lastAccuracy);
      History.add(finalAlt, lastAccuracy || 0, coords.latitude, coords.longitude);
      SavedPoints.updateTodayPoints(finalAlt, coords.latitude, coords.longitude);
    }
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
      const elevations = await GPS.getAllElevations(pos.coords.latitude, pos.coords.longitude);
      await _onGpsSuccess(pos, elevations, null);
    } catch (err) {
      _onGpsError(err);
    } finally {
      isRefreshing = false;
      if (elMain) elMain.classList.remove('refreshing');
      GPS.startAutoRefresh(_onGpsSuccess, _onGpsError, 5000);
    }
  }

  function _triggerPullRefresh() {
    _manualRefresh();
    _hidePullIndicator();
  }

  function _hidePullIndicator() {
    if (elPullIndicator) {
      elPullIndicator.classList.remove('visible', 'pulling', 'refreshing');
      setTimeout(() => elPullIndicator.classList.add('hidden'), 300);
    }
  }

  function _openSettings() {
    if (elSettingsOverlay) {
      elSettingsOverlay.classList.remove('hidden');
      _updateSettingsUI();
    }
  }

  function _closeSettings() {
    if (elSettingsOverlay) elSettingsOverlay.classList.add('hidden');
  }

  const SCREEN_COUNT = 3;
  function _setScreen(index) {
    currentScreen = Math.max(0, Math.min(SCREEN_COUNT - 1, index));
    if (elScreensContainer) elScreensContainer.dataset.currentScreen = currentScreen;
    elDots.forEach((dot, i) => dot.classList.toggle('active', i === currentScreen));
  }

  // --- Gesta Administrado ---
  function _showPullIndicator() {
    if (elPullIndicator) {
      elPullIndicator.classList.remove('hidden');
      elPullIndicator.classList.add('visible');
    }
  }

  function _setupGestures() {
    Gestures.init(elMain, {
      onTap: _manualRefresh,
      onLongPress: () => {
        _openSettings();
        if (navigator.vibrate) navigator.vibrate(50);
      },
      onSwipe: (dir) => _setScreen(currentScreen + (dir === 'right' ? -1 : 1)),
      onPullStart: _showPullIndicator,
      onPullMove: (passed) => {
        if (elPullIndicator) elPullIndicator.classList.toggle('pulling', passed);
      },
      onPullRelease: (triggered) => {
        if (triggered) _triggerPullRefresh();
        else _hidePullIndicator();
      },
    }, {
      canPull: () => !isRefreshing && !!elSettingsOverlay && elSettingsOverlay.classList.contains('hidden'),
    });
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
      // Ĝisdatigu la fikso-freŝecon ĉiusekunde, por ke la aĝo grimpu videble
      // kiam la GPS frostiĝas (ekz. endome).
      setInterval(_updateFixFreshness, 1000);
      _requestWakeLock();
    } catch (e) {
      console.error('Eraro dum inicializado:', e);
    }
  }

  // --- Eventoj ---
  if (elMain) _setupGestures();
  
  // Lingvo-butonoj
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.onclick = () => {
      I18n.setLang(btn.dataset.lang);
      _updateSettingsUI();
      _refreshDisplayedValues();
    };
  });

  if (elUnitM) elUnitM.onclick = () => { currentUnit = 'm'; Storage.setUnit('m'); _refreshDisplayedValues(); _updateSettingsUI(); _broadcastUnit('m'); };
  if (elUnitFt) elUnitFt.onclick = () => { currentUnit = 'ft'; Storage.setUnit('ft'); _refreshDisplayedValues(); _updateSettingsUI(); _broadcastUnit('ft'); };
  if (elBtnSetBase) elBtnSetBase.onclick = () => {
    const alt = _effectiveBaroAlt() ?? lastGpsAlt ?? Storage.getLastAlt();
    if (alt !== null && alt !== undefined) { // allow setting a base at exactly 0 m
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

  if (elBtnSavePoint) elBtnSavePoint.onclick = () => {
    const currentAlt = _effectiveBaroAlt() ?? lastGpsAlt ?? Storage.getLastAlt();
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

  const elBtnOpenSettings = document.getElementById('btn-open-settings');
  if (elBtnOpenSettings) elBtnOpenSettings.onclick = (e) => { e.stopPropagation(); _openSettings(); };

  // Privateca-baskulilo
  const elToggleAnalytics = document.getElementById('toggle-analytics');
  const elDntNote = document.getElementById('dnt-note');
  if (elToggleAnalytics && typeof Analytics !== 'undefined') {
    const dnt = Analytics.dntEnabled();
    elToggleAnalytics.checked = Analytics.consented();
    elToggleAnalytics.disabled = dnt;
    if (dnt) {
      elToggleAnalytics.checked = false;
      if (elDntNote) elDntNote.classList.remove('hidden');
    }
    elToggleAnalytics.onchange = () => {
      Analytics.setConsent(elToggleAnalytics.checked);
    };
  }
  
  const elToggleTerrain = document.getElementById('toggle-terrain');
  if (elToggleTerrain) {
    elToggleTerrain.checked = Storage.getTerrainConsent();
    elToggleTerrain.onchange = () => {
      Storage.setTerrainConsent(elToggleTerrain.checked);
      if (elToggleTerrain.checked) _manualRefresh(); // fetch terrain immediately on opt-in
    };
  }

  const elToggleCoords = document.getElementById('toggle-coords');
  if (elToggleCoords) {
    elToggleCoords.checked = Storage.getShowCoords();
    if (elCoordsPanel) elCoordsPanel.classList.toggle('hidden', !Storage.getShowCoords());
    elToggleCoords.onchange = () => {
      Storage.setShowCoords(elToggleCoords.checked);
      if (elCoordsPanel) elCoordsPanel.classList.toggle('hidden', !elToggleCoords.checked);
      if (elToggleCoords.checked) _updateCoordsDisplay();
    };
  }

  document.onkeydown = (e) => {
    if (e.key === 'Escape') _closeSettings();
    if (e.key === 'ArrowRight') _setScreen(currentScreen + 1);
    if (e.key === 'ArrowLeft') _setScreen(currentScreen - 1);
    if (e.key === 's' && elSettingsOverlay && elSettingsOverlay.classList.contains('hidden')) _openSettings();
    if (e.key === ' ' && elSettingsOverlay && elSettingsOverlay.classList.contains('hidden')) { e.preventDefault(); _manualRefresh(); }
  };

  _initApp();
  setTimeout(_updateThemeUI, 100);
})();
