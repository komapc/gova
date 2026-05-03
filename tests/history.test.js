/**
 * history.test.js — Testoj por History-modulo
 * NOTO: Bezonas retumilan medion. Malfermu tests/run-tests.html
 */

const assert = {
  equal: (a, b, msg) => {
    if (a !== b) throw new Error(`${msg || 'Assertion failed'}: expected ${b}, got ${a}`);
  },
  ok: (v, msg) => {
    if (!v) throw new Error(msg || 'Assertion failed: expected truthy value');
  },
};

if (typeof History === 'undefined') {
  console.error('❌ History module not loaded');
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error('History module not loaded - use browser test runner');
}

const results = { passed: 0, failed: 0 };

function test(name, fn) {
  try { localStorage.removeItem('gova_history'); } catch {}
  try {
    fn();
    results.passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    results.failed++;
    console.error(`✗ ${name}: ${err.message}`);
  }
}

// --- Testoj ---

test('getAll redonas malplenan tabelon kiam neniu historio', () => {
  assert.equal(History.getAll().length, 0);
});

test('add konservas registron', () => {
  History.add(100, 5, 50.0, 14.0);
  const all = History.getAll();
  assert.equal(all.length, 1);
  assert.equal(all[0].altitude, 100);
  assert.equal(all[0].accuracy, 5);
});

test('add rondigas altecon al 1 decimalo', () => {
  History.add(100.789, 5, 50, 14);
  assert.equal(History.getAll()[0].altitude, 100.8);
});

test('add ignoras tujajn duobligojn (throttling)', () => {
  History.add(100, 5, 50, 14);
  History.add(100, 5, 50, 14); // sama tempo, sama loko, sama alteco
  assert.equal(History.getAll().length, 1);
});

test('add akceptas sufiĉan ŝanĝon de alteco', () => {
  History.add(100, 5, 50, 14);
  History.add(101, 5, 50, 14); // +1m > sojlo
  assert.equal(History.getAll().length, 2);
});

test('add ignoras malgrandan ŝanĝon ene de mallonga tempo', () => {
  History.add(100, 5, 50, 14);
  History.add(100.2, 5, 50, 14); // +0.2m < 0.5m sojlo, sub 30s
  assert.equal(History.getAll().length, 1);
});

test('add akceptas sufiĉan ŝanĝon de pozicio', () => {
  History.add(100, 5, 50.0, 14.0);
  History.add(100, 5, 50.001, 14.0); // ~111m for
  assert.equal(History.getAll().length, 2);
});

test('getStats redonas nulajn valorojn por malplena historio', () => {
  const s = History.getStats(24);
  assert.equal(s.count, 0);
  assert.equal(s.min, null);
  assert.equal(s.max, null);
});

test('getStats kalkulas min/max/avg', () => {
  History.add(100, 5, 50, 14);
  History.add(120, 5, 50.001, 14); // sufiĉa pozicia ŝanĝo
  History.add(80, 5, 50.002, 14);
  const s = History.getStats(24);
  assert.equal(s.count, 3);
  assert.equal(s.min, 80);
  assert.equal(s.max, 120);
  assert.equal(s.range, 40);
});

test('exportCSV produktas validan kapan vicon', () => {
  History.add(100, 5, 50, 14);
  const csv = History.exportCSV();
  assert.ok(csv.startsWith('Timestamp,Date,Time,Altitude (m)'));
});

test('clear forigas ĉion', () => {
  History.add(100, 5, 50, 14);
  History.clear();
  assert.equal(History.getAll().length, 0);
});

console.log('\n' + '='.repeat(50));
console.log(`History — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));
if (results.failed > 0 && typeof process !== 'undefined') process.exit(1);
