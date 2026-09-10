const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const content = require('../js/content.js');
const links = require('../js/contact-links.js');
const render = require('../js/render.js');

describe('AzimuthRender', () => {
  it('escapeHtml protegge i caratteri', () => {
    assert.equal(render.escapeHtml('<x & "y">'), '&lt;x &amp; &quot;y&quot;&gt;');
  });

  it('contactBlock ha email, telefono e WhatsApp, senza prenotazione', () => {
    const html = render.contactBlock({
      contact: content.CONTACT,
      links,
      variant: 'full'
    });
    assert.ok(html.includes('mailto:hello@studioazimuth.it'));
    assert.ok(html.includes('tel:+390200000000'));
    assert.ok(html.includes('wa.me/390200000000'));
    assert.ok(!html.includes('data-booking'));
    assert.ok(!html.includes('Prenota una chiamata'));
  });

  it('homeSintesi ha servizi, 5 fasi e volti con link allo Studio, senza paragrafi lunghi', () => {
    const html = render.homeSintesi({
      services: content.SERVICES,
      phases: content.PROCESS_PHASES,
      people: content.PEOPLE,
      studioHref: 'studio.html'
    });
    assert.ok(html.includes('Il metodo'));
    assert.ok(html.includes('Le persone'));
    assert.ok(html.includes('Lara Vico'));
    assert.ok(html.includes('Ascolto e brief'));
    assert.ok(html.includes('Follow-up'));
    assert.ok((html.match(/studio\.html/g) || []).length >= 2);
    assert.ok(!html.includes('Sito live, pagine chiave'));
    assert.ok(!html.includes('Capire obiettivo, vincoli'));
  });

  it('homeWork mostra le immagini e i link ai casi', () => {
    const html = render.homeWork({
      projects: content.PROJECTS,
      workBase: 'work/'
    });
    assert.equal((html.match(/<img /g) || []).length, 4);
    assert.ok(html.includes('work/nebula-commerce.html'));
    assert.ok(html.includes('work/archive-id.html'));
    assert.ok(html.includes('alt="Materia Festival"'));
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
    assert.ok(html.includes('case-hero-cover'));
    assert.ok(html.includes('photo-1618005182384'));
    assert.ok(!html.includes('<h2>Brief</h2>'));
    assert.ok(html.includes('archive-id.html'));
    assert.ok(html.includes('materia-festival.html'));
    assert.ok(html.includes('Questo tipo di lavoro vi serve?'));
    assert.equal((html.match(/<figure/g) || []).length, p.gallery.length);
    assert.ok(html.includes(' loading="lazy"'));
    const firstAlt = p.gallery[0].alt;
    assert.ok(html.includes('alt="' + firstAlt + '" loading="lazy"'));
    assert.ok(!html.includes('alt="' + firstAlt + ' loading="lazy"'));
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
