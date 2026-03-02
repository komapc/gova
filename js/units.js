/**
 * units.js — Unuo-konvertado kaj formatado por Gova
 */

const Units = (() => {
  const M_TO_FT = 3.28084;

  /**
   * Konvertas metrojn al futoj.
   * @param {number} meters
   * @returns {number}
   */
  function toFeet(meters) {
    return meters * M_TO_FT;
  }

  /**
   * Kalkulas montrotan altecon (relativa aŭ absoluta)
   * @param {number} currentMeters - Nuna alteco en metroj
   * @param {number|null} baseMeters - Baza alteco en metroj
   * @returns {number} - Relativa aŭ absoluta alteco
   */
  function getDisplayAltitude(currentMeters, baseMeters) {
    if (baseMeters === null) return currentMeters;
    return currentMeters - baseMeters;
  }

  /**
   * Formatas altecon kun la ĝusta unuo.
   * @param {number|null} meters - Alteco en metroj
   * @param {'m'|'ft'} unit - Unuo
   * @param {boolean} isRelative - Ĉu montras relativan altecon
   * @returns {{ value: string, unit: string, prefix: string }}
   */
  function formatAltitude(meters, unit, isRelative = false) {
    if (meters === null || meters === undefined || isNaN(meters)) {
      return { value: '—', unit: unit === 'ft' ? 'ft' : 'm', prefix: '' };
    }

    const prefix = isRelative ? (meters >= 0 ? '+' : '') : '';

    if (unit === 'ft') {
      const ft = toFeet(meters);
      // Montri 1 decimalan lokon por futoj
      return {
        value: (Math.round(ft * 10) / 10).toLocaleString('en', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        unit: 'ft',
        prefix,
      };
    }

    // Montri 1 decimalan lokon por metroj
    return {
      value: (Math.round(meters * 10) / 10).toLocaleString('en', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      unit: 'm',
      prefix,
    };
  }

  /**
   * Formatas precizecon kun ± simbolo.
   * @param {number|null} meters
   * @param {'m'|'ft'} unit
   * @returns {string}
   */
  function formatAccuracy(meters, unit) {
    if (meters === null || meters === undefined || isNaN(meters)) {
      return '';
    }

    if (unit === 'ft') {
      const ft = toFeet(meters);
      return `±${Math.round(ft)} ft`;
    }

    return `±${Math.round(meters)} m`;
  }

  /**
   * Redonas la unuonomon por montrado.
   * @param {'m'|'ft'} unit
   * @returns {string}
   */
  function getUnitLabel(unit) {
    return unit === 'ft' ? 'ft' : 'm';
  }

  return {
    toFeet,
    getDisplayAltitude,
    formatAltitude,
    formatAccuracy,
    getUnitLabel,
  };
})();
