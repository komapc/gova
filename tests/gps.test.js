/**
 * gps.test.js — Testoj por la puraj barometraj funkcioj de GPS
 * NOTO: En retumilo, malfermu tests/run-tests.html
 */

const assert = {
  close: (actual, expected, tol, msg) => {
    if (Math.abs(actual - expected) > tol) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected} ±${tol}, got ${actual}`);
    }
  },
  ok: (value, msg) => {
    if (!value) throw new Error(msg || 'Assertion failed: expected truthy value');
  }
};

if (typeof GPS === 'undefined') {
  console.error('❌ GPS module not loaded');
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error('GPS module not loaded');
}

const results = { passed: 0, failed: 0 };

function test(name, fn) {
  try {
    fn();
    results.passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    results.failed++;
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
  }
}

// --- Testoj ---

test('pressureToAltitude redonas 0 ĉe norma marnivela premo', () => {
  assert.close(GPS.pressureToAltitude(1013.25, 1013.25), 0, 0.001, 'P0 → 0 m');
});

test('pressureToAltitude kreskas dum premo falas', () => {
  const low = GPS.pressureToAltitude(1000, 1013.25);
  const high = GPS.pressureToAltitude(900, 1013.25);
  assert.ok(low > 0, 'malpli ol P0 → pozitiva alteco');
  assert.ok(high > low, 'pli malalta premo → pli alta alteco');
});

test('solveSeaLevelPressure inversigas pressureToAltitude (rondvojaĝo)', () => {
  // Donu premon kaj P0, kalkulu altecon, poste reakiru P0 el (premo, alteco).
  const P = 900;
  const P0 = 1013.25;
  const alt = GPS.pressureToAltitude(P, P0);
  const recovered = GPS.solveSeaLevelPressure(P, alt);
  assert.close(recovered, P0, 0.01, 'reakirita P0 ≈ origina P0');
});

test('solveSeaLevelPressure trovas P0 tian ke la alteco kongruas', () => {
  // Se ni kalibras al konata alteco de 500 m ĉe premo 955 hPa,
  // tiam pressureToAltitude(955, P0) devas redoni 500 m.
  const P = 955;
  const knownAlt = 500;
  const P0 = GPS.solveSeaLevelPressure(P, knownAlt);
  assert.close(GPS.pressureToAltitude(P, P0), knownAlt, 0.001, 'kalibrita alteco kongruas');
});

test('barometro komencas nekalibrita', () => {
  assert.ok(!GPS.isBarometerCalibrated(), 'sen ankro → nekalibrita');
  assert.ok(GPS.needsCalibration(), 'nekalibrita → bezonas kalibradon');
});

test('calibrateBarometer rifuzas sen premo-legado', () => {
  // Neniu fizika sensoro en la test-medio → neniu _lastPressure.
  assert.ok(GPS.calibrateBarometer(500) === false, 'sen premo → ne kalibras');
});

// --- Rezultoj ---
console.log('\n' + '='.repeat(50));
console.log(`GPS — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));

if (results.failed > 0) process.exit(1);
