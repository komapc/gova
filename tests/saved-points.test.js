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

console.log('\n' + '='.repeat(50));
console.log(`SavedPoints — Sukcesaj: ${results.passed}, Malsukcesaj: ${results.failed}`);
console.log('='.repeat(50));
if (results.failed > 0 && typeof process !== 'undefined') process.exit(1);
