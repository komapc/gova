/**
 * points-page.js — Konservitaj-punktoj paĝo (eltirita el points.html por strikta CSP)
 */

(() => {
  'use strict';

  const elPointsList = document.getElementById('points-list');
  const elNoData = document.getElementById('no-data');

  let currentUnit = Storage.getUnit();

  // Point names are user-editable (rename prompt) and rendered via innerHTML,
  // so escape them to prevent stored HTML/script injection into the page.
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function renderPoints() {
    const points = SavedPoints.getAll();

    if (points.length === 0) {
      elNoData.classList.remove('hidden');
      elPointsList.innerHTML = '';
      return;
    }

    elNoData.classList.add('hidden');
    elPointsList.innerHTML = points.reverse().map(point => {
      const formatted = Units.formatAltitude(point.altitude, currentUnit, false);
      const date = new Date(point.timestamp).toLocaleString('eo', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="point-card" data-id="${point.id}">
          <div class="point-info">
            <div class="point-name">${escapeHtml(point.name)}</div>
            <div class="point-meta">${date} | ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}</div>
          </div>
          <div class="point-altitude">${formatted.value} ${formatted.unit}</div>
          <div class="point-actions">
            <a href="https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=15/${point.latitude}/${point.longitude}" target="_blank" class="btn-small" title="Vidi sur mapo">🗺️</a>
            <button class="btn-small btn-rename" title="Renomi">✏️</button>
            <button class="btn-small btn-delete" title="${I18n.get('deletePoint')}">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    // Okazaĵ-aŭskultiloj por butonoj
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.closest('.point-card').dataset.id);
        if (confirm(I18n.get('deletePoint') + '?')) {
          SavedPoints.remove(id);
          renderPoints();
        }
      });
    });

    document.querySelectorAll('.btn-rename').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.point-card');
        const id = parseInt(card.dataset.id);
        const oldName = card.querySelector('.point-name').textContent;
        const newName = prompt('Nova nomo:', oldName);
        if (newName && newName.trim()) {
          SavedPoints.rename(id, newName.trim());
          renderPoints();
        }
      });
    });
  }

  I18n.init();
  Theme.init();
  renderPoints();
})();
