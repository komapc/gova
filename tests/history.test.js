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

// --- Maldensigo: 7 tagoj devas eniri la 1000-eran limon ---

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Anstataŭigas Date.now dum fn() kaj ĉiam restarigas ĝin
function withFakeNow(start, fn) {
  const realNow = Date.now;
  let now = start;
  Date.now = () => now;
  try {
    fn({ advance: (ms) => { now += ms; }, get: () => now });
  } finally {
    Date.now = realNow;
  }
}

test('maldensigo: 7 tagoj da 1-min-datumoj eniras la limon post unu add', () => {
  withFakeNow(1.7e12, (clock) => {
    // Antaŭplenigi 7 tagojn je 1 ero/min (10080 eroj — multe super la limo)
    const seed = [];
    const start = clock.get();
    for (let t = 0; t < 7 * DAY_MS; t += 60 * 1000) {
      seed.push({ timestamp: start + t, altitude: 100 + (t / 60000) % 50, accuracy: 5, latitude: 50, longitude: 14 });
    }
    localStorage.setItem('gova_history', JSON.stringify(seed));
    clock.advance(7 * DAY_MS);
    History.add(500, 5, 51, 15);

    const all = History.getAll();
    assert.ok(all.length <= 1000, `longo ${all.length} > 1000`);
    assert.ok(all.length > 800, `longo ${all.length} tro malgranda`);
    const spanH = (all[all.length - 1].timestamp - all[0].timestamp) / HOUR_MS;
    assert.ok(spanH >= 167.9, `daŭro ${spanH.toFixed(1)} h < 7 tagoj`);
    assert.equal(all[all.length - 1].altitude, 500, 'plej nova ero konservita');
    // Plej novaj 300 eroj netuŝitaj: ankoraŭ 1-min-rezolucio
    const tail = all.slice(-300, -1);
    for (let i = 1; i < tail.length; i++) {
      assert.equal(tail[i].timestamp - tail[i - 1].timestamp, 60 * 1000, 'plena rezolucio en la plej novaj eroj');
    }
    // Ordigita laŭ tempo
    for (let i = 1; i < all.length; i++) {
      assert.ok(all[i].timestamp > all[i - 1].timestamp, 'ordo');
    }
  });
});

test('maldensigo: kontinua 7-taga simulado plenigas la 24h- kaj 7d-vidojn', () => {
  withFakeNow(1.7e12, (clock) => {
    const step = 8 * 60 * 1000; // 8 min — 1260 add() dum 7 tagoj (rapida testo)
    const n = (7 * DAY_MS) / step;
    for (let i = 0; i < n; i++) {
      clock.advance(step);
      // Determinisma movo (sen Math.random): alteco ŝanĝiĝas ĉiufoje
      History.add(100 + 20 * Math.sin(i / 10), 5, 50 + 0.001 * Math.sin(i / 7), 14);
    }
    const all = History.getAll();
    assert.ok(all.length <= 1000, `longo ${all.length} > 1000`);
    const spanH = (all[all.length - 1].timestamp - all[0].timestamp) / HOUR_MS;
    assert.ok(spanH >= 167, `daŭro ${spanH.toFixed(1)} h < 7 tagoj`);
    // 24h-vido: ĉiuj 180 eroj de la lasta tago (8-min-paŝo > 5-min-sitelo)
    const last24 = History.getRecent(24).length;
    assert.ok(last24 >= 175, `24h-vido havas nur ${last24} erojn`);
  });
});

console.log('\n' + '='.repeat(50));
console.log(`History — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));
if (results.failed > 0 && typeof process !== 'undefined') process.exit(1);
