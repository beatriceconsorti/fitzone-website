(() => {
  'use strict';

  function bootHero() {
    setTimeout(startReveal, 80);
  }
  if (window.__azimuthRevealed) bootHero();
  else addEventListener('azimuth:reveal', bootHero, { once: true });

  /* Reveal on scroll */
  const h1 = document.querySelector('.hero-title');

  function splitHero() {
    if (!h1) return;
    const lines = h1.querySelectorAll('.line');
    lines.forEach((line, i) => {
      const text = line.textContent.trim();
      line.innerHTML = '';
      const inner = document.createElement('span');
      inner.className = 'reveal';
      inner.textContent = text;
      line.appendChild(inner);
      setTimeout(() => {
        inner.classList.add('in');
        splitIntoChars(inner);
      }, 700 + i * 260);
    });
  }
  splitHero();

  function splitIntoChars(container) {
    const text = container.textContent;
    container.innerHTML = text.split('').map((ch) => {
      const isSpace = ch === ' ';
      const display = isSpace ? '&nbsp;' : ch;
      return `<span class="char ${isSpace ? 'space' : ''}">${display}</span>`;
    }).join('');
  }

  function startReveal() {
    document.querySelectorAll('.sec-title, .about-lead, .contact-title, .mail-link, .btn-hero, .hero-sub, .about-cols').forEach((el) => {
      el.setAttribute('data-reveal', '');
      el.classList.add('in');
    });
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add('in');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.sec-title, .about-lead, .contact-title, .mail-link, .btn-hero, .hero-sub, .about-cols, .project, #sintesi, .svc, .person-card, .channels').forEach((el) => {
    el.setAttribute('data-reveal', '');
    io.observe(el);
  });

  const projects = document.querySelectorAll('.project, .work-thumb');
  projects.forEach((p) => {
    p.setAttribute('data-cursor', 'Vedi caso');
  });

  /* Animated accent on scroll for project rows */
  const setYear = () => {};
})();
