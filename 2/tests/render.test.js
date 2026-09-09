const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const content = require('../js/content.js');
const links = require('../js/contact-links.js');
const render = require('../js/render.js');

describe('AzimuthRender', () => {
  it('escapeHtml protegge i caratteri', () => {
    assert.equal(render.escapeHtml('<x & "y">'), '&lt;x &amp; &quot;y&quot;&gt;');
  });

  it('contactBlock ha i quattro canali e il monte prenotazione', () => {
    const html = render.contactBlock({
      contact: content.CONTACT,
      links,
      variant: 'full'
    });
    assert.ok(html.includes('mailto:hello@studioazimuth.it'));
    assert.ok(html.includes('tel:+390200000000'));
    assert.ok(html.includes('wa.me/390200000000'));
    assert.ok(html.includes('data-booking'));
    assert.ok(html.includes('Prenota una chiamata'));
  });

  it('homeSintesi ha servizi, 5 fasi e volti con link allo Studio', () => {
    const html = render.homeSintesi({
      services: content.SERVICES,
      phases: content.PROCESS_PHASES,
      people: content.PEOPLE,
      studioHref: 'studio.html'
    });
    assert.ok(html.includes('Il metodo completo'));
    assert.ok(html.includes('Il collettivo'));
    assert.ok(html.includes('Lara Vico'));
    assert.ok(html.includes('Ascolto e brief'));
    assert.ok(html.includes('Follow-up'));
    assert.ok((html.match(/studio\.html/g) || []).length >= 2);
  });

  it('casePage ha brief, processo, deliverable, gallery e next/prev', () => {
    const p = content.getProject('nebula-commerce');
    const n = content.neighbors('nebula-commerce');
    const html = render.casePage({
      project: p,
      prev: n.prev,
      next: n.next,
      workHref: '../index.html#work',
      contactHtml: render.contactBlock({
        contact: content.CONTACT,
        links,
        variant: 'compact'
      })
    });
    assert.ok(html.includes('Nebula Commerce'));
    assert.ok(html.includes(p.brief.slice(0, 30)));
    assert.ok(html.includes('archive-id.html'));
    assert.ok(html.includes('materia-festival.html'));
    assert.ok(html.includes('Questo tipo di lavoro vi serve?'));
    assert.equal((html.match(/<figure/g) || []).length, p.gallery.length);
  });

  it('notFound punta a Work e Studio', () => {
    const html = render.notFound({
      workHref: 'index.html#work',
      studioHref: 'studio.html'
    });
    assert.ok(html.includes('Progetto non trovato'));
    assert.ok(html.includes('index.html#work'));
    assert.ok(html.includes('studio.html'));
  });
});
