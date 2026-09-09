(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthRender = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function contactBlock({ contact, links, variant }) {
    const compact = variant === 'compact';
    const mail = links.mailto(contact.email);
    const tel = links.tel(contact.phoneTel);
    const wa = links.whatsapp(contact.whatsapp, contact.whatsappMessage);
    const intro = compact
      ? '<p class="contact-prompt">Questo tipo di lavoro vi serve?</p>'
      : '';
    return (
      '<div class="channels-wrap" data-contact>' +
        intro +
        '<ul class="channels">' +
          '<li><a class="channel" href="' + mail + '">Email<span>' + escapeHtml(contact.email) + '</span></a></li>' +
          '<li><a class="channel" href="' + tel + '">Telefono<span>' + escapeHtml(contact.phoneDisplay) + '</span></a></li>' +
          '<li><a class="channel" href="' + wa + '" target="_blank" rel="noopener noreferrer">WhatsApp<span>' + escapeHtml(contact.phoneDisplay) + '</span></a></li>' +
        '</ul>' +
        '<div class="booking-panel">' +
          '<h3>Prenota una chiamata</h3>' +
          '<div data-booking></div>' +
        '</div>' +
      '</div>'
    );
  }

  function homeSintesi({ services, phases, people, studioHref }) {
    const svc = services.map(function (s) {
      return '<article class="svc">' +
        '<h3>' + escapeHtml(s.title) + '</h3>' +
        '<p>' + escapeHtml(s.client) + '</p>' +
        '<p class="svc-delivers">' + escapeHtml(s.delivers) + '</p>' +
      '</article>';
    }).join('');
    const ph = phases.map(function (p) {
      return '<li><strong>' + escapeHtml(p.title) + '</strong> ' + escapeHtml(p.summary) + '</li>';
    }).join('');
    const pe = people.map(function (p) {
      return '<a class="person-card" href="' + studioHref + '#persone">' +
        '<img src="' + escapeHtml(p.photo) + '" alt="' + escapeHtml(p.name) + '" width="120" height="120">' +
        '<span>' + escapeHtml(p.name) + '</span>' +
        '<em>' + escapeHtml(p.role) + '</em>' +
      '</a>';
    }).join('');
    return (
      '<div class="sintesi-grid">' +
        '<div><h3 class="sintesi-kicker">Cosa facciamo in concreto</h3><div class="svc-grid">' + svc + '</div></div>' +
        '<div><h3 class="sintesi-kicker">Come lavoriamo</h3><ol class="phase-preview">' + ph + '</ol>' +
          '<a class="text-link" href="' + studioHref + '#metodo">Il metodo completo</a></div>' +
        '<div><h3 class="sintesi-kicker">Il collettivo</h3><div class="people-preview">' + pe + '</div>' +
          '<a class="text-link" href="' + studioHref + '#persone">Il collettivo</a></div>' +
      '</div>'
    );
  }

  function studioPage({ lead, services, phases, people, awards, contactHtml }) {
    const svc = services.map(function (s) {
      return '<article class="svc svc-full" id="servizio-' + escapeHtml(s.id) + '">' +
        '<h3>' + escapeHtml(s.title) + '</h3>' +
        '<p>' + escapeHtml(s.client) + '</p>' +
        '<p class="svc-delivers"><strong>Cosa consegnamo.</strong> ' + escapeHtml(s.delivers) + '</p>' +
      '</article>';
    }).join('');
    const ph = phases.map(function (p, i) {
      return '<article class="phase">' +
        '<p class="phase-num">0' + (i + 1) + '</p>' +
        '<h3>' + escapeHtml(p.title) + '</h3>' +
        '<p>' + escapeHtml(p.detail) + '</p>' +
      '</article>';
    }).join('');
    const pe = people.map(function (p) {
      return '<article class="person">' +
        '<img src="' + escapeHtml(p.photo) + '" alt="' + escapeHtml(p.name) + '">' +
        '<h3>' + escapeHtml(p.name) + '</h3>' +
        '<p class="person-role">' + escapeHtml(p.role) + '</p>' +
        '<p>' + escapeHtml(p.bio) + '</p>' +
      '</article>';
    }).join('');
    const aw = awards.map(function (a) {
      return '<li>' + escapeHtml(a.title) + ' — ' + escapeHtml(a.note) + '</li>';
    }).join('');
    return (
      '<header class="page-hero"><p class="sec-index">02 / Chi siamo</p>' +
        '<h1 class="sec-title">Studio</h1>' +
        '<p class="about-lead">' + escapeHtml(lead) + '</p></header>' +
      '<section class="studio-block" id="servizi"><h2>Cosa facciamo in concreto</h2><div class="svc-grid">' + svc + '</div></section>' +
      '<section class="studio-block" id="metodo"><h2>Come lavoriamo</h2><div class="phase-list">' + ph + '</div></section>' +
      '<section class="studio-block" id="persone"><h2>Persone</h2><div class="people-grid">' + pe + '</div></section>' +
      '<section class="studio-block" id="premi"><h2>Riconoscimenti</h2><ul class="list">' + aw + '</ul></section>' +
      '<section class="studio-block" id="contact">' + contactHtml + '</section>'
    );
  }

  function casePage({ project, prev, next, workHref, contactHtml }) {
    const steps = project.process.map(function (s) {
      return '<li><strong>' + escapeHtml(s.title) + '</strong><p>' + escapeHtml(s.text) + '</p></li>';
    }).join('');
    const dels = project.deliverable.map(function (d) {
      return '<li>' + escapeHtml(d) + '</li>';
    }).join('');
    const figs = project.gallery.map(function (g) {
      return '<figure><img src="' + escapeHtml(g.src) + '" alt="' + escapeHtml(g.alt) + '" loading="lazy"><figcaption>' + escapeHtml(g.caption) + '</figcaption></figure>';
    }).join('');
    return (
      '<header class="case-hero">' +
        '<p class="sec-index">' + escapeHtml(project.num) + ' / ' + escapeHtml(project.year) + '</p>' +
        '<h1 class="sec-title">' + escapeHtml(project.title) + '</h1>' +
        '<p class="case-role">' + escapeHtml(project.role) + '</p>' +
        '<p><a class="text-link" href="' + workHref + '">Tutti i progetti</a></p>' +
      '</header>' +
      '<section class="studio-block"><h2>Brief</h2><p class="about-lead">' + escapeHtml(project.brief) + '</p></section>' +
      '<section class="studio-block"><h2>Processo</h2><ol class="case-process">' + steps + '</ol></section>' +
      '<section class="studio-block"><h2>Deliverable</h2><ul class="list">' + dels + '</ul></section>' +
      '<section class="studio-block"><h2>Gallery</h2><div class="gallery">' + figs + '</div></section>' +
      '<nav class="case-next">' +
        '<a class="case-next-link" href="' + escapeHtml(prev.slug) + '.html"><span>Precedente</span>' + escapeHtml(prev.title) + '</a>' +
        '<a class="case-next-link" href="' + escapeHtml(next.slug) + '.html"><span>Prossimo progetto</span>' + escapeHtml(next.title) + '</a>' +
      '</nav>' +
      '<section class="studio-block" id="contact">' + contactHtml + '</section>'
    );
  }

  function notFound({ workHref, studioHref }) {
    return (
      '<header class="page-hero"><h1 class="sec-title">Progetto non trovato</h1>' +
        '<p class="hero-sub">Questa pagina non esiste o il caso è stato spostato.</p>' +
        '<p><a class="text-link" href="' + workHref + '">Work</a> · <a class="text-link" href="' + studioHref + '">Studio</a></p>' +
      '</header>'
    );
  }

  return { escapeHtml, contactBlock, homeSintesi, studioPage, casePage, notFound };
}));
