/**
 * history-page.js — Historio-paĝa logiko por Gova
 */

(() => {
  'use strict';

  // DOM-Elementoj
  const elBtnBack = document.getElementById('btn-back');
  const elBtnMenu = document.getElementById('btn-menu');
  const elPeriodBtns = document.querySelectorAll('.period-btn');
  const elStatMin = document.getElementById('stat-min');
  const elStatMax = document.getElementById('stat-max');
  const elStatAvg = document.getElementById('stat-avg');
  const elStatRange = document.getElementById('stat-range');
  const elCanvas = document.getElementById('altitude-chart');
  const elNoData = document.getElementById('no-data');
  const elMenuOverlay = document.getElementById('menu-overlay');
  const elBtnExportJSON = document.getElementById('btn-export-json');
  const elBtnExportCSV = document.getElementById('btn-export-csv');
  const elBtnClearHistory = document.getElementById('btn-clear-history');
  const elBtnCloseMenu = document.getElementById('btn-close-menu');

  let currentPeriod = 24; // horoj
  let currentUnit = Storage.getUnit();

  // Inicializi temon
  Theme.init();

  // Ŝarĝi kaj montri datumojn
  function loadData() {
    const hours = currentPeriod === 'all' ? null : currentPeriod;
    const data = hours ? History.getRecent(hours) : History.getAll();

    if (data.length === 0) {
      elNoData.classList.remove('hidden');
      elCanvas.parentElement.classList.add('hidden');
      clearStats();
      return;
    }

    elNoData.classList.add('hidden');
    elCanvas.parentElement.classList.remove('hidden');

    // Ĝisdatigi statistikojn
    const stats = hours ? History.getStats(hours) : History.getStats(999999);
    updateStats(stats);

    // Desegni grafikon
    drawChart(data);
  }

  // Ĝisdatigi statistikojn
  function updateStats(stats) {
    if (stats.count === 0) {
      clearStats();
      return;
    }

    const format = (meters) => {
      if (meters === null) return '—';
      const formatted = Units.formatAltitude(meters, currentUnit, false);
      return `${formatted.value} ${formatted.unit}`;
    };

    elStatMin.textContent = format(stats.min);
    elStatMax.textContent = format(stats.max);
    elStatAvg.textContent = format(stats.avg);
    elStatRange.textContent = format(stats.range);
  }

  // Viŝi statistikojn
  function clearStats() {
    elStatMin.textContent = '—';
    elStatMax.textContent = '—';
    elStatAvg.textContent = '—';
    elStatRange.textContent = '—';
  }

  // Desegni grafikon
  function drawChart(data) {
    Chart.setupCanvas(elCanvas);
    
    const isDark = document.documentElement.classList.contains('dark');
    
    Chart.drawLine(elCanvas, data, {
      lineColor: '#2563EB',
      fillColor: isDark ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDark ? '#9CA3AF' : '#6B7280'
    });
  }

  // Periodo-ŝanĝo
  elPeriodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elPeriodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentPeriod = btn.dataset.period === 'all' ? 'all' : parseInt(btn.dataset.period);
      loadData();
    });
  });

  // Reen-butono
  elBtnBack.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Menuo-butono
  elBtnMenu.addEventListener('click', () => {
    elMenuOverlay.classList.remove('hidden');
  });

  elBtnCloseMenu.addEventListener('click', () => {
    elMenuOverlay.classList.add('hidden');
  });

  elMenuOverlay.addEventListener('click', (e) => {
    if (e.target === elMenuOverlay) {
      elMenuOverlay.classList.add('hidden');
    }
  });

  // Eksporti JSON
  elBtnExportJSON.addEventListener('click', () => {
    const json = History.exportJSON();
    downloadFile('gova-history.json', json, 'application/json');
    elMenuOverlay.classList.add('hidden');
  });

  // Eksporti CSV
  elBtnExportCSV.addEventListener('click', () => {
    const csv = History.exportCSV();
    downloadFile('gova-history.csv', csv, 'text/csv');
    elMenuOverlay.classList.add('hidden');
  });

  // Forigi historion
  elBtnClearHistory.addEventListener('click', () => {
    if (confirm('Ĉu vi certas ke vi volas forigi ĉiujn historio-datumojn?')) {
      History.clear();
      elMenuOverlay.classList.add('hidden');
      loadData();
    }
  });

  // Helpa funkcio por elŝuti dosieron
  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Redimensii grafikon kiam fenestro ŝanĝiĝas
  window.addEventListener('resize', () => {
    if (!elNoData.classList.contains('hidden')) return;
    const hours = currentPeriod === 'all' ? null : currentPeriod;
    const data = hours ? History.getRecent(hours) : History.getAll();
    if (data.length > 0) {
      drawChart(data);
    }
  });

  // Inicializi
  loadData();
})();
