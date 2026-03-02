/**
 * storage.test.js — Testoj por Storage-modulo
 * NOTO: Ĉi tiu testo bezonas retumilan medion. Malfermu tests/run-tests.html
 */

// Mock localStorage por testa medio
if (typeof localStorage === 'undefined') {
  global.localStorage = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();
}

// Simpla test-kadro
const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) {
      throw new Error(`${msg || 'Assertion failed'}: expected ${expected}, got ${actual}`);
    }
  },
  strictEqual: (actual, expected, msg) => {
    if (actual !== expected) {
      throw new Error(`${msg || 'Strict assertion failed'}: expected ${expected}, got ${actual}`);
    }
  },
  ok: (value, msg) => {
    if (!value) {
      throw new Error(msg || 'Assertion failed: expected truthy value');
    }
  }
};

// Kontroli ĉu Storage-modulo estas ŝargita
if (typeof Storage === 'undefined') {
  console.error('❌ Storage module not loaded');
  console.error('ℹ️  This test requires a browser environment.');
  console.error('ℹ️  Please open tests/run-tests.html in your browser.');
  if (typeof process !== 'undefined') {
    process.exit(1);
  }
  throw new Error('Storage module not loaded - use browser test runner');
}

// Test-rezultoj
const results = { passed: 0, failed: 0, tests: [] };

function test(name, fn) {
  localStorage.clear();
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

test('getUnit redonas defaŭltan valoron', () => {
  assert.equal(Storage.getUnit(), 'm');
});

test('setUnit kaj getUnit funkcias kune', () => {
  Storage.setUnit('ft');
  assert.equal(Storage.getUnit(), 'ft');
  Storage.setUnit('m');
  assert.equal(Storage.getUnit(), 'm');
});

test('getLastAlt redonas null kiam ne agordita', () => {
  assert.strictEqual(Storage.getLastAlt(), null);
});

test('setLastAlt kaj getLastAlt funkcias kune', () => {
  Storage.setLastAlt(1234.5);
  assert.equal(Storage.getLastAlt(), 1234.5);
});

test('getLastAccuracy redonas null kiam ne agordita', () => {
  assert.strictEqual(Storage.getLastAccuracy(), null);
});

test('setLastAccuracy kaj getLastAccuracy funkcias kune', () => {
  Storage.setLastAccuracy(15.7);
  assert.equal(Storage.getLastAccuracy(), 15.7);
});

test('getLastLocation redonas null kiam ne agordita', () => {
  assert.strictEqual(Storage.getLastLocation(), null);
});

test('setLastLocation kaj getLastLocation funkcias kune', () => {
  Storage.setLastLocation('Parizo');
  assert.equal(Storage.getLastLocation(), 'Parizo');
});

test('clearLastLocation forigas lokon', () => {
  Storage.setLastLocation('Berlino');
  Storage.clearLastLocation();
  assert.strictEqual(Storage.getLastLocation(), null);
});

test('getBaseHeight redonas null kiam ne agordita', () => {
  assert.strictEqual(Storage.getBaseHeight(), null);
});

test('setBaseHeight kaj getBaseHeight funkcias kune', () => {
  Storage.setBaseHeight(500);
  assert.equal(Storage.getBaseHeight(), 500);
});

test('clearBaseHeight forigas bazan altecon', () => {
  Storage.setBaseHeight(300);
  Storage.clearBaseHeight();
  assert.strictEqual(Storage.getBaseHeight(), null);
});

test('hasBaseHeight redonas false kiam ne agordita', () => {
  assert.equal(Storage.hasBaseHeight(), false);
});

test('hasBaseHeight redonas true kiam agordita', () => {
  Storage.setBaseHeight(100);
  assert.equal(Storage.hasBaseHeight(), true);
});

test('Storage traktas nevalidajn nombrajn valorojn', () => {
  localStorage.setItem('gova_last_altitude', 'invalid');
  assert.strictEqual(Storage.getLastAlt(), null);
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
