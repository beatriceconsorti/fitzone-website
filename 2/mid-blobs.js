(() => {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('fx-mid');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const BLOB_COUNT = window.innerWidth > 1200 ? 3 : window.innerWidth > 700 ? 2 : 1;
  const COLORS = [
    'rgba(20,20,20,0.10)',
    'rgba(255,77,0,0.14)',
    'rgba(58,58,56,0.09)',
    'rgba(20,20,20,0.08)'
  ];
  const INFLUENCE = 340;
  const STRENGTH = 130;
  const OPPOSITE_STRENGTH = 42;
  const WIGGLE = 3;

  let W = 0, H = 0, DOC_H = 0;
  const mouse = { x: -1000, y: -1000 };
  let time = 0;

  function docHeight() {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, H);
  }

  function makeBlob() {
    const r = 100 + Math.random() * 80;
    const margin = r + 40;
    const x = margin + Math.random() * Math.max(W - margin * 2, 1);
    const y = margin + Math.random() * Math.max(DOC_H - margin * 2, 1);
    const isTriangle = Math.random() < 0.3;
    const n = isTriangle ? 3 : 20 + Math.floor(Math.random() * 8);
    const verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      verts.push({ angle: a, baseR: r });
    }
    return { x, y, r, verts, color: COLORS[Math.floor(Math.random() * COLORS.length)], phase: Math.random() * Math.PI * 2 };
  }

  const blobs = [];

  function scatter() {
    blobs.length = 0;
    DOC_H = docHeight();
    for (let i = 0; i < BLOB_COUNT; i++) blobs.push(makeBlob());
    window.__azimuthMidBlobs = blobs;
  }

  function onPointer(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY + (window.pageYOffset || document.documentElement.scrollTop);
  }

  addEventListener('mousemove', onPointer, { passive: true });
  addEventListener('touchmove', onPointer, { passive: true });
  addEventListener('touchstart', onPointer, { passive: true });

  function drawBlob(points) {
    const n = points.length;
    const mid = (a, b) => ({ x: (a.x + b.x) * 0.5, y: (a.y + b.y) * 0.5 });

    ctx.moveTo(mid(points[n - 1], points[0]).x, mid(points[n - 1], points[0]).y);
    for (let i = 0; i < n; i++) {
      const p = points[i];
      const next = points[(i + 1) % n];
      const m = mid(p, next);
      ctx.quadraticCurveTo(p.x, p.y, m.x, m.y);
    }
  }

  function tick() {
    time += 0.01;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (const b of blobs) {
      const sy = b.y - scrollY;
      if (sy < -b.r - 80 || sy > H + b.r + 80) continue;

      const dx = mouse.x - b.x;
      const dy = mouse.y - b.y;
      const d = Math.hypot(dx, dy);
      const mouseAngle = Math.atan2(dy, dx);
      const falloff = d < INFLUENCE ? 1 - d / INFLUENCE : 0;

      const points = [];
      for (const v of b.verts) {
        const idle = Math.sin(v.angle * 3 + time + b.phase) * WIGGLE;
        const align = Math.max(0, Math.cos(v.angle - mouseAngle));
        const opposite = Math.max(0, Math.cos(v.angle - mouseAngle + Math.PI));
        const r = v.baseR + idle + falloff * (STRENGTH * Math.pow(align, 2) - OPPOSITE_STRENGTH * Math.pow(opposite, 3));
        points.push({
          x: b.x + Math.cos(v.angle) * r,
          y: sy + Math.sin(v.angle) * r
        });
      }

      ctx.save();
      ctx.beginPath();
      drawBlob(points);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
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