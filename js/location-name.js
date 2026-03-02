/**
 * location-name.js — Reversa geocoding per Nominatim
 *
 * Limigo: maksimume 1 peto ĉiuj 30 sekundoj laŭ uzkondiĉoj de OpenStreetMap.
 */

const LocationName = (() => {
  const MIN_INTERVAL_MS = 30000;
  let _lastRequestTime = 0;
  let _lastLat = null;
  let _lastLon = null;
  let _lastResult = null;

  /**
   * Redonas loknomon por la donitaj koordinatoj.
   * Uzas kaŝmemoron kaj 30s-limigon.
   *
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<string|null>}
   */
  async function getName(lat, lon) {
    if (!navigator.onLine) return null;

    const now = Date.now();

    // Uzu antaŭan rezulton se la loko ne ŝanĝiĝis multe
    if (
      _lastResult !== null &&
      _lastLat !== null &&
      Math.abs(lat - _lastLat) < 0.005 &&
      Math.abs(lon - _lastLon) < 0.005
    ) {
      return _lastResult;
    }

    // Respektu la 30s-limidon
    if (now - _lastRequestTime < MIN_INTERVAL_MS) {
      return _lastResult;
    }

    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('lat', lat.toFixed(6));
      url.searchParams.set('lon', lon.toFixed(6));
      url.searchParams.set('format', 'json');
      url.searchParams.set('zoom', '10');
      url.searchParams.set('addressdetails', '1');

      const resp = await fetch(url.toString(), {
        headers: {
          'Accept-Language': 'eo,en',
          'User-Agent': 'Gova Altitude App/1.0',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!resp.ok) return null;

      const data = await resp.json();
      _lastRequestTime = now;
      _lastLat = lat;
      _lastLon = lon;

      const name = _extractName(data);
      _lastResult = name;
      return name;
    } catch {
      return _lastResult;
    }
  }

  /**
   * Eltiras la plej utilan loknomon el Nominatim-respondo.
   * @param {object} data
   * @returns {string|null}
   */
  function _extractName(data) {
    if (!data || !data.address) return null;

    const addr = data.address;
    const parts = [];

    // Prioritato: urbeto/urbo/regiono
    const place =
      addr.village ||
      addr.town ||
      addr.city ||
      addr.municipality ||
      addr.county ||
      addr.state_district;

    const region = addr.state || addr.region;
    const country = addr.country_code?.toUpperCase();

    if (place) parts.push(place);
    if (region && region !== place) parts.push(region);
    if (country) parts.push(country);

    return parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',')[0] ?? null);
  }

  /**
   * Forigas la kaŝmemoron.
   */
  function clearCache() {
    _lastRequestTime = 0;
    _lastLat = null;
    _lastLon = null;
    _lastResult = null;
  }

  return {
    getName,
    clearCache,
  };
})();
