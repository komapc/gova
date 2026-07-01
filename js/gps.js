/**
 * gps.js — Geolocation-abstraktado por Gova
 *
 * AVERTO: La Geolocation API liveras altecon relative al WGS84-elipsoido,
 * NE marnivelo (MSL). Diferenco povas esti ±100m depende de loko.
 * Kiam rete, uzu opentopodata.org por akiri veran MSL-altecon.
 */

const GPS = (() => {
  let _watchId = null;

  const OPTIONS_HIGH = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };

  let _pressureSensor = null;
  let _lastPressure = null;
  let _baroOnUpdate = null;

  // --- Barometra kalibrado ---
  // La barometro estas preciza por *relativaj* ŝanĝoj, sed bezonas absolutan
  // ankron: la vera marnivela premo (P0) varias laŭ vetero je dekoj da hPa,
  // kio donas ±100m+ da absoluta eraro se oni uzas la normon 1013.25.
  const SEA_LEVEL_PRESSURE_HPA = 1013.25;
  let _seaLevelPressure = SEA_LEVEL_PRESSURE_HPA;
  let _baroCalibrated = false;
  let _lastCalibrationTs = 0;
  const CAL_REFRESH_MS = 5 * 60 * 1000; // re-ankri ĉiun 5 min kontraŭ veter-drivo

  /**
   * Pura funkcio: konvertas aerpremon al alteco per la barometra formulo.
   * @param {number} pressure - hPa
   * @param {number} [p0] - marnivela referenca premo (hPa)
   * @returns {number} alteco en metroj
   */
  function pressureToAltitude(pressure, p0 = _seaLevelPressure) {
    // Standard formula: 44330 * (1 - (P/P0)^(1/5.255))
    return 44330 * (1 - Math.pow(pressure / p0, 1 / 5.255));
  }

  /**
   * Pura funkcio: inversigas la formulon — donas la marnivelan premon P0
   * tia ke `pressure` ĉe la donita konata alteco redonus tiun altecon.
   * @param {number} pressure - hPa
   * @param {number} knownAltitude - konata vera alteco (metroj, MSL)
   * @returns {number} marnivela referenca premo (hPa)
   */
  function solveSeaLevelPressure(pressure, knownAltitude) {
    return pressure / Math.pow(1 - knownAltitude / 44330, 5.255);
  }

  /**
   * Kalibras la barometron al konata MSL-alteco (ekz. ter-alteco de
   * opentopodata). NE uzu krudan GPS-altecon — ĝi estas elipsoida, ne MSL.
   * @param {number} knownAltitudeMeters - konata MSL-alteco
   * @returns {boolean} ĉu kalibrado okazis
   */
  function calibrateBarometer(knownAltitudeMeters) {
    if (_lastPressure === null || _lastPressure === undefined) return false;
    if (knownAltitudeMeters === null || knownAltitudeMeters === undefined || isNaN(knownAltitudeMeters)) return false;
    _seaLevelPressure = solveSeaLevelPressure(_lastPressure, knownAltitudeMeters);
    _baroCalibrated = true;
    _lastCalibrationTs = Date.now();
    return true;
  }

  /** @returns {boolean} ĉu la barometro havas validan absolutan ankron */
  function isBarometerCalibrated() {
    return _baroCalibrated;
  }

  /** @returns {boolean} ĉu necesas (re-)kalibri pro manko aŭ tro-aĝa ankro */
  function needsCalibration() {
    return !_baroCalibrated || (Date.now() - _lastCalibrationTs > CAL_REFRESH_MS);
  }

  /**
   * Komencas aŭskulti la barometron se disponebla.
   * Uzas la Generic Sensor API (`Barometer`).
   * @param {function} onUpdate - Callback(altitude)
   */
  function startBarometer(onUpdate) {
    _baroOnUpdate = onUpdate;
    if (_pressureSensor) return;
    const BarometerCtor = (typeof window !== 'undefined') ? window.Barometer : undefined;
    if (!BarometerCtor) return;
    try {
      _pressureSensor = new BarometerCtor({ frequency: 1 });
      _pressureSensor.addEventListener('reading', () => {
        _lastPressure = _pressureSensor.pressure;
        const alt = pressureToAltitude(_lastPressure);
        if (_baroOnUpdate) _baroOnUpdate(alt);
      });
      _pressureSensor.addEventListener('error', (e) => {
        console.warn('Barometro-eraro:', e.error || e);
      });
      _pressureSensor.start();
    } catch (e) {
      console.warn('Barometro ne atingebla:', e);
      _pressureSensor = null;
    }
  }

  function stopBarometer() {
    if (_pressureSensor) {
      try { _pressureSensor.stop(); } catch {}
      _pressureSensor = null;
    }
    _baroOnUpdate = null;
  }

  /**
   * Kontrolas ĉu Geolocation API estas disponebla.
   * @returns {boolean}
   */
  function isAvailable() {
    return 'geolocation' in navigator;
  }

  /**
   * Akiras unu lokan pozicion.
   * @returns {Promise<GeolocationPosition>}
   */
  function getOnce() {
    return new Promise((resolve, reject) => {
      if (!isAvailable()) {
        reject(new Error('UNSUPPORTED'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => reject(err),
        OPTIONS_HIGH
      );
    });
  }

  // Kaŝmemoro por ter-alteco. Ŝlosilo: lat/lon rondigita al ~100m.
  // opentopodata.org estas senpaga publika servo; ni evitas trafiki ĝin
  // por la sama loko-kvadrato.
  const _elevationCache = new Map();
  const ELEVATION_CACHE_TTL_MS = 60 * 60 * 1000; // 1 horo
  const ELEVATION_CACHE_MAX = 200;
  const ELEVATION_CACHE_KEY = 'gova_elev_cache_v2'; // v2: drop opentopodata-era entries
  let _lastElevationCallTs = 0;
  const ELEVATION_MIN_INTERVAL_MS = 1500; // ≤1 peto/1.5s

  function _elevationKey(lat, lon) {
    return `${lat.toFixed(3)},${lon.toFixed(3)}`;
  }

  // Persisto: la kaŝmemoro vivis nur en RAM kaj malaperis ĉe reŝargo, do
  // ofline-PWA montris nenian ter-altecon. Ni konservas ĝin al localStorage.
  function _loadElevationCache() {
    try {
      const raw = localStorage.getItem(ELEVATION_CACHE_KEY);
      if (!raw) return;
      const entries = JSON.parse(raw);
      if (!Array.isArray(entries)) return;
      const now = Date.now();
      for (const [key, value] of entries) {
        if (value && now - value.ts < ELEVATION_CACHE_TTL_MS) {
          _elevationCache.set(key, value);
        }
      }
    } catch {
      // korupta aŭ nedisponebla — ignoru
    }
  }

  function _persistElevationCache() {
    try {
      localStorage.setItem(ELEVATION_CACHE_KEY, JSON.stringify([..._elevationCache]));
    } catch {
      // privateca modo / kvoto plena — ignoru
    }
  }

  _loadElevationCache();

  /**
   * Akiras ter-altecon de pluraj fontoj samtempe.
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<Object>} - { srtm, aster, zen }
   */
  async function getAllElevations(lat, lon) {
    const empty = { srtm: null, aster: null, zen: null };

    // Kontrolu la (persistitan) kaŝmemoron ANTAŬ la ofline-gardilo, alie
    // ofline-PWA neniam vidus la konservitajn ter-altecojn.
    const key = _elevationKey(lat, lon);
    const cached = _elevationCache.get(key);
    if (cached && Date.now() - cached.ts < ELEVATION_CACHE_TTL_MS) {
      return cached.data;
    }

    // Sekureco/privateco: la peto sendas la lokon al ekstera servo, do respektu
    // la uzant-konsenton. Kaŝmemoritaj (lokaj) valoroj restas serveblaj.
    if (typeof Storage !== 'undefined' && !Storage.getTerrainConsent()) {
      return cached ? cached.data : empty;
    }

    if (!navigator.onLine) return cached ? cached.data : empty;

    // Trafik-limigo
    const sinceLast = Date.now() - _lastElevationCallTs;
    if (sinceLast < ELEVATION_MIN_INTERVAL_MS) {
      return cached ? cached.data : empty;
    }
    _lastElevationCallTs = Date.now();

    const results = { srtm: null, aster: null, zen: null };
    try {
      // opentopodata.org stopped sending CORS headers, so browser fetches were
      // blocked and terrain never loaded in the web app. open-meteo is
      // CORS-enabled, key-free and generous (~10k/day). It serves a single DEM
      // (Copernicus GLO-90); we store it in `zen` because that is the preferred
      // terrain source downstream (GROUND + cross-section read zen first).
      const resp = await fetch(
        `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (resp.ok) {
        const data = await resp.json();
        const elev = Array.isArray(data.elevation) ? data.elevation[0] : null;
        results.zen = (typeof elev === 'number') ? elev : null;
      }
    } catch (e) {
      console.warn('[GPS] Terrain elevation request failed:', e);
      return cached ? cached.data : empty;
    }

    // Only cache real data. Caching an all-null result (transient failure,
    // no-data tile) would poison this location for a full hour and leave the
    // cross-section stuck on "terrain loading".
    const hasData = results.zen !== null || results.srtm !== null || results.aster !== null;
    if (hasData) {
      _elevationCache.set(key, { ts: Date.now(), data: results });
      if (_elevationCache.size > ELEVATION_CACHE_MAX) {
        const firstKey = _elevationCache.keys().next().value;
        _elevationCache.delete(firstKey);
      }
      _persistElevationCache();
    }
    return results;
  }

  /**
   * Komencas aŭtomatan ĝisdatigon ĉiuj `intervalMs` milisekundoj.
   * @param {function} onSuccess - Callback(position, elevations, baroAltitude|null)
   * @param {function} onError - Callback(error)
   * @param {number} intervalMs - Defaŭlto: 5000
   */
  function startAutoRefresh(onSuccess, onError, intervalMs = 5000) {
    stopAutoRefresh();

    let lastCallMs = 0;
    let pending = false;

    _watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastCallMs < intervalMs || pending) return;
        lastCallMs = now;
        pending = true;
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const elevations = await getAllElevations(lat, lon);
          const baroAlt = _lastPressure ? pressureToAltitude(_lastPressure) : null;
          onSuccess(pos, elevations, baroAlt);
        } catch (err) {
          onError(err);
        } finally {
          pending = false;
        }
      },
      onError,
      { enableHighAccuracy: true, maximumAge: Math.floor(intervalMs / 2), timeout: 15000 }
    );
  }

  /**
   * Haltigas la aŭtomatan ĝisdatigon.
   */
  function stopAutoRefresh() {
    if (_watchId !== null) {
      navigator.geolocation.clearWatch(_watchId);
      _watchId = null;
    }
  }

  /**
   * Redonas homan mesaĝon por GeolocationPositionError.
   * @param {GeolocationPositionError|Error} err
   * @returns {string}
   */
  function getErrorMessage(err) {
    if (!err) return 'Nekonata eraro';

    if (err.message === 'UNSUPPORTED') {
      return 'Via aparato ne subtenas GPS';
    }

    const code = err.code;
    if (code === 1) return 'Aliro al loko rifuzita — bonvolu permesi GPS';
    if (code === 2) return 'Loko ne trovebla — kontrolu GPS-agordojn';
    if (code === 3) return 'GPS-serĉo daŭris tro longe — retestante...';

    return err.message || 'Nekonata GPS-eraro';
  }

  return {
    isAvailable,
    getOnce,
    getAllElevations,
    startAutoRefresh,
    stopAutoRefresh,
    getErrorMessage,
    startBarometer,
    stopBarometer,
    pressureToAltitude,
    solveSeaLevelPressure,
    calibrateBarometer,
    isBarometerCalibrated,
    needsCalibration,
  };
})();
