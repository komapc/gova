/**
 * saved-points.test.js — Testoj por SavedPoints-modulo
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

if (typeof SavedPoints === 'undefined') {
  console.error('❌ SavedPoints module not loaded');
  if (typeof process !== 'undefined') process.exit(1);
  throw new Error('SavedPoints module not loaded - use browser test runner');
}

const results = { passed: 0, failed: 0 };

function test(name, fn) {
  try {
    localStorage.removeItem('gova_saved_points');
    localStorage.removeItem('gova_today_high');
    localStorage.removeItem('gova_today_low');
    localStorage.removeItem('gova_last_reset_date');
  } catch {}
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

test('getAll redonas malplenan tabelon komence', () => {
  assert.equal(SavedPoints.getAll().length, 0);
});

test('save konservas punkton kun aŭto-nomo', () => {
  const p = SavedPoints.save(500, 50, 14);
  assert.ok(p);
  assert.equal(p.altitude, 500);
  assert.ok(p.name.includes('Punkto'));
  assert.equal(SavedPoints.getAll().length, 1);
});

test('save akceptas eksplicitan nomon', () => {
  const p = SavedPoints.save(500, 50, 14, 'Pinto');
  assert.equal(p.name, 'Pinto');
});

test('remove forigas punkton per ID', () => {
  const p = SavedPoints.save(500, 50, 14);
  SavedPoints.remove(p.id);
  assert.equal(SavedPoints.getAll().length, 0);
});

test('rename ŝanĝas nomon', () => {
  const p = SavedPoints.save(500, 50, 14);
  SavedPoints.rename(p.id, 'Nova Nomo');
  const updated = SavedPoints.getAll().find(x => x.id === p.id);
  assert.equal(updated.name, 'Nova Nomo');
});

test('updateTodayPoints registras maksimumon', () => {
  SavedPoints.updateTodayPoints(100, 50, 14);
  SavedPoints.updateTodayPoints(200, 50, 14);
  SavedPoints.updateTodayPoints(150, 50, 14);
  assert.equal(SavedPoints.getTodayHigh().altitude, 200);
});

test('updateTodayPoints registras minimumon', () => {
  SavedPoints.updateTodayPoints(100, 50, 14);
  SavedPoints.updateTodayPoints(50, 50, 14);
  SavedPoints.updateTodayPoints(80, 50, 14);
  assert.equal(SavedPoints.getTodayLow().altitude, 50);
});

test('getSummary redonas kalkulon kaj hodiaŭajn punktojn', () => {
  SavedPoints.save(500, 50, 14);
  SavedPoints.updateTodayPoints(500, 50, 14);
  const s = SavedPoints.getSummary();
  assert.equal(s.count, 1);
  assert.ok(s.todayHigh);
});

test('save rifuzas ĉe la limo (20) anstataŭ forigi la plej malnovan', () => {
  for (let i = 0; i < 20; i++) assert.ok(SavedPoints.save(100 + i, 50, 14), `punkto ${i + 1}`);
  assert.ok(SavedPoints.isFull());
  const first = SavedPoints.getAll()[0];
  assert.equal(SavedPoints.save(999, 50, 14), null, '21-a punkto devas esti rifuzita');
  const all = SavedPoints.getAll();
  assert.equal(all.length, 20);
  assert.equal(all[0].id, first.id, 'la plej malnova punkto restas');
});

test('save donas unikajn ID-ojn eĉ en la sama milisekundo', () => {
  for (let i = 0; i < 5; i++) SavedPoints.save(100, 50, 14);
  const ids = SavedPoints.getAll().map(p => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('defaŭltaj nomoj ne ripetiĝas post forigo', () => {
  SavedPoints.save(100, 50, 14); // Punkto 1
  const p2 = SavedPoints.save(100, 50, 14); // Punkto 2
  SavedPoints.save(100, 50, 14); // Punkto 3
  SavedPoints.remove(p2.id);
  const p4 = SavedPoints.save(100, 50, 14);
  assert.equal(p4.name, 'Punkto 4');
  const names = SavedPoints.getAll().map(p => p.name);
  assert.equal(new Set(names).size, names.length);
});

test('updateTodayPoints ne ĵetas se localStorage estas blokita', () => {
  const orig = { get: localStorage.getItem, set: localStorage.setItem, rm: localStorage.removeItem };
  const boom = () => { throw new Error('SecurityError'); };
  localStorage.getItem = boom; localStorage.setItem = boom; localStorage.removeItem = boom;
  try {
    SavedPoints.updateTodayPoints(100, 50, 14);
    assert.equal(SavedPoints.getTodayHigh(), null);
  } finally {
    localStorage.getItem = orig.get; localStorage.setItem = orig.set; localStorage.removeItem = orig.rm;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`SavedPoints — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));
if (results.failed > 0 && typeof process !== 'undefined') process.exit(1);
