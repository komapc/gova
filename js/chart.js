/**
 * chart.js — Simpla grafiko-desegnilo por Gova
 */

const Chart = (() => {
  /**
   * Desegnas linean grafikon sur canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {Array} data - Array de {timestamp, altitude}
   * @param {Object} options - Opcioj
   */
  function drawLine(canvas, data, options = {}) {
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const {
      lineColor = '#2563EB',
      fillColor = 'rgba(37, 99, 235, 0.1)',
      gridColor = 'rgba(255, 255, 255, 0.1)',
      textColor = '#9CA3AF',
      showGrid = true,
      showLabels = true,
      padding = 40
    } = options;

    // Viŝi canvas
    ctx.clearRect(0, 0, width, height);

    // Kalkuli min/max
    const altitudes = data.map(d => d.altitude);
    const minAlt = Math.min(...altitudes);
    const maxAlt = Math.max(...altitudes);
    const range = maxAlt - minAlt || 1;

    const minTime = data[0].timestamp;
    const maxTime = data[data.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;

    // Desegna areo
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Funkcio por mapigi valorojn al koordinatoj
    const xScale = (timestamp) => {
      return padding + ((timestamp - minTime) / timeRange) * chartWidth;
    };

    const yScale = (altitude) => {
      return height - padding - ((altitude - minAlt) / range) * chartHeight;
    };

    // Desegni kradon
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Horizontalaj linioj (5 linioj)
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Vertikalaj linioj (4 linioj)
      for (let i = 0; i <= 3; i++) {
        const x = padding + (chartWidth / 3) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
    }

    // Desegni etikedojn
    if (showLabels) {
      ctx.fillStyle = textColor;
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'right';

      // Y-akso etikedoj
      for (let i = 0; i <= 4; i++) {
        const alt = minAlt + (range / 4) * (4 - i);
        const y = padding + (chartHeight / 4) * i;
        ctx.fillText(Math.round(alt) + 'm', padding - 10, y + 4);
      }

      // X-akso etikedoj (tempo)
      ctx.textAlign = 'center';
      for (let i = 0; i <= 3; i++) {
        const time = minTime + (timeRange / 3) * i;
        const x = padding + (chartWidth / 3) * i;
        const date = new Date(time);
        const label = date.toLocaleTimeString('eo', { hour: '2-digit', minute: '2-digit' });
        ctx.fillText(label, x, height - padding + 20);
      }
    }

    // Desegni plenigan areon
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(xScale(data[0].timestamp), height - padding);
    
    data.forEach(point => {
      ctx.lineTo(xScale(point.timestamp), yScale(point.altitude));
    });
    
    ctx.lineTo(xScale(data[data.length - 1].timestamp), height - padding);
    ctx.closePath();
    ctx.fill();

    // Desegni lineon
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    data.forEach((point, i) => {
      const x = xScale(point.timestamp);
      const y = yScale(point.altitude);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  /**
   * Redimensias canvas por retina-ekranoj.
   * @param {HTMLCanvasElement} canvas
   */
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  }

  return {
    drawLine,
    setupCanvas
  };
})();
