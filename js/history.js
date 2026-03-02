/**
 * history.js — Alteco-historio-administrado por Gova
 */

const History = (() => {
  const KEY = 'gova_history';
  const MAX_ENTRIES = 1000; // Maksimume 1000 registroj

  /**
   * Strukturo de historio-ero:
   * {
   *   timestamp: number,    // Unix timestamp (ms)
   *   altitude: number,     // Alteco en metroj
   *   accuracy: number,     // Precizeco en metroj
   *   latitude: number,     // Latitudo
   *   longitude: number     // Longitudo
   * }
   */

  /**
   * Akiras la tutan historion.
   * @returns {Array}
   */
  function getAll() {
    try {
      const data = localStorage.getItem(KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Aldonas novan eron al historio.
   * @param {number} altitude - Alteco en metroj
   * @param {number} accuracy - Precizeco en metroj
   * @param {number} latitude - Latitudo
   * @param {number} longitude - Longitudo
   */
  function add(altitude, accuracy, latitude, longitude) {
    const history = getAll();
    
    const entry = {
      timestamp: Date.now(),
      altitude: Math.round(altitude * 10) / 10, // 1 decimalo
      accuracy: Math.round(accuracy),
      latitude: Math.round(latitude * 1000000) / 1000000, // 6 decimaloj
      longitude: Math.round(longitude * 1000000) / 1000000
    };

    history.push(entry);

    // Limigi al MAX_ENTRIES
    if (history.length > MAX_ENTRIES) {
      history.shift(); // Forigi plej malnovan
    }

    try {
      localStorage.setItem(KEY, JSON.stringify(history));
    } catch {
      // Se localStorage estas plena, forigi malnovan daton
      if (history.length > 100) {
        history.splice(0, 100);
        try {
          localStorage.setItem(KEY, JSON.stringify(history));
        } catch {
          // Silente ignoras
        }
      }
    }
  }

  /**
   * Akiras historion por specifa tempo-periodo.
   * @param {number} hours - Nombro da horoj malantaŭen
   * @returns {Array}
   */
  function getRecent(hours = 24) {
    const history = getAll();
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return history.filter(entry => entry.timestamp >= cutoff);
  }

  /**
   * Kalkulas statistikojn por specifa periodo.
   * @param {number} hours - Nombro da horoj malantaŭen
   * @returns {Object}
   */
  function getStats(hours = 24) {
    const data = getRecent(hours);
    
    if (data.length === 0) {
      return {
        count: 0,
        min: null,
        max: null,
        avg: null,
        range: null,
        first: null,
        last: null
      };
    }

    const altitudes = data.map(e => e.altitude);
    const min = Math.min(...altitudes);
    const max = Math.max(...altitudes);
    const avg = altitudes.reduce((a, b) => a + b, 0) / altitudes.length;

    return {
      count: data.length,
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      avg: Math.round(avg * 10) / 10,
      range: Math.round((max - min) * 10) / 10,
      first: data[0],
      last: data[data.length - 1]
    };
  }

  /**
   * Eksportas historion kiel JSON.
   * @returns {string}
   */
  function exportJSON() {
    const history = getAll();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Eksportas historion kiel CSV.
   * @returns {string}
   */
  function exportCSV() {
    const history = getAll();
    if (history.length === 0) return '';

    const headers = 'Timestamp,Date,Time,Altitude (m),Accuracy (m),Latitude,Longitude\n';
    const rows = history.map(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().split(' ')[0];
      return `${entry.timestamp},${dateStr},${timeStr},${entry.altitude},${entry.accuracy},${entry.latitude},${entry.longitude}`;
    }).join('\n');

    return headers + rows;
  }

  /**
   * Forigas ĉiujn historio-erojn.
   */
  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Silente ignoras
    }
  }

  /**
   * Forigas erojn pli malnovajn ol X horoj.
   * @param {number} hours
   */
  function clearOlderThan(hours) {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const history = getAll();
    const filtered = history.filter(entry => entry.timestamp >= cutoff);
    
    try {
      localStorage.setItem(KEY, JSON.stringify(filtered));
    } catch {
      // Silente ignoras
    }
  }

  return {
    add,
    getAll,
    getRecent,
    getStats,
    exportJSON,
    exportCSV,
    clear,
    clearOlderThan
  };
})();
