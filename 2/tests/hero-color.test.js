const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const heroColor = require('../js/hero-color.js');

function fakeChar(left, top) {
  return {
    style: { color: '' },
    getBoundingClientRect: () => ({ left: left, top: top, width: 10, height: 10 })
  };
}

describe('AzimuthHeroColor dopo un refresh', () => {
  it('colora le lettere anche se il mouse si è mosso prima che esistessero', () => {
    let chars = [];
    const api = heroColor.create({
      queryChars: () => chars
    });

    api.onMove(105, 105);
    chars = [fakeChar(100, 100)];
    api.onMove(105, 105);

    assert.equal(chars[0].style.color, heroColor.PALETTE[0]);
  });

  it('include anche le lettere della seconda riga, nate dopo', () => {
    const first = fakeChar(100, 100);
    let chars = [first];
    const api = heroColor.create({
      queryChars: () => chars
    });

    api.onMove(105, 105);
    const second = fakeChar(100, 140);
    chars = [first, second];
    api.onMove(105, 145);

    assert.equal(second.style.color, heroColor.PALETTE[0]);
  });

  it('spezza un titolo in lettere per l’effetto colore', () => {
    const html = heroColor.splitTextToCharHtml('Ciao te');
    assert.equal((html.match(/class="char"/g) || []).length, 6);
    assert.equal((html.match(/class="char space"/g) || []).length, 1);
    assert.ok(html.includes('&nbsp;'));
  });
});
