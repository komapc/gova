/**
 * geoid.test.js — Testoj por la Geoid-modulo (EGM96 geoid-undulacio N).
 * NOTO: En retumilo, malfermu tests/run-tests.html
 *
 * Gardas kontraŭ la cimo kie GROUND uzis krudan elipsoidan GPS-altecon
 * anstataŭ MSL, aldonante N kiel konstantan eraron (~36 m apud Goteborg).
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

if (typeof Geoid === 'undefined') {
  console.error('❌ Geoid module not loaded');
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error('Geoid module not loaded');
}

const results = { passed: 0, failed: 0, tests: [] };

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
// Referencaj N-valoroj el la EGM96-modelo (egm96-universal). Toleremo 1 m
// kovras la 1°-kradan resamplon + bilinearan interpoladon.

test('Goteborg N ≈ +36 m (la cimo-loko)', () => {
  assert.close(Geoid.meanSeaLevel(57.70, 11.97), 35.9, 1.0);
});

test('Stockholm N ≈ +23 m', () => {
  assert.close(Geoid.meanSeaLevel(59.33, 18.06), 23.2, 1.0);
});

test('Golfo de Gvineo (0,0) N ≈ +17 m', () => {
  assert.close(Geoid.meanSeaLevel(0, 0), 17.2, 1.0);
});

test('Nov-Jorko N ≈ -33 m (negativa undulacio)', () => {
  assert.close(Geoid.meanSeaLevel(40.71, -74.0), -32.8, 1.0);
});

test('longitudo ĉirkaŭvolvas je ±180°', () => {
  assert.close(Geoid.meanSeaLevel(0, 180), Geoid.meanSeaLevel(0, -180), 0.01,
    'N je lon=180 devas egali N je lon=-180');
});

test('latitudo estas limigita ĉe la polusoj (neniu eraro)', () => {
  assert.ok(Number.isFinite(Geoid.meanSeaLevel(90, 0)), 'norda poluso finia');
  assert.ok(Number.isFinite(Geoid.meanSeaLevel(-90, 135)), 'suda poluso finia');
});

// La invarianto de la korekto: ekrankopio montris GPS 47.6 (elipsoida),
// tereno 12.0 (MSL), GROUND 35.6 (erara). Post korekto la MSL-alteco estas
// ~11.5 m kaj GROUND ≈ 0 — la uzanto staras sur la tero.
test('ekrankopia korekto: GROUND apud Goteborg falas de 35.6 al ~0', () => {
  const N = Geoid.meanSeaLevel(57.70, 11.97);
  const mslAlt = 47.6 - N;
  const ground = Math.max(0, mslAlt - 12.0);
  assert.close(ground, 0, 1.0, 'GROUND devas esti ~0 starante sur la tero');
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Geoid — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));

if (results.failed > 0 && typeof process !== 'undefined') process.exit(1);
