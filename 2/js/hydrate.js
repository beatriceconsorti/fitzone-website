(function () {
  'use strict';
  const C = window.AzimuthContent;
  const L = window.AzimuthContactLinks;
  const R = window.AzimuthRender;
  const Chrome = window.AzimuthChrome;
  if (!C || !L || !R) return;

  const page = document.body.getAttribute('data-page');
  const LEAD = 'Studio Azimuth è un collettivo di designer a Milano. Uniamo grafica, motion e codice per costruire esperienze che si ricordano — e che un cliente può giudicare con calma.';

  function contact(variant) {
    return R.contactBlock({ contact: C.CONTACT, links: L, variant: variant });
  }

  if (page === 'home') {
    const s = document.getElementById('sintesi-root');
    if (s) {
      s.innerHTML = R.homeSintesi({
        services: C.SERVICES,
        phases: C.PROCESS_PHASES,
        people: C.PEOPLE,
        studioHref: 'studio.html'
      });
    }
    const w = document.getElementById('work-root');
    if (w) {
      w.innerHTML = R.homeWork({
        projects: C.PROJECTS,
        workBase: 'work/'
      });
    }
    const ch = document.getElementById('contact-channels');
    if (ch) ch.innerHTML = contact('full');
  }

  if (page === 'studio') {
    const root = document.getElementById('page-root');
    if (root) {
      root.innerHTML = R.studioPage({
        lead: LEAD,
        services: C.SERVICES,
        phases: C.PROCESS_PHASES,
        people: C.PEOPLE,
        awards: C.AWARDS,
        contactHtml: contact('full')
      });
    }
  }

  if (page === 'case') {
    const slug = document.body.getAttribute('data-slug');
    const root = document.getElementById('page-root');
    const project = C.getProject(slug);
    const n = project ? C.neighbors(slug) : null;
    if (root && !project) {
      root.innerHTML = R.notFound({
        workHref: '../index.html#work',
        studioHref: '../studio.html'
      });
    } else if (root && n) {
      root.innerHTML = R.casePage({
        project: project,
        prev: n.prev,
        next: n.next,
        workHref: '../index.html#work',
        contactHtml: contact('compact')
      });
    }
  }

  if (Chrome) Chrome.init();
  if (window.AzimuthHeroColor) AzimuthHeroColor.init();
})();
