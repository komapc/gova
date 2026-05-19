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
  }
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

// Intercept process.exit so all suites run even if one fails
let overallFailed = 0;
ctx.process = { exit: (code) => { if (code) overallFailed = code; } };

console.log('Running test suites...\n');
execWrapped('tests/units.test.js');
execWrapped('tests/storage.test.js');
execWrapped('tests/history.test.js');
execWrapped('tests/saved-points.test.js');

process.exit(overallFailed);
