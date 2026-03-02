/**
 * chart.js — Simpla grafiko-desegnilo por Gova
 */

const Chart = (() => {
  /**
   * Desegnas linean grafikon sur canvas kun glatigo kaj gradientoj.
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
      gridColor = 'rgba(255, 255, 255, 0.05)',
      textColor = '#9CA3AF',
      showGrid = true,
      showLabels = true,
      padding = 50,
      smooth = true
    } = options;

    // Viŝi canvas
    ctx.clearRect(0, 0, width, height);

    // Kalkuli min/max por skali
    const altitudes = data.map(d => d.altitude);
    const minAlt = Math.min(...altitudes);
    const maxAlt = Math.max(...altitudes);
    const altRange = maxAlt - minAlt || 10; // minimume 10m gamo por aspekto
    
    // Aldoni iom da "spiro" supre kaj malsupre
    const displayMin = minAlt - altRange * 0.1;
    const displayMax = maxAlt + altRange * 0.1;
    const displayRange = displayMax - displayMin;

    const minTime = data[0].timestamp;
    const maxTime = data[data.length - 1].timestamp;
    const timeRange = maxTime - minTime || 1;

    // Desegna areo
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Funkcioj por mapigi valorojn al koordinatoj
    const xScale = (timestamp) => {
      return padding + ((timestamp - minTime) / timeRange) * chartWidth;
    };

    const yScale = (altitude) => {
      return height - padding - ((altitude - displayMin) / displayRange) * chartHeight;
    };

    // 1. Desegni kradon
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      // Horizontalaj linioj
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 2. Desegni etikedojn
    if (showLabels) {
      ctx.fillStyle = textColor;
      ctx.font = '500 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let i = 0; i <= 4; i++) {
        const alt = displayMax - (displayRange / 4) * i;
        const y = padding + (chartHeight / 4) * i;
        ctx.fillText(Math.round(alt) + ' m', padding - 12, y);
      }

      ctx.textAlign = 'center';
      const steps = data.length > 5 ? 3 : 1;
      for (let i = 0; i <= steps; i++) {
        const time = minTime + (timeRange / steps) * i;
        const x = padding + (chartWidth / steps) * i;
        const date = new Date(time);
        const label = date.toLocaleTimeString('eo', { hour: '2-digit', minute: '2-digit' });
        ctx.fillText(label, x, height - padding + 25);
      }
    }

    // Prepari punktojn
    const points = data.map(d => ({
      x: xScale(d.timestamp),
      y: yScale(d.altitude)
    }));

    // 3. Desegni gradientan plenigon
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, fillColor.replace('0.1', '0.3').replace('0.2', '0.4'));
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    
    if (smooth && points.length > 2) {
      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    } else {
      points.forEach(p => ctx.lineTo(p.x, p.y));
    }
    
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();

    // 4. Desegni la ĉefan linion
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Aldoni subtilan ombron/brilon
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    if (smooth && points.length > 2) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    } else {
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
    }
    ctx.stroke();
    
    // Forigi ombron por ceteraj elementoj
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 5. Elstarigi ekstremojn (Min/Max)
    const highlightPoint = (point, color, label) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = textColor;
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText(label, point.x, point.y - 12);
    };

    if (points.length > 1) {
      const maxIdx = altitudes.indexOf(maxAlt);
      const minIdx = altitudes.indexOf(minAlt);
      
      highlightPoint(points[maxIdx], '#EF4444', 'MAX');
      highlightPoint(points[minIdx], '#10B981', 'MIN');
    }
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
