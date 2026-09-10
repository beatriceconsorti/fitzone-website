(() => {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('fx-balls');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const { Engine, World, Bodies, Body } = Matter;

  const engine = Engine.create();
  engine.gravity.y = 0.75;
  const world = engine.world;

  const COLORS = [
    'rgba(20,20,20,0.9)',
    'rgba(255,77,0,0.9)',
    'rgba(58,58,56,0.9)',
    'rgba(20,20,20,0.85)'
  ];

  let W = 0, H = 0;
  let scrollTop = 0;
  let maxBalls = 45;
  let spawnTimer = 80;
  let wallL = null, wallR = null, floor = null;
  const balls = [];
  const blobBodies = [];
  const mouse = { active: false, x: 0, y: 0 };

  function getBlobs() {
    return [
      ...(window.__azimuthBlobs || []),
      ...(window.__azimuthMidBlobs || [])
    ];
  }

  function makeBoundaries() {
    floor = Bodies.rectangle(0, 0, 1, 1, { isStatic: true, restitution: 0.6 });
    wallL = Bodies.rectangle(0, 0, 80, 1, { isStatic: true });
    wallR = Bodies.rectangle(0, 0, 80, 1, { isStatic: true });
    World.add(world, [floor, wallL, wallR]);
  }

  function placeBoundaries() {
    const bottom = scrollTop + H + 220;
    Body.setPosition(floor, { x: W / 2, y: bottom });
    Body.setPosition(wallL, { x: -40, y: scrollTop + H / 2 });
    Body.setPosition(wallR, { x: W + 40, y: scrollTop + H / 2 });
  }

  function buildBlobColliders() {
    blobBodies.forEach((b) => World.remove(world, b));
    blobBodies.length = 0;

    const blobs = getBlobs();
    for (const blob of blobs) {
      const b = Bodies.circle(blob.x, blob.y, blob.r * 0.9, {
        isStatic: true,
        restitution: 0.55,
        friction: 0.05,
        render: { fillStyle: 'transparent', strokeStyle: 'transparent' }
      });
      blobBodies.push(b);
      World.add(world, b);
    }
  }

  let live = false;

  function spawnAt(x, y, r, color, vx, vy) {
    if (balls.length >= maxBalls) return;
    const body = Bodies.circle(x, y, r, {
      restitution: 0.65,
      frictionAir: 0.006,
      friction: 0.02,
      density: 0.0009,
      render: { fillStyle: color }
    });
    if (vx || vy) Body.setVelocity(body, { x: vx || 0, y: vy || 0 });
    World.add(world, body);
    balls.push({
      body,
      r,
      alpha: 1,
      age: 0,
      maxAge: 9000 + Math.random() * 7000,
      dying: false,
      fade: 0.016 + Math.random() * 0.012
    });
  }

  function spawnBall(initialBurst = false) {
    const r = 20 + Math.floor(Math.random() * 18);
    const x = r + Math.random() * Math.max(W - r * 2, 1);
    const y = scrollTop - r - (initialBurst ? Math.random() * H * 0.5 : 16 + Math.random() * 80);
    spawnAt(x, y, r, COLORS[Math.floor(Math.random() * COLORS.length)], 0, 0);
  }

  function releaseFromCenter() {
    const cx = W / 2;
    const cy = scrollTop + H / 2;
    const orbit = 36;
    const speed = 3.4;
    const specs = [
      { color: COLORS[1], a: -Math.PI / 2, r: 24 },
      { color: COLORS[0], a: 0, r: 22 },
      { color: COLORS[2], a: Math.PI / 2, r: 26 },
      { color: COLORS[3], a: Math.PI, r: 20 }
    ];
    for (const s of specs) {
      const x = cx + Math.cos(s.a) * orbit;
      const y = cy + Math.sin(s.a) * orbit;
      spawnAt(x, y, s.r, s.color, -Math.sin(s.a) * speed, Math.cos(s.a) * speed);
    }
  }

  function burst(count) {
    for (let i = 0; i < count; i++) spawnBall(true);
  }

  function onPointer(e) {
    mouse.active = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY + (window.pageYOffset || document.documentElement.scrollTop);
  }

  addEventListener('mousemove', onPointer, { passive: true });
  addEventListener('touchmove', onPointer, { passive: true });
  addEventListener('touchstart', onPointer, { passive: true });
  addEventListener('mouseleave', () => { mouse.active = false; }, { passive: true });

  let lastT = performance.now();

  function tick(now) {
    const dt = Math.min(50, now - lastT);
    lastT = now;

    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    Engine.update(engine, dt);
    placeBoundaries();

    if (live && balls.length < maxBalls) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnBall();
        spawnTimer = 70 + Math.random() * 90;
      }
    }

    if (mouse.active) {
      const MOUSE_R = 170;
      const PUSH = 55;
      for (const b of balls) {
        const dx = b.body.position.x - mouse.x;
        const dy = b.body.position.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < MOUSE_R && d > 0.001) {
          const f = 1 - d / MOUSE_R;
          const nx = dx / d;
          const ny = dy / d;
          Body.applyForce(b.body, b.body.position, { x: nx * b.body.mass * PUSH * f, y: ny * b.body.mass * PUSH * f });
        }
      }
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      const by = b.body.position.y;
      b.age += dt;

      if (!b.dying && (b.age > b.maxAge || by > scrollTop + H + 200)) {
        b.dying = true;
      }

      if (b.dying) {
        b.alpha -= b.fade;
        if (b.alpha <= 0.01) {
          World.remove(world, b.body);
          balls.splice(i, 1);
          continue;
        }
      }

      const sy = by - scrollTop;
      if (sy < -b.r - 20 || sy > H + b.r + 20) continue;

      ctx.save();
      ctx.translate(b.body.position.x, sy);
      ctx.rotate(b.body.rotation);
      ctx.globalAlpha = b.alpha;
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.body.render.fillStyle;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(-b.r * 0.3, -b.r * 0.3, b.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const area = W * H;
    maxBalls = Math.max(24, Math.min(48, Math.round(area / 26000)));
  }

  makeBoundaries();
  resize();

  function syncColliders() {
    buildBlobColliders();
  }

  addEventListener('resize', () => {
    resize();
    setTimeout(syncColliders, 120);
  }, { passive: true });

  window.addEventListener('load', () => {
    resize();
    syncColliders();
  }, { once: true });

  function startLive() {
    if (live) return;
    live = true;
    resize();
    syncColliders();
    releaseFromCenter();
    setTimeout(function () {
      burst(Math.max(14, Math.round(maxBalls * 0.4)));
    }, 280);
    spawnTimer = 40;
  }

  if (window.__azimuthRevealed) startLive();
  else addEventListener('azimuth:reveal', startLive, { once: true });

  syncColliders();
  requestAnimationFrame(tick);
})();