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
   * Akiras ter-altecon de pluraj fontoj samtempe.
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<Object>} - { srtm, aster, zen }
   */
  async function getAllElevations(lat, lon) {
    const results = { srtm: null, aster: null, zen: null };
    if (!navigator.onLine) return results;

    try {
      const resp = await fetch(
        `https://api.opentopodata.org/v1/srtm30m,aster30m,mapzen?locations=${lat},${lon}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'OK' && data.results) {
          results.srtm = data.results[0]?.elevation ?? null;
          results.aster = data.results[1]?.elevation ?? null;
          results.zen = data.results[2]?.elevation ?? null;
        }
      }
    } catch (e) {
      console.warn('[GPS] Malsukcesis peti plurajn altecojn:', e);
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

    async function fetchAndReport() {
      try {
        const pos = await getOnce();
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const elevations = await getAllElevations(lat, lon);
        
        // Se ni havas lastan premon, ni povas doni ankaŭ barometran altecon
        const baroAlt = _lastPressure ? calculateBaroAltitude(_lastPressure) : null;
        
        onSuccess(pos, elevations, baroAlt);
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
    getAllElevations,
    startAutoRefresh,
    stopAutoRefresh,
    getErrorMessage,
    startBarometer,
  };
})();
