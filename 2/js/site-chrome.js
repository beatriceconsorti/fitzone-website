(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthChrome = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function init() {
    if (typeof document === 'undefined') return;
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
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  return { init };
}));
