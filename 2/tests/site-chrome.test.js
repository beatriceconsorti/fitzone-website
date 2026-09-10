const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const chrome = require('../js/site-chrome.js');

describe('AzimuthChrome.horizontalDelta', () => {
  it('usa deltaY se è il movimento principale (rotella)', () => {
    assert.equal(chrome.horizontalDelta(0, 120), 120);
    assert.equal(chrome.horizontalDelta(0, -80), -80);
  });

  it('usa deltaX se il gesto è già orizzontale', () => {
    assert.equal(chrome.horizontalDelta(40, 10), 40);
    assert.equal(chrome.horizontalDelta(-50, 5), -50);
  });
});

describe('AzimuthChrome.horizontalScrollRoot', () => {
  it('sceglie il nodo che può scorrere in orizzontale', () => {
    const html = { scrollWidth: 400, clientWidth: 400 };
    const body = { scrollWidth: 1800, clientWidth: 400 };
    const main = { scrollWidth: 1800, clientWidth: 1800 };
    const prevDoc = global.document;
    global.document = {
      body,
      documentElement: html,
      querySelector: function (sel) { return sel === 'main' ? main : null; }
    };
    try {
      assert.equal(chrome.horizontalScrollRoot(), body);
    } finally {
      global.document = prevDoc;
    }
  });
});
