/**
 * coords.js — Israeli grid coordinate conversions
 *
 * ITM: Israel Transverse Mercator (Reshet Hadasha) — EPSG:2039
 * ICS: Palestine Grid / Old Israeli Grid (Reshet Yeshana) — EPSG:28192
 *
 * Input: WGS84 latitude/longitude (decimal degrees)
 * Output: { x: easting, y: northing } in integer metres
 *
 * ICS accuracy is ~5 m due to the 3-parameter Helmert datum shift.
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

  // Transverse Mercator (Redfearn series) — used for ITM
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

  // Cassini-Soldner — used for ICS
  function _cassini(lat, lon, a, e2, lam0, phi0, E0, N0) {
    const ep2  = e2 / (1 - e2);
    const phi  = lat * DEG, lam = lon * DEG;
    const sinP = Math.sin(phi), cosP = Math.cos(phi), tanP = Math.tan(phi);
    const nu   = a / Math.sqrt(1 - e2 * sinP*sinP);
    const T    = tanP*tanP, C = ep2 * cosP*cosP;
    const A    = cosP * (lam - lam0);
    const M    = _meridionalArc(phi,  a, e2);
    const M0   = _meridionalArc(phi0, a, e2);

    const X = E0 + nu * (A - T*A*A*A/6 - (8-T+8*C)*T*A*A*A*A*A/120);
    const Y = N0 + (M - M0) + nu*tanP * (A*A/2 + (5-T+6*C)*A*A*A*A/24);
    return { x: Math.round(X), y: Math.round(Y) };
  }

  // WGS84 geographic → geocentric ECEF (h = 0)
  function _geoToECEF(lat, lon, a, e2) {
    const phi = lat * DEG, lam = lon * DEG;
    const sinP = Math.sin(phi), cosP = Math.cos(phi);
    const nu = a / Math.sqrt(1 - e2 * sinP*sinP);
    return {
      X: nu * cosP * Math.cos(lam),
      Y: nu * cosP * Math.sin(lam),
      Z: nu * (1 - e2) * sinP
    };
  }

  // ECEF → geographic on given ellipsoid (Bowring iterative, 5 iterations)
  function _ecefToGeo(X, Y, Z, a, e2) {
    const p = Math.sqrt(X*X + Y*Y);
    const lam = Math.atan2(Y, X);
    let phi = Math.atan2(Z, p * (1 - e2));
    for (let i = 0; i < 5; i++) {
      const sinP = Math.sin(phi);
      const nu = a / Math.sqrt(1 - e2 * sinP*sinP);
      phi = Math.atan2(Z + e2 * nu * sinP, p);
    }
    return { lat: phi / DEG, lon: lam / DEG };
  }

  // --- Ellipsoid constants ---
  // GRS80 (≈ WGS84, used by ITM and as WGS84 input)
  const GRS80_A  = 6378137.0;
  const GRS80_E2 = _e2(1 / 298.257222101);
  const WGS84_E2 = _e2(1 / 298.257223563); // for input ECEF

  // Clarke 1880 (Helmert) — EPSG:7020, used by Palestine 1923 / ICS
  const CL1880_A  = 6378200.0;
  const CL1880_E2 = _e2(1 / 298.3);

  // --- ITM projection parameters (EPSG:2039) ---
  const ITM_LAM0 = (35 + 12/60 + 16.261/3600) * DEG;
  const ITM_PHI0 = (31 + 44/60 +  3.817/3600) * DEG;
  const ITM_K0   = 1.0000067;
  const ITM_E0   = 219529.584;
  const ITM_N0   = -2885516.9488;

  // --- ICS projection parameters (EPSG:28192) ---
  const ICS_LAM0 = (35 + 12/60 + 43.490/3600) * DEG;
  const ICS_PHI0 = (31 + 44/60 +  2.749/3600) * DEG;
  const ICS_E0   = 170251.555;
  const ICS_N0   = 126867.909;

  function toITM(lat, lon) {
    return _tm(lat, lon, GRS80_A, GRS80_E2, ITM_K0, ITM_LAM0, ITM_PHI0, ITM_E0, ITM_N0);
  }

  function toICS(lat, lon) {
    // 1. WGS84 → ECEF
    const ec = _geoToECEF(lat, lon, GRS80_A, WGS84_E2);
    // 2. 3-parameter Helmert: WGS84 → Palestine 1923 (EPSG:15978)
    const sh = { X: ec.X - 235.0, Y: ec.Y - 85.0, Z: ec.Z + 264.0 };
    // 3. ECEF → geographic on Clarke 1880
    const g = _ecefToGeo(sh.X, sh.Y, sh.Z, CL1880_A, CL1880_E2);
    // 4. Cassini-Soldner projection
    return _cassini(g.lat, g.lon, CL1880_A, CL1880_E2, ICS_LAM0, ICS_PHI0, ICS_E0, ICS_N0);
  }

  function format(coords) {
    return `${coords.x.toLocaleString('en')} / ${coords.y.toLocaleString('en')}`;
  }

  return { toITM, toICS, format };
})();
