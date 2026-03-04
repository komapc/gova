/**
 * gps.js — Geolocation-abstraktado por Gova
 *
 * AVERTO: La Geolocation API liveras altecon relative al WGS84-elipsoido,
 * NE marnivelo (MSL). Diferenco povas esti ±100m depende de loko.
 * Kiam rete, uzu Open-Elevation API por akiri veran MSL-altecon.
 */

const GPS = (() => {
  let _watchId = null;
  let _autoInterval = null;

  const OPTIONS_HIGH = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };

  const OPTIONS_LOW = {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 30000,
  };

  let _pressureSensor = null;
  let _lastPressure = null;

  /**
   * Kalkulas altecon el aerpremo (P0 = 1013.25 hPa)
   * @param {number} pressure - hPa
   * @returns {number}
   */
  function calculateBaroAltitude(pressure) {
    // Standard formula: 44330 * (1 - (P/P0)^(1/5.255))
    return 44330 * (1 - Math.pow(pressure / 1013.25, 1 / 5.255));
  }

  /**
   * Komencas aŭskulti la barometron se disponebla.
   * @param {function} onUpdate - Callback(altitude)
   */
  function startBarometer(onUpdate) {
    if ('PressureSensor' in window) {
      try {
        _pressureSensor = new PressureSensor({ frequency: 1 });
        _pressureSensor.addEventListener('reading', () => {
          _lastPressure = _pressureSensor.pressure;
          const alt = calculateBaroAltitude(_lastPressure);
          onUpdate(alt);
        });
        _pressureSensor.start();
      } catch (e) {
        console.warn('Barometro ne atingebla:', e);
      }
    }
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

  /**
   * Akiras altecon de Open-Elevation API (kiam rete).
   * Redonas null se eraro aŭ ofline.
   * Uzas localStorage por kaŝmemoro por ŝpari ret-petojn kaj por senreta uzo.
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<number|null>}
   */
  async function getMSLAltitude(lat, lon) {
    const CACHE_KEY = 'gova_msl_cache';
    const MAX_DIST_M = 100; // 100m radiuso
    const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horoj

    // 1. Kontroli lokan kaŝmemoron
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const cache = JSON.parse(cachedData);
        const now = Date.now();
        
        // Trovi proksiman punkton en kaŝmemoro
        const found = cache.find(p => {
          const dLat = Math.abs(p.lat - lat);
          const dLon = Math.abs(p.lon - lon);
          // Tre simpla distanco-proksimumo (0.001 grado ~= 111m)
          return dLat < 0.0009 && dLon < 0.0009 && (now - p.ts < MAX_AGE_MS);
        });

        if (found) return found.alt;
      }
    } catch (e) {}

    // 2. Se ne trovis aŭ malnova, peti de API
    if (!navigator.onLine) return null;
    
    try {
      const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const data = await resp.json();
      const alt = data?.results?.[0]?.elevation ?? null;

      // 3. Konservi en kaŝmemoro
      if (alt !== null) {
        try {
          let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
          // Limigi kaŝmemoron al 50 lokoj
          if (cache.length > 50) cache.shift();
          
          cache.push({ lat, lon, alt, ts: Date.now() });
          localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (e) {}
      }

      return alt;
    } catch {
      return null;
    }
  }

  /**
   * Komencas aŭtomatan ĝisdatigon ĉiuj `intervalMs` milisekundoj.
   * @param {function} onSuccess - Callback(position, mslAltitude|null, baroAltitude|null)
   * @param {function} onError - Callback(error)
   * @param {number} intervalMs - Defaŭlto: 5000
   */
  function startAutoRefresh(onSuccess, onError, intervalMs = 5000) {
    stopAutoRefresh();

    async function fetchAndReport() {
      try {
        const pos = await getOnce();
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const mslAlt = await getMSLAltitude(lat, lon);
        
        // Se ni havas lastan premon, ni povas doni ankaŭ barometran altecon
        const baroAlt = _lastPressure ? calculateBaroAltitude(_lastPressure) : null;
        
        onSuccess(pos, mslAlt, baroAlt);
      } catch (err) {
        onError(err);
      }
    }

    // Tuja unua alveturado
    fetchAndReport();
    _autoInterval = setInterval(fetchAndReport, intervalMs);
  }

  /**
   * Haltigas la aŭtomatan ĝisdatigon.
   */
  function stopAutoRefresh() {
    if (_watchId !== null) {
      navigator.geolocation.clearWatch(_watchId);
      _watchId = null;
    }
    if (_autoInterval !== null) {
      clearInterval(_autoInterval);
      _autoInterval = null;
    }
    if (_pressureSensor) {
      _pressureSensor.stop();
      _pressureSensor = null;
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
    getMSLAltitude,
    startAutoRefresh,
    stopAutoRefresh,
    getErrorMessage,
    startBarometer,
  };
})();
