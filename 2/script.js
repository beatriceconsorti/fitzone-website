(() => {
  'use strict';

  const loaderProg = document.querySelector('.loader-progress');
  const loaderCount = document.querySelector('.loader-count');

  const preloader = new Promise((resolve) => {
    let p = 0;
    const tick = () => {
      p += Math.random() * 22 + 8;
      if (p > 100) p = 100;
      if (loaderProg) loaderProg.style.width = p + '%';
      if (loaderCount) loaderCount.textContent = Math.round(p) + '%';
      if (p < 100) setTimeout(tick, 120);
      else setTimeout(resolve, 300);
    };
    setTimeout(tick, 200);
  });

  const boot = () => {
    document.getElementById('loader').classList.add('done');
    document.body.style.overflow = '';
    setTimeout(startReveal, 100);
  };

  Promise.all([
    preloader,
    window.matchMedia('print').matches
      ? Promise.resolve()
      : new Promise((res) => (document.readyState === 'complete' ? res() : window.addEventListener('load', res, { once: true })))
  ]).then(boot);

  document.body.style.overflow = 'hidden';

  /* Cursor */
  const cursor = document.getElementById('cursor');
  const cursorLabel = document.getElementById('cursor-label');
  let cx = innerWidth / 2, cy = innerHeight / 2;
  let mx = cx, my = cy;

  let heroCharsCache = null;
  function colorizeHeroTitle() {
    if (!heroCharsCache) heroCharsCache = document.querySelectorAll('.hero-title .char');
    if (!heroCharsCache.length) return;

    const palette = ['var(--accent)', 'var(--muted)', 'var(--ink)'];
    const R = 220;

    for (const ch of heroCharsCache) {
      const rect = ch.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const d = Math.hypot(mx - cx, my - cy);
      if (d < R) {
        const t = d / R;
        const idx = Math.min(palette.length - 1, Math.floor(t * palette.length));
        ch.style.color = palette[idx];
      } else {
        ch.style.color = '';
      }
    }
  }

  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; colorizeHeroTitle(); }, { passive: true });

  const loop = () => {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  const hoverables = document.querySelectorAll('a, .project, .project-visual, .nav-link');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('grow');
      const label = el.getAttribute('data-cursor') || el.getAttribute('data-label') || '';
      cursorLabel.textContent = label;
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('grow');
      cursorLabel.textContent = '';
    });
  });

  /* Reveal on scroll */
  const h1 = document.querySelector('.hero-title');

  function splitHero() {
    const lines = h1.querySelectorAll('.line');
    lines.forEach((line, i) => {
      const text = line.textContent.trim();
      line.innerHTML = '';
      const inner = document.createElement('span');
      inner.className = 'reveal';
      inner.textContent = text;
      line.appendChild(inner);
      setTimeout(() => {
        inner.classList.add('in');
        splitIntoChars(inner);
      }, 700 + i * 260);
    });
  }
  splitHero();

  function splitIntoChars(container) {
    const text = container.textContent;
    container.innerHTML = text.split('').map((ch) => {
      const isSpace = ch === ' ';
      const display = isSpace ? '&nbsp;' : ch;
      return `<span class="char ${isSpace ? 'space' : ''}">${display}</span>`;
    }).join('');
  }

  function startReveal() {
    document.querySelectorAll('.sec-title, .about-lead, .contact-title, .mail-link, .btn-hero, .hero-sub, .about-cols').forEach((el) => {
      el.setAttribute('data-reveal', '');
      el.classList.add('in');
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add('in');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.sec-title, .about-lead, .contact-title, .mail-link, .btn-hero, .hero-sub, .about-cols, .project').forEach((el) => {
    el.setAttribute('data-reveal', '');
    io.observe(el);
  });

  const projects = document.querySelectorAll('.project');
  projects.forEach((p) => {
    p.setAttribute('data-cursor', 'Vedi caso');
    p.addEventListener('click', () => {
      cursor.textContent = '';
    });
  });

  /* Smooth anchor scrolling (wheel-based horizontal feel is replaced by graceful vertical) */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* Animated accent on scroll for project rows */
  const setYear = () => {};
})();