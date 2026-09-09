(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthResolve = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function resolveUrl(url) {
    let raw = String(url || '/').split('?')[0];
    let relative;
    try {
      relative = decodeURIComponent(raw);
    } catch (e) {
      return { status: 403, relative: '' };
    }
    if (relative === '/') relative = '/index.html';
    if (relative.indexOf('..') !== -1) return { status: 403, relative: '' };
    return { status: 200, relative: relative };
  }

  return { resolveUrl };
}));
