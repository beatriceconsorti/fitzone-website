(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthHomeLoader = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MIN_MS = 2000;
  const HANDOFF_MS = 900;

  function remainingWait(elapsedMs, loaded, minMs, reducedMotion) {
    if (reducedMotion) return 0;
    if (!loaded) return Infinity;
    return Math.max(0, (minMs == null ? MIN_MS : minMs) - elapsedMs);
  }

  function signalReveal() {
    if (typeof document === 'undefined') return;
    window.__azimuthRevealed = true;
    document.body.classList.remove('home-booting');
    document.body.classList.add('home-live');
    dispatchEvent(new Event('azimuth:reveal'));
  }

  function init() {
    if (typeof document === 'undefined') return;
    const loader = document.getElementById('loader');
    if (!loader || document.body.getAttribute('data-page') !== 'home') return;

    document.body.classList.add('home-booting');
    document.body.style.overflow = 'hidden';

    const reduced = typeof matchMedia === 'function'
      && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipChoreography = reduced
      || (typeof matchMedia === 'function' && matchMedia('print').matches);
    const started = typeof performance !== 'undefined' ? performance.now() : 0;

    function finish() {
      const wait = remainingWait(
        (typeof performance !== 'undefined' ? performance.now() : started) - started,
        true,
        MIN_MS,
        skipChoreography
      );
      const go = function () {
        if (skipChoreography) {
          loader.classList.add('done');
          document.body.style.overflow = '';
          signalReveal();
          return;
        }
        loader.classList.add('is-handoff');
        signalReveal();
        setTimeout(function () {
          loader.classList.add('done');
          document.body.style.overflow = '';
        }, HANDOFF_MS);
      };
      if (wait > 0 && wait !== Infinity) setTimeout(go, wait);
      else go();
    }

    if (typeof window === 'undefined') return;
    if (document.readyState === 'complete') finish();
    else addEventListener('load', finish, { once: true });
  }

  return { MIN_MS, HANDOFF_MS, remainingWait, init };
}));
