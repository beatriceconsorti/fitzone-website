(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthChrome = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function horizontalDelta(deltaX, deltaY) {
    return Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  }

  function horizontalScrollRoot() {
    if (typeof document === 'undefined') return null;
    const body = document.body;
    const html = document.documentElement;
    if (body && body.scrollWidth > body.clientWidth + 1) return body;
    if (html && html.scrollWidth > html.clientWidth + 1) return html;
    const main = document.querySelector('main');
    if (main && main.scrollWidth > main.clientWidth + 1) return main;
    return null;
  }

  function bindHorizontalWheel() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      const root = horizontalScrollRoot();
      if (!root) return;
      const deltaRaw = horizontalDelta(e.deltaX, e.deltaY);
      if (!deltaRaw) return;
      let delta = deltaRaw;
      if (e.deltaMode === 1) delta *= 16;
      if (e.deltaMode === 2) delta *= innerHeight;
      e.preventDefault();
      root.scrollLeft += delta;
    }, { passive: false });
  }

  function scrollToHashTarget(target, smooth) {
    if (!target) return;
    const root = horizontalScrollRoot();
    if (!root) {
      target.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        inline: 'start',
        block: 'nearest'
      });
      return;
    }
    const next = root.scrollLeft + (target.getBoundingClientRect().left - root.getBoundingClientRect().left);
    if (smooth && typeof root.scrollTo === 'function') {
      root.scrollTo({ left: next, behavior: 'smooth' });
    } else {
      root.scrollLeft = next;
    }
  }

  function init() {
    if (typeof document === 'undefined') return;
    bindHorizontalWheel();
    if (location.hash) {
      const hashed = document.querySelector(location.hash);
      if (hashed) {
        requestAnimationFrame(function () {
          scrollToHashTarget(hashed, false);
        });
      }
    }
    const cursor = document.getElementById('cursor');
    const cursorLabel = document.getElementById('cursor-label');
    if (cursor) {
      let cx = innerWidth / 2, cy = innerHeight / 2, mx = cx, my = cy;
      addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
      }, { passive: true });
      (function loop() {
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) translate(-50%, -50%)';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('a, .project, .nav-link').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          cursor.classList.add('grow');
          if (cursorLabel) {
            cursorLabel.textContent = el.getAttribute('data-cursor') || el.getAttribute('data-label') || '';
          }
        });
        el.addEventListener('mouseleave', function () {
          cursor.classList.remove('grow');
          if (cursorLabel) cursorLabel.textContent = '';
        });
      });
    }

    document.querySelectorAll('a[data-placeholder-social]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const href = a.getAttribute('href');
        if (!href || href === '#') {
          e.preventDefault();
          return;
        }
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        scrollToHashTarget(target, true);
      });
    });
  }

  return { init, horizontalDelta, horizontalScrollRoot };
}));
