/**
 * storage.js — localStorage-envolvilo por Gova
 */

const Storage = (() => {
  const KEYS = {
    UNIT: 'gova_unit',
    LAST_ALT: 'gova_last_altitude',
    LAST_ACCURACY: 'gova_last_accuracy',
    BASE_HEIGHT: 'gova_base_height',
    SHOW_COORDS: 'gova_show_coords',
    TERRAIN_CONSENT: 'gova_terrain_consent',
  };

  function safeGet(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      // silente ignoras (privateca modo ktp.)
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignoras
    }
  }

  // --- Unuo ---

  /** @returns {'m'|'ft'} */
  function getUnit() {
    const val = safeGet(KEYS.UNIT, 'm');
    return val === 'ft' ? 'ft' : 'm';
  }

  /** @param {'m'|'ft'} unit */
  function setUnit(unit) {
    safeSet(KEYS.UNIT, unit === 'ft' ? 'ft' : 'm');
  }

  // --- Lasta Alteco (metroj, nombra valoro) ---

  /** @returns {number|null} */
  function getLastAlt() {
    const val = safeGet(KEYS.LAST_ALT);
    if (val === null) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  /** @param {number} meters */
  function setLastAlt(meters) {
    safeSet(KEYS.LAST_ALT, meters);
  }

  // --- Lasta Precizeco (metroj) ---

  /** @returns {number|null} */
  function getLastAccuracy() {
    const val = safeGet(KEYS.LAST_ACCURACY);
    if (val === null) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  /** @param {number} meters */
  function setLastAccuracy(meters) {
    safeSet(KEYS.LAST_ACCURACY, meters);
  }

  // --- Baza Alteco (metroj) ---

  /** @returns {number|null} */
  function getBaseHeight() {
    const val = safeGet(KEYS.BASE_HEIGHT);
    if (val === null) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }

  /** @param {number} meters */
  function setBaseHeight(meters) {
    safeSet(KEYS.BASE_HEIGHT, meters);
  }

  function clearBaseHeight() {
    safeRemove(KEYS.BASE_HEIGHT);
  }

  /** @returns {boolean} */
  function hasBaseHeight() {
    return getBaseHeight() !== null;
  }

  /** @returns {boolean} */
  function getShowCoords() {
    return safeGet(KEYS.SHOW_COORDS) === '1';
  }

  /** @param {boolean} show */
  function setShowCoords(show) {
    if (show) safeSet(KEYS.SHOW_COORDS, '1');
    else safeRemove(KEYS.SHOW_COORDS);
  }

  // --- Ter-alteca konsento ---
  // Peti ter-altecon sendas la lokon al ekstera servo. Defaŭlte ŝaltita
  // (la funkcio GROUND/tra-tranĉo bezonas ĝin), sed la uzanto povas malŝalti.

  /** @returns {boolean} */
  function getTerrainConsent() {
    return safeGet(KEYS.TERRAIN_CONSENT, '1') !== '0';
  }

  /** @param {boolean} on */
  function setTerrainConsent(on) {
    safeSet(KEYS.TERRAIN_CONSENT, on ? '1' : '0');
  }

  return {
    getUnit,
    setUnit,
    getLastAlt,
    setLastAlt,
    getLastAccuracy,
    setLastAccuracy,
    getBaseHeight,
    setBaseHeight,
    clearBaseHeight,
    hasBaseHeight,
    getShowCoords,
    setShowCoords,
    getTerrainConsent,
    setTerrainConsent,
  };
})();
