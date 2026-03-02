/**
 * saved-points.js — Konservitaj punktoj-administrado por Gova
 */

const SavedPoints = (() => {
  const KEYS = {
    SAVED: 'gova_saved_points',
    TODAY_HIGH: 'gova_today_high',
    TODAY_LOW: 'gova_today_low',
    LAST_RESET: 'gova_last_reset_date',
  };

  const MAX_SAVED_POINTS = 20;

  /**
   * Akiras ĉiujn manuale konservitajn punktojn.
   * @returns {Array}
   */
  function getAll() {
    try {
      const data = localStorage.getItem(KEYS.SAVED);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Konservas novan punkton.
   * @param {number} altitude - Alteco en metroj
   * @param {number} latitude - Latitudo
   * @param {number} longitude - Longitudo
   * @param {string} name - Opcian nomon
   * @returns {Object} - La konservita punkto
   */
  function save(altitude, latitude, longitude, name = null) {
    const points = getAll();
    
    const point = {
      id: Date.now(),
      name: name || `Punkto ${points.length + 1}`,
      altitude: Math.round(altitude * 10) / 10,
      latitude: Math.round(latitude * 1000000) / 1000000,
      longitude: Math.round(longitude * 1000000) / 1000000,
      timestamp: Date.now(),
      type: 'manual'
    };

    points.push(point);

    // Limigi al MAX_SAVED_POINTS
    if (points.length > MAX_SAVED_POINTS) {
      points.shift();
    }

    try {
      localStorage.setItem(KEYS.SAVED, JSON.stringify(points));
    } catch {
      // localStorage plena
      return null;
    }

    return point;
  }

  /**
   * Forigas punkton per ID.
   * @param {number} id
   */
  function remove(id) {
    const points = getAll();
    const filtered = points.filter(p => p.id !== id);
    
    try {
      localStorage.setItem(KEYS.SAVED, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ĝisdatigas punkto-nomon.
   * @param {number} id
   * @param {string} newName
   */
  function rename(id, newName) {
    const points = getAll();
    const point = points.find(p => p.id === id);
    
    if (point) {
      point.name = newName;
      try {
        localStorage.setItem(KEYS.SAVED, JSON.stringify(points));
        return true;
      } catch {
        return false;
      }
    }
    
    return false;
  }

  /**
   * Kontrolas ĉu hodiaŭaj punktoj bezonas reset.
   */
  function checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem(KEYS.LAST_RESET);
    
    if (lastReset !== today) {
      // Nova tago - reseti hodiaŭajn punktojn
      localStorage.removeItem(KEYS.TODAY_HIGH);
      localStorage.removeItem(KEYS.TODAY_LOW);
      localStorage.setItem(KEYS.LAST_RESET, today);
    }
  }

  /**
   * Ĝisdatigas hodiaŭajn plej altajn/malaltajn punktojn.
   * @param {number} altitude
   * @param {number} latitude
   * @param {number} longitude
   */
  function updateTodayPoints(altitude, latitude, longitude) {
    checkDailyReset();

    const point = {
      altitude: Math.round(altitude * 10) / 10,
      latitude: Math.round(latitude * 1000000) / 1000000,
      longitude: Math.round(longitude * 1000000) / 1000000,
      timestamp: Date.now()
    };

    // Ĝisdatigi plej altan
    try {
      const highData = localStorage.getItem(KEYS.TODAY_HIGH);
      const currentHigh = highData ? JSON.parse(highData) : null;
      
      if (!currentHigh || altitude > currentHigh.altitude) {
        localStorage.setItem(KEYS.TODAY_HIGH, JSON.stringify(point));
      }
    } catch {}

    // Ĝisdatigi plej malalta
    try {
      const lowData = localStorage.getItem(KEYS.TODAY_LOW);
      const currentLow = lowData ? JSON.parse(lowData) : null;
      
      if (!currentLow || altitude < currentLow.altitude) {
        localStorage.setItem(KEYS.TODAY_LOW, JSON.stringify(point));
      }
    } catch {}
  }

  /**
   * Akiras hodiaŭan plej altan punkton.
   * @returns {Object|null}
   */
  function getTodayHigh() {
    checkDailyReset();
    try {
      const data = localStorage.getItem(KEYS.TODAY_HIGH);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Akiras hodiaŭan plej malalta punkton.
   * @returns {Object|null}
   */
  function getTodayLow() {
    checkDailyReset();
    try {
      const data = localStorage.getItem(KEYS.TODAY_LOW);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Akiras resumon de ĉiuj punktoj.
   * @returns {Object}
   */
  function getSummary() {
    return {
      saved: getAll(),
      todayHigh: getTodayHigh(),
      todayLow: getTodayLow(),
      count: getAll().length
    };
  }

  return {
    getAll,
    save,
    remove,
    rename,
    updateTodayPoints,
    getTodayHigh,
    getTodayLow,
    getSummary
  };
})();
