/**
 * units.test.js — Testoj por Units-modulo
 */

// Simpla test-kadro
const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
  },
  deepEqual: (actual, expected, msg) => {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(`${msg || 'Deep assertion failed'}: expected ${expectedStr}, got ${actualStr}`);
    }
  },
  ok: (value, msg) => {
    if (!value) {
      throw new Error(msg || 'Assertion failed: expected truthy value');
    }
  }
};

// Ŝarĝi Units-modulon
if (typeof Units === 'undefined') {
  throw new Error('Units module not loaded');
}

// Test-rezultoj
const results = { passed: 0, failed: 0, tests: [] };

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message });
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
  }
}

// --- Testoj ---

test('toFeet konvertas metrojn al futoj', () => {
  assert.equal(Math.round(Units.toFeet(100)), 328, 'toFeet(100) ≈ 328');
  assert.equal(Math.round(Units.toFeet(0)), 0, 'toFeet(0) = 0');
  assert.equal(Math.round(Units.toFeet(1000)), 3281, 'toFeet(1000) ≈ 3281');
});

test('getDisplayAltitude redonas absolutan altecon sen bazo', () => {
  assert.equal(Units.getDisplayAltitude(500, null), 500);
  assert.equal(Units.getDisplayAltitude(0, null), 0);
});

test('getDisplayAltitude kalkulas relativan altecon kun bazo', () => {
  assert.equal(Units.getDisplayAltitude(500, 400), 100);
  assert.equal(Units.getDisplayAltitude(400, 500), -100);
  assert.equal(Units.getDisplayAltitude(500, 500), 0);
});

test('formatAltitude formatas metrojn korekte', () => {
  const result = Units.formatAltitude(1234, 'm', false);
  assert.equal(result.value, '1,234');
  assert.equal(result.unit, 'm');
  assert.equal(result.prefix, '');
});

test('formatAltitude formatas futojn korekte', () => {
  const result = Units.formatAltitude(1000, 'ft', false);
  assert.equal(result.value, '3,281');
  assert.equal(result.unit, 'ft');
  assert.equal(result.prefix, '');
});

test('formatAltitude aldonas + prefikson por pozitivaj relativaj valoroj', () => {
  const result = Units.formatAltitude(100, 'm', true);
  assert.equal(result.prefix, '+');
  assert.equal(result.value, '100');
});

test('formatAltitude aldonas - prefikson por negativaj relativaj valoroj', () => {
  const result = Units.formatAltitude(-50, 'm', true);
  assert.equal(result.prefix, '');
  assert.equal(result.value, '-50');
});

test('formatAltitude traktas null-valorojn', () => {
  const result = Units.formatAltitude(null, 'm', false);
  assert.equal(result.value, '—');
  assert.equal(result.unit, 'm');
});

test('formatAccuracy formatas precizecon en metroj', () => {
  assert.equal(Units.formatAccuracy(15, 'm'), '±15 m');
  assert.equal(Units.formatAccuracy(0, 'm'), '±0 m');
});

test('formatAccuracy formatas precizecon en futoj', () => {
  const result = Units.formatAccuracy(10, 'ft');
  assert.ok(result.includes('±'));
  assert.ok(result.includes('ft'));
});

test('formatAccuracy traktas null-valorojn', () => {
  assert.equal(Units.formatAccuracy(null, 'm'), '');
  assert.equal(Units.formatAccuracy(undefined, 'ft'), '');
});

test('getUnitLabel redonas ĝustajn etikedojn', () => {
  assert.equal(Units.getUnitLabel('m'), 'm');
  assert.equal(Units.getUnitLabel('ft'), 'ft');
});

// --- Rezultoj ---
console.log('\n' + '='.repeat(50));
console.log(`Testoj: ${results.passed + results.failed}`);
console.log(`Sukcesaj: ${results.passed}`);
console.log(`Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));

if (results.failed > 0) {
  process.exit(1);
}
