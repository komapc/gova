/**
 * history.js — Alteco-historio-administrado por Gova
 */

const History = (() => {
  const KEY = 'gova_history';
  const MAX_ENTRIES = 1000; // Maksimume 1000 registroj
  // Konservi nur kiam alteco aŭ pozicio signife ŝanĝiĝis,
  // por eviti plenigi 1000-en-limon ene de horo ĉe 5s-poll.
  const MIN_ALT_DELTA_M = 0.5;
  const MIN_LATLON_DELTA = 0.00005; // ~5m
  const MIN_INTERVAL_MS = 30 * 1000; // 30s mallonga limo

  // Maldensigo: GPS-bruo (±kelkaj m) igas preskaŭ ĉiun 5s-fikson "signifa",
  // do 1000 eroj tenis nur ~1-8 h — la 24h/7d-vidoj neniam pleniĝis. Kiam la
  // limo estas atingita, ni maldensigas la malnovajn erojn laŭ aĝo:
  //   - la plej novaj FULL_RES_KEEP eroj: plena rezolucio
  //   - pli junaj ol 24 h: 1 ero po 5 min (≤ 288)
  //   - pli malnovaj: 1 ero po 30 min (≤ 288 por tagoj 2-7)
  // 300 + 288 + 288 = 876 < 1000, do 7 tagoj ĉiam eniras la limon.
  // Sitelo = Math.floor(timestamp / larĝo) (fiksaj epokoj), do ripeta
  // maldensigo estas idempotenta kaj ne erozias malnovajn datumojn.
  const FULL_RES_KEEP = 300;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const THIN_TIERS = [
    { maxAgeMs: DAY_MS, bucketMs: 5 * 60 * 1000 },
    { maxAgeMs: Infinity, bucketMs: 30 * 60 * 1000 },
  ];

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
   * Maldensigas la historion (vidu THIN_TIERS). Tenas la unuan eron de ĉiu
   * sitelo. La plej novaj FULL_RES_KEEP eroj restas netuŝitaj.
   * @param {Array} history - ordigita laŭ tempo (malnova → nova)
   * @param {number} now
   * @returns {Array}
   */
  function _thin(history, now) {
    const splitAt = Math.max(0, history.length - FULL_RES_KEEP);
    const older = history.slice(0, splitAt);
    const newest = history.slice(splitAt);
    const seen = new Set();
    const kept = [];
    for (const entry of older) {
      const age = now - entry.timestamp;
      const tierIdx = THIN_TIERS.findIndex(t => age < t.maxAgeMs);
      const bucket = `${tierIdx}:${Math.floor(entry.timestamp / THIN_TIERS[tierIdx].bucketMs)}`;
      if (seen.has(bucket)) continue;
      seen.add(bucket);
      kept.push(entry);
    }
    return kept.concat(newest);
  }

  /**
   * Aldonas novan eron al historio.
   * @param {number} altitude - Alteco en metroj
   * @param {number} accuracy - Precizeco en metroj
   * @param {number} latitude - Latitudo
   * @param {number} longitude - Longitudo
   */
  function add(altitude, accuracy, latitude, longitude) {
    let history = getAll();

    const last = history.length ? history[history.length - 1] : null;
    if (last) {
      const dt = Date.now() - last.timestamp;
      const dAlt = Math.abs(altitude - last.altitude);
      const dLat = Math.abs(latitude - last.latitude);
      const dLon = Math.abs(longitude - last.longitude);
      const significant =
        dAlt >= MIN_ALT_DELTA_M ||
        dLat >= MIN_LATLON_DELTA ||
        dLon >= MIN_LATLON_DELTA;
      if (dt < MIN_INTERVAL_MS && !significant) return;
    }

    const entry = {
      timestamp: Date.now(),
      altitude: Math.round(altitude * 10) / 10, // 1 decimalo
      accuracy: Math.round(accuracy),
      latitude: Math.round(latitude * 1000000) / 1000000, // 6 decimaloj
      longitude: Math.round(longitude * 1000000) / 1000000
    };

    history.push(entry);

    // Limigi al MAX_ENTRIES: unue maldensigi, poste (nur se ankoraŭ tro
    // multaj, t.e. > ~7 tagoj da datumoj) forigi la plej malnovajn.
    let toSave = history;
    if (toSave.length > MAX_ENTRIES) {
      toSave = _thin(toSave, entry.timestamp);
      if (toSave.length > MAX_ENTRIES) {
        toSave.splice(0, toSave.length - MAX_ENTRIES);
      }
    }
    history = toSave;

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
