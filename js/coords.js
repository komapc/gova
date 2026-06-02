/**
 * coords.js — ITM coordinate conversion
 *
 * ITM: Israel Transverse Mercator (Reshet Hadasha) — EPSG:2039
 *
 * Input: WGS84 latitude/longitude (decimal degrees)
 * Output: { x: easting, y: northing } in integer metres
 */

const Coords = (() => {
  const DEG = Math.PI / 180;

  function _e2(f) { return 2*f - f*f; }

  function _meridionalArc(phi, a, e2) {
    const e4 = e2*e2, e6 = e4*e2;
    return a * (
      (1 - e2/4   - 3*e4/64   -  5*e6/256)  * phi
      - (3*e2/8   + 3*e4/32   + 45*e6/1024) * Math.sin(2*phi)
      + (15*e4/256 + 45*e6/1024)             * Math.sin(4*phi)
      -  35*e6/3072                           * Math.sin(6*phi)
    );
  }

  // Transverse Mercator (Redfearn series)
  function _tm(lat, lon, a, e2, k0, lam0, phi0, E0, N0) {
    const ep2  = e2 / (1 - e2);
    const phi  = lat * DEG, lam = lon * DEG;
    const sinP = Math.sin(phi), cosP = Math.cos(phi), tanP = Math.tan(phi);
    const nu   = a / Math.sqrt(1 - e2 * sinP*sinP);
    const T    = tanP*tanP, C = ep2 * cosP*cosP;
    const A    = cosP * (lam - lam0);
    const M    = _meridionalArc(phi,  a, e2);
    const M0   = _meridionalArc(phi0, a, e2);

    const E = E0 + k0 * nu * (
      A + (1-T+C)*A*A*A/6
      + (5-18*T+T*T+72*C-58*ep2)*A*A*A*A*A/120
    );
    const N = N0 + k0 * (
      M - M0 + nu*tanP * (
        A*A/2
        + (5-T+9*C+4*C*C)*A*A*A*A/24
        + (61-58*T+T*T+600*C-330*ep2)*A*A*A*A*A*A/720
      )
    );
    return { x: Math.round(E), y: Math.round(N) };
  }

  // GRS80 ellipsoid (≈ WGS84) — used by ITM
  const GRS80_A  = 6378137.0;
  const GRS80_E2 = _e2(1 / 298.257222101);

  // ITM projection parameters (EPSG:2039)
  const ITM_LAM0 = (35 + 12/60 + 16.261/3600) * DEG;
  const ITM_PHI0 = (31 + 44/60 +  3.817/3600) * DEG;
  const ITM_K0   = 1.0000067;
  const ITM_E0   = 219529.584;  // EPSG:2039 false easting
  const ITM_N0   = 626907.39;   // EPSG:2039 false northing

  function toITM(lat, lon) {
    return _tm(lat, lon, GRS80_A, GRS80_E2, ITM_K0, ITM_LAM0, ITM_PHI0, ITM_E0, ITM_N0);
  }

  function format(coords) {
    return `${coords.x.toLocaleString('en')} / ${coords.y.toLocaleString('en')}`;
  }

  return { toITM, format };
})();
