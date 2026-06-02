/**
 * coords.test.js — Testoj por la Coords-modulo (WGS84 → ITM, EPSG:2039)
 * NOTO: En retumilo, malfermu tests/run-tests.html
 */

const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
  },
  close: (actual, expected, tol, msg) => {
    if (Math.abs(actual - expected) > tol) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected} ±${tol}, got ${actual}`);
    }
  },
  ok: (value, msg) => {
    if (!value) {
      throw new Error(msg || 'Assertion failed: expected truthy value');
    }
  }
};

if (typeof Coords === 'undefined') {
  console.error('❌ Coords module not loaded');
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error('Coords module not loaded');
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

// La difina invarianto: la natura origino mapas al la falsa orienta/norda
// deŝovo (EPSG:2039: E0=219529.584, N0=626907.39). Tio estas sendependa
// kontrolo rekte el la projekciaj parametroj.
test('natura origino mapas al falsa orienta/norda deŝovo (EPSG:2039)', () => {
  const o = Coords.toITM(31.7343936111, 35.2045169444);
  assert.close(o.x, 219530, 2, 'origino x ≈ falsa easting');
  assert.close(o.y, 626907, 2, 'origino y ≈ falsa northing');
});

// Regresaj gardiloj: konataj israelaj urboj kun realmondaj ITM-valoroj.
// (Gardas kontraŭ la cimo kie la norda koordinato estis ~3.5M m for.)
test('Tel-Avivo mapas al ĝustaj ITM-koordinatoj', () => {
  const p = Coords.toITM(32.0853, 34.7818);
  assert.close(p.x, 179622, 2);
  assert.close(p.y, 665896, 2);
});

test('Jerusalemo (Okcidenta Muro) mapas al ĝustaj ITM-koordinatoj', () => {
  const p = Coords.toITM(31.7767, 35.2345);
  assert.close(p.x, 222370, 2);
  assert.close(p.y, 631599, 2);
});

test('Ĥajfo mapas al ĝustaj ITM-koordinatoj', () => {
  const p = Coords.toITM(32.7940, 34.9896);
  assert.close(p.x, 199398, 2);
  assert.close(p.y, 744430, 2);
});

test('Ejlato mapas al ĝustaj ITM-koordinatoj', () => {
  const p = Coords.toITM(29.5577, 34.9519);
  assert.close(p.x, 195048, 2);
  assert.close(p.y, 385617, 2);
});

// Sanity: israelaj koordinatoj estas pozitivaj kaj en la atendata gamo.
test('israelaj koordinatoj estas pozitivaj kaj en ITM-gamo', () => {
  const p = Coords.toITM(32.0, 35.0);
  assert.ok(p.x > 100000 && p.x < 300000, 'x en ITM-gamo');
  assert.ok(p.y > 350000 && p.y < 850000, 'y en ITM-gamo');
});

test('format produktas "x / y" kun milaj apartigiloj', () => {
  assert.equal(Coords.format({ x: 179622, y: 665896 }), '179,622 / 665,896');
});

// --- Rezultoj ---
console.log('\n' + '='.repeat(50));
console.log(`Coords — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));

if (results.failed > 0) process.exit(1);
