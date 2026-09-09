const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const links = require('../js/contact-links.js');
const { CONTACT } = require('../js/content.js');

describe('AzimuthContactLinks', () => {
  it('mailto usa l’email dello studio', () => {
    assert.equal(links.mailto(CONTACT.email), 'mailto:hello@studioazimuth.it');
  });

  it('tel normalizza il numero', () => {
    assert.equal(links.tel(CONTACT.phoneTel), 'tel:+390200000000');
  });

  it('whatsapp include messaggio precompilato', () => {
    const url = links.whatsapp(CONTACT.whatsapp, CONTACT.whatsappMessage);
    assert.ok(url.startsWith('https://wa.me/390200000000?text='));
    assert.ok(url.includes(encodeURIComponent('Ciao, vorrei parlare di un progetto')));
  });
});
