/**
 * storage.js — localStorage-envolvilo por Gova
 */

const Storage = (() => {
  const KEYS = {
    UNIT: 'gova_unit',
    LAST_ALT: 'gova_last_altitude',
    LAST_ACCURACY: 'gova_last_accuracy',
    LAST_LOCATION: 'gova_last_location_name',
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

  // --- Lasta Loknomo ---

  /** @returns {string|null} */
  function getLastLocation() {
    return safeGet(KEYS.LAST_LOCATION);
  }

  /** @param {string} name */
  function setLastLocation(name) {
    safeSet(KEYS.LAST_LOCATION, name);
  }

  function clearLastLocation() {
    safeRemove(KEYS.LAST_LOCATION);
  }

  return {
    getUnit,
    setUnit,
    getLastAlt,
    setLastAlt,
    getLastAccuracy,
    setLastAccuracy,
    getLastLocation,
    setLastLocation,
    clearLastLocation,
  };
})();
