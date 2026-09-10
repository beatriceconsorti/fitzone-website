const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const loader = require('../js/home-loader.js');

describe('AzimuthHomeLoader.remainingWait', () => {
  it('aspetta il tempo minimo anche se è già load', () => {
    assert.equal(loader.remainingWait(400, true, 1400, false), 1000);
  });

  it('è pronto quando load e minimo sono soddisfatti', () => {
    assert.equal(loader.remainingWait(1400, true, 1400, false), 0);
    assert.equal(loader.remainingWait(2000, true, 1400, false), 0);
  });

  it('non finisce prima del load', () => {
    assert.equal(loader.remainingWait(2000, false, 1400, false), Infinity);
  });

  it('con meno movimento non aspetta', () => {
    assert.equal(loader.remainingWait(0, false, 1400, true), 0);
  });
});
