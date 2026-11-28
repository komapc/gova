'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');

// Single shared context — modules and tests use the same localStorage
let _store = {};
const ctx = vm.createContext({
  console,
  navigator: { language: 'eo', doNotTrack: null, onLine: true },
  localStorage: {
    getItem: k => Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : null,
    setItem: (k, v) => { _store[k] = String(v); },
    removeItem: k => { delete _store[k]; },
    clear: () => { _store = {}; }
  },
  // geoid.js decodes its base64 grid via atob (a browser global)
  atob: typeof atob === 'function' ? atob : (s => Buffer.from(s, 'base64').toString('binary')),
  Uint8Array, DataView, Int16Array
});
ctx.global = ctx;

function exec(relPath) {
  const code = fs.readFileSync(path.join(root, relPath), 'utf-8');
  vm.runInContext(code, ctx, { filename: relPath, displayErrors: true });
}

function execWrapped(relPath) {
  const code = fs.readFileSync(path.join(root, relPath), 'utf-8');
  // IIFE wrapper gives each test file its own scope for const/let/function
  // while still seeing context globals (Units, Storage, localStorage, etc.)
  vm.runInContext(`(function(){\n${code}\n})();`, ctx, { filename: relPath, displayErrors: true });
}

// Load source modules into the shared context
exec('js/units.js');
exec('js/storage.js');
exec('js/history.js');
exec('js/saved-points.js');
exec('js/coords.js');
exec('js/i18n.js');
exec('js/gps.js');
exec('js/geoid.js');

// Intercept process.exit so all suites run even if one fails
let overallFailed = 0;
ctx.process = { exit: (code) => { if (code) overallFailed = code; } };

// Test files call test(name, fn) and optionally beforeEach(fn). The runner runs
// the tests one by one and awaits each, so an async test that rejects fails the
// run (before, its promise was dropped and the test was counted as passed).
let registered = [];
let setupFn = null;
ctx.test = (name, fn) => { registered.push({ name, fn }); };
ctx.beforeEach = (fn) => { setupFn = fn; };

const LOG = { ok: msg => console.log(msg), fail: msg => console.error(msg) };

async function runTests(tests, setup, log) {
  let passed = 0, failed = 0;
  for (const { name, fn } of tests) {
    try {
      if (setup) await setup();
      await fn();
      passed++;
      log.ok(`✓ ${name}`);
    } catch (err) {
      failed++;
      log.fail(`✗ ${name}\n  ${err && err.message ? err.message : err}`);
    }
  }
  return { passed, failed };
}

// The harness itself: async failures, before or after an await, must count.
async function selfTest() {
  const quiet = { ok() {}, fail() {} };
  const { passed, failed } = await runTests([
    { name: 'rejects after await', fn: async () => { await null; throw new Error('x'); } },
    { name: 'rejects at once', fn: async () => { throw new Error('x'); } },
    { name: 'sync throw', fn: () => { throw new Error('x'); } },
    { name: 'resolves after await', fn: async () => { await null; } },
  ], null, quiet);
  return passed === 1 && failed === 3;
}

async function runSuite(label, relPath) {
  registered = [];
  setupFn = null;
  try {
    execWrapped(relPath);
  } catch (err) {
    console.error(`✗ ${relPath}: ${err.message}`);
    overallFailed = 1;
    return;
  }
  const { passed, failed } = await runTests(registered, setupFn, LOG);
  console.log('\n' + '='.repeat(50));
  console.log(`${label} — Sukcesaj: ${passed}, Malsukcesaj: ${failed}`);
  console.log('='.repeat(50) + '\n');
  if (failed) overallFailed = 1;
  if (!registered.length) {
    console.error(`✗ ${relPath} registered no tests`);
    overallFailed = 1;
  }
}

// New test files must be added here.
const SUITES = [
  ['Units', 'tests/units.test.js'],
  ['Storage', 'tests/storage.test.js'],
  ['History', 'tests/history.test.js'],
  ['SavedPoints', 'tests/saved-points.test.js'],
  ['Coords', 'tests/coords.test.js'],
  ['GPS', 'tests/gps.test.js'],
  ['Geoid', 'tests/geoid.test.js'],
];

(async () => {
  if (await selfTest()) {
    console.log('✓ Runner: async test failures are caught\n');
  } else {
    console.error('✗ Runner: an async test failure was not caught');
    overallFailed = 1;
  }

  console.log('Running test suites...\n');
  for (const [label, file] of SUITES) await runSuite(label, file);

  // Generated language pages (/, /ru/, /eo/) must match index.html + js/i18n.js
  const stale = require('../scripts/build-lang-pages.cjs').check();
  if (stale.length) {
    console.error(`\n✗ Stale language pages: ${stale.join(', ')} — run: npm run build:lang`);
    overallFailed = 1;
  } else {
    console.log('✓ Language pages (/, /ru/, /eo/) up to date');
  }

  process.exit(overallFailed);
})().catch(err => { console.error(err); process.exit(1); });
