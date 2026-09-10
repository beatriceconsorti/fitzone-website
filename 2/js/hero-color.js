(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthHeroColor = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PALETTE = ['var(--accent)', 'var(--muted)', 'var(--ink)'];
  const RADIUS = 220;
  const HEADING_SEL = '.sec-title, .contact-title, .studio-block > h2';
  const CHAR_SEL = '.hero-title .char, .sec-title .char, .contact-title .char, .studio-block h2 .char';

  function splitTextToCharHtml(text) {
    return String(text).split('').map(function (ch) {
      const isSpace = ch === ' ';
      const body = isSpace ? '&nbsp;' : ch;
      return '<span class="char' + (isSpace ? ' space' : '') + '">' + body + '</span>';
    }).join('');
  }

  function wrapTextNode(node) {
    const text = node.textContent;
    if (!text) return;
    const frag = node.ownerDocument.createDocumentFragment();
    for (let i = 0; i < text.length; i++) {
      const ch = text.charAt(i);
      const span = node.ownerDocument.createElement('span');
      span.className = ch === ' ' ? 'char space' : 'char';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      frag.appendChild(span);
    }
    node.parentNode.replaceChild(frag, node);
  }

  function splitElement(el) {
    if (!el || el.querySelector('.char')) return;
    const nodes = [];
    (function collect(n) {
      if (n.nodeType === 3) nodes.push(n);
      else if (n.nodeName !== 'BR' && !n.classList.contains('char')) {
        const kids = n.childNodes;
        for (let i = 0; i < kids.length; i++) collect(kids[i]);
      }
    }(el));
    nodes.forEach(wrapTextNode);
  }

  function splitHeadings(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return 0;
    const els = root.querySelectorAll(HEADING_SEL);
    let n = 0;
    for (let i = 0; i < els.length; i++) {
      if (els[i].closest && els[i].closest('.hero-title')) continue;
      splitElement(els[i]);
      n += 1;
    }
    return n;
  }

  function create(opts) {
    const queryChars = opts.queryChars;
    const radius = opts.radius == null ? RADIUS : opts.radius;
    let mx = 0;
    let my = 0;

    function colorize() {
      const cache = queryChars();
      if (!cache.length) return;
      for (const ch of cache) {
        const rect = ch.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        if (d < radius) {
          const t = d / radius;
          const idx = Math.min(PALETTE.length - 1, Math.floor(t * PALETTE.length));
          ch.style.color = PALETTE[idx];
        } else {
          ch.style.color = '';
        }
      }
    }

    function onMove(x, y) {
      mx = x;
      my = y;
      colorize();
    }

    return { onMove, colorize, PALETTE };
  }

  let bound = false;

  function init() {
    if (typeof document === 'undefined') return;
    splitHeadings(document);
    if (bound) return;
    bound = true;
    const api = create({
      queryChars: function () {
        return document.querySelectorAll(CHAR_SEL);
      }
    });
    addEventListener('mousemove', function (e) {
      api.onMove(e.clientX, e.clientY);
    }, { passive: true });
  }

  return { create, PALETTE, RADIUS, splitTextToCharHtml, splitElement, splitHeadings, init };
}));
