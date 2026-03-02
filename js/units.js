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
   * Formatas altecon kun la ĝusta unuo.
   * @param {number|null} meters - Alteco en metroj
   * @param {'m'|'ft'} unit - Unuo
   * @returns {{ value: string, unit: string }}
   */
  function formatAltitude(meters, unit) {
    if (meters === null || meters === undefined || isNaN(meters)) {
      return { value: '—', unit: unit === 'ft' ? 'ft' : 'm' };
    }

    if (unit === 'ft') {
      const ft = toFeet(meters);
      return {
        value: Math.round(ft).toLocaleString('en'),
        unit: 'ft',
      };
    }

    return {
      value: Math.round(meters).toLocaleString('en'),
      unit: 'm',
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
    formatAltitude,
    formatAccuracy,
    getUnitLabel,
  };
})();
