(() => {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('fx-shapes');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const SHAPE_COUNT = window.innerWidth > 1200 ? 28 : window.innerWidth > 700 ? 20 : 14;
  const TYPES = ['triangle', 'square', 'diamond', 'line', 'hexagon', 'soft-triangle'];
  const COLORS = [
    'rgba(20,20,20,0.35)',
    'rgba(255,77,0,0.40)',
    'rgba(58,58,56,0.30)',
    'rgba(20,20,20,0.25)',
    'rgba(255,77,0,0.30)'
  ];

  let W = 0, H = 0, DOC_H = 0;
  const mouse = { x: -1000, y: -1000 };

  function docHeight() {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, H);
  }

  function makeShape() {
    const size = 16 + Math.random() * 28;
    const x = size + Math.random() * Math.max(W - size * 2, 1);
    const y = size + Math.random() * Math.max(DOC_H - size * 2, 1);
    return {
      x, y, size,
      type: TYPES[Math.floor(Math.random() * TYPES.length)],
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      driftX: (Math.random() - 0.5) * 0.25,
      driftY: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2
    };
  }

  const shapes = [];

  function scatter() {
    shapes.length = 0;
    DOC_H = docHeight();
    for (let i = 0; i < SHAPE_COUNT; i++) shapes.push(makeShape());
  }

  function onPointer(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY + (window.pageYOffset || document.documentElement.scrollTop);
  }

  addEventListener('mousemove', onPointer, { passive: true });
  addEventListener('touchmove', onPointer, { passive: true });
  addEventListener('touchstart', onPointer, { passive: true });

  function drawShape(s, screenX, screenY) {
    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(s.angle);
    ctx.fillStyle = s.color;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.5;

    const r = s.size / 2;

    switch (s.type) {
      case 'triangle': {
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(-r * 0.866, r * 0.5);
        ctx.lineTo(r * 0.866, r * 0.5);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'square': {
        ctx.fillRect(-r, -r, s.size, s.size);
        break;
      }
      case 'diamond': {
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'line': {
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.lineTo(r, 0);
        ctx.stroke();
        break;
      }
      case 'hexagon': {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const hx = Math.cos(a) * r;
          const hy = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'soft-triangle': {
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(-r * 0.4, -r * 0.2, -r * 0.866, r * 0.5);
        ctx.quadraticCurveTo(0, r * 0.7, r * 0.866, r * 0.5);
        ctx.quadraticCurveTo(r * 0.4, -r * 0.2, 0, -r);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
    ctx.restore();
  }

  function tick() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (const s of shapes) {
      const sy = s.y - scrollY;
      if (sy < -s.size - 20 || sy > H + s.size + 20) continue;

      const dx = mouse.x - s.x;
      const dy = mouse.y - s.y;
      const d = Math.hypot(dx, dy);
      const influence = d < 200 ? (1 - d / 200) : 0;

      s.x += s.driftX + Math.sin(s.phase) * 0.2;
      s.y += s.driftY + Math.cos(s.phase) * 0.15;
      s.angle += s.rotSpeed + influence * 0.06;
      s.phase += 0.01;

      if (s.x < -50) s.x = W + 50;
      if (s.x > W + 50) s.x = -50;
      if (s.y < -50) s.y = DOC_H + 50;
      if (s.y > DOC_H + 50) s.y = -50;

      drawShape(s, s.x, sy);
    }

    requestAnimationFrame(tick);
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    scatter();
  }

  resize();
  addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { once: true });

  requestAnimationFrame(tick);
})();