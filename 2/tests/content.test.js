const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const content = require('../js/content.js');

describe('AzimuthContent', () => {
  it('ha 4 servizi, 5 fasi, 3 persone, 4 progetti', () => {
    assert.equal(content.SERVICES.length, 4);
    assert.equal(content.PROCESS_PHASES.length, 5);
    assert.equal(content.PEOPLE.length, 3);
    assert.equal(content.PROJECTS.length, 4);
  });

  it('getProject torna il caso o null', () => {
    assert.equal(content.getProject('nebula-commerce').title, 'Nebula Commerce');
    assert.equal(content.getProject('manca'), null);
  });

  it('neighbors fa loop sull\u2019elenco', () => {
    const first = content.neighbors('nebula-commerce');
    assert.equal(first.prev.slug, 'archive-id');
    assert.equal(first.next.slug, 'materia-festival');
    const last = content.neighbors('archive-id');
    assert.equal(last.next.slug, 'nebula-commerce');
    assert.equal(content.neighbors('manca'), null);
  });

  it('ogni progetto ha brief, 3-5 passi, deliverable e almeno 4 immagini', () => {
    for (const p of content.PROJECTS) {
      assert.ok(p.brief.length > 40);
      assert.ok(p.process.length >= 3 && p.process.length <= 5);
      assert.ok(p.deliverable.length >= 2);
      assert.ok(p.gallery.length >= 4);
    }
  });

  it('le 5 fasi iniziano da Ascolto e brief e finiscono con Follow-up', () => {
    assert.equal(content.PROCESS_PHASES[0].title, 'Ascolto e brief');
    assert.equal(content.PROCESS_PHASES[4].title, 'Follow-up');
  });

  it('CONTACT usa l\u2019email dello studio e il telefono placeholder', () => {
    assert.equal(content.CONTACT.email, 'hello@studioazimuth.it');
    assert.equal(content.CONTACT.phoneDisplay, '+39 02 0000 0000');
    assert.equal(content.CONTACT.whatsapp, '390200000000');
  });
});
