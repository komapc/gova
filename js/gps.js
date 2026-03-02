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
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<number|null>}
   */
  async function getMSLAltitude(lat, lon) {
    if (!navigator.onLine) return null;
    try {
      const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data?.results?.[0]?.elevation ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Komencas aŭtomatan ĝisdatigon ĉiuj `intervalMs` milisekundoj.
   * @param {function} onSuccess - Callback(position, mslAltitude|null)
   * @param {function} onError - Callback(error)
   * @param {number} intervalMs - Defaŭlto: 5000
   */
  function startAutoRefresh(onSuccess, onError, intervalMs = 5000) {
    stopAutoRefresh();

    let mslCache = { lat: null, lon: null, alt: null, ts: 0 };
    const MSL_CACHE_TTL = 60000; // 1 minuto

    async function fetchAndReport() {
      try {
        const pos = await getOnce();
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Uzu kaŝmemoron se la loko ne multe ŝanĝiĝis (< 100m)
        const now = Date.now();
        const cachedRecent = (now - mslCache.ts) < MSL_CACHE_TTL;
        const sameArea =
          mslCache.lat !== null &&
          Math.abs(lat - mslCache.lat) < 0.001 &&
          Math.abs(lon - mslCache.lon) < 0.001;

        let mslAlt = null;
        if (cachedRecent && sameArea) {
          mslAlt = mslCache.alt;
        } else {
          mslAlt = await getMSLAltitude(lat, lon);
          if (mslAlt !== null) {
            mslCache = { lat, lon, alt: mslAlt, ts: now };
          }
        }

        onSuccess(pos, mslAlt);
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
  };
})();
