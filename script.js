// ============================================
// NEXUS - animazioni con anime.js
// ============================================

// ---- Navbar scroll effect ----
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
});

// ---- Smooth scroll per anchor ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            navLinks?.classList.remove('active');
            anime({
                targets: 'html, body',
                scrollTop: target.offsetTop - 60,
                duration: 900,
                easing: 'easeInOutExpo'
            });
        }
    });
});

// ---- Mobile menu ----
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    anime({
        targets: navLinks,
        opacity: isOpen ? [0, 1] : [1, 0],
        translateY: isOpen ? [30, 0] : [0, 30],
        duration: 400,
        easing: 'easeOutExpo'
    });
});

// ---- HERO: animazione di ingresso (stile igloo: word reveal) ----
const heroWordEls = document.querySelectorAll('.hero-word');

heroWordEls.forEach((el) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(40px)';
});

const heroTimeline = anime.timeline({ easing: 'easeOutExpo' });

heroTimeline
    .add({ targets: '.hero-label', opacity: [0, 1], translateY: [20, 0], duration: 700 })
    .add({ targets: '.hero-word', opacity: [0, 1], translateY: ['40px', '0px'], duration: 1000, delay: anime.stagger(120), begin: () => scrambleStart() }, '-=300')
    .add({ targets: '.hero-desc', opacity: [0, 1], translateY: [30, 0], duration: 800 }, '-=650')
    .add({ targets: '.btn-ice, .btn-ice-outline', opacity: [0, 1], translateY: [20, 0], duration: 700, stagger: 150 }, '-=600')
    .add({ targets: '#cube-bg', opacity: [0, 1], duration: 1600 }, '-=900');

// ---- Text scramble sull'accent (effetto glitch igloo) ----
let scrambleInit = false;
const scrambleChars = '!#$%&NEXUS0147<>/';

function scrambleStart() {
    const el = document.querySelector('.hero-word-accent');
    if (!el || scrambleInit) return;
    scrambleInit = true;

    const original = el.textContent;
    const length = original.length;
    let frame = 0;
    const total = 24;

    (function tick() {
        if (frame >= total) {
            el.textContent = original;
            return;
        }
        const progress = frame / total;
        const stable = Math.floor(progress * length);
        const isStable = (i) => i < stable;
        el.textContent = original
            .split('')
            .map((ch, i) => {
                if (ch === ' ') return ' ';
                if (isStable(i)) return ch;
                const t = (frame + i) % 2 === 0;
                return t ? scrambleChars[Math.floor(Math.random() * scrambleChars.length)] : ch;
            })
            .join('');
        frame++;
        requestAnimationFrame(tick);
    })();
}

// Hover ri-scramble
document.querySelector('.hero-word-accent')?.addEventListener('mouseenter', () => {
    scrambleInit = false;
    scrambleStart();
});

// ---- Tilt 3D sulle card servizi (hover) ----
document.querySelectorAll('.service-card, .work-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        anime({
            targets: card,
            rotateY: x * 6,
            rotateX: -y * 6,
            duration: 200,
            easing: 'easeOutQuad'
        });
    });
    card.addEventListener('mouseleave', () => {
        anime({
            targets: card,
            rotateY: 0,
            rotateX: 0,
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    });
});

// ---- Icone servizi: animazione continua al hover ----
document.querySelectorAll('.service-card').forEach(card => {
    const icon = card.querySelector('.service-icon');
    card.addEventListener('mouseenter', () => {
        anime({
            targets: icon,
            rotate: [0, 360],
            scale: [1, 1.15],
            duration: 900,
            easing: 'easeOutExpo'
        });
    });
});

// ---- Counter statistiche ----
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const obj = { value: 0 };
    anime({
        targets: obj,
        value: target,
        round: 1,
        duration: 2000,
        easing: 'easeOutExpo',
        update: () => el.textContent = obj.value
    });
}

// ---- Scroll-triggered reveal con anime.js ----
const gridParents = [
    { parent: '.services-grid', type: 'service-card' },
    { parent: '.works-grid', type: 'work-card' },
    { parent: '.testimonials-grid', type: 'testimonial-card' }
];

// Elementi singoli che fanno fade-up (non in griglia)
const singleElements = [
    '.about-card', '.stat-item', '.contact-info', '.contact-form',
    '.about-feature', '.contact-detail', '.process-step', '.section-intro', '.works-cta'
];

function revealGrid(parentSel, sel, delayStagger) {
    const grid = document.querySelector(parentSel);
    if (!grid) return;
    grid.style.opacity = 0;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: grid.querySelectorAll(sel),
                    opacity: [0, 1],
                    translateY: [45, 0],
                    duration: 750,
                    easing: 'easeOutExpo',
                    delay: anime.stagger(delayStagger)
                });
                obs.unobserve(grid);
            }
        });
    }, { threshold: 0.1 });
    obs.observe(grid);
}

gridParents.forEach(g => revealGrid(g.parent, g.type, g.type === 'work-card' ? 100 : 120));

const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            if (el.classList.contains('stat-item')) {
                el.querySelectorAll('.stat-number').forEach(animateCounter);
            }
            anime({
                targets: el,
                opacity: [0, 1],
                translateY: [45, 0],
                duration: 800,
                easing: 'easeOutExpo'
            });
            obs.unobserve(el);
        }
    });
}, { threshold: 0.15 });

singleElements.forEach(el => {
    const targets = document.querySelectorAll(el);
    targets.forEach(t => {
        t.style.opacity = 0;
        obs.observe(t);
    });
});

// Titoli di sezione: fade-up
document.querySelectorAll('.section').forEach(section => {
    const titles = section.querySelectorAll('.section-title, .section-label');
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 700,
                    easing: 'easeOutExpo'
                });
                titleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    titles.forEach(t => { t.style.opacity = 0; titleObserver.observe(t); });
});

// ---- Preview immagine che segue il cursore (progetti) ----
const workPreview = document.getElementById('workPreview');
let previewVisible = false;

document.addEventListener('mousemove', (e) => {
    if (!previewVisible || !workPreview) return;
    workPreview.style.left = (e.clientX + 20) + 'px';
    workPreview.style.top = (e.clientY + 20) + 'px';
});

document.querySelectorAll('.work-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
        const src = row.getAttribute('data-img');
        if (!src || !workPreview) return;
        workPreview.src = src;
        previewVisible = true;
        anime({
            targets: workPreview,
            opacity: [0, 1],
            scale: [0.8, 1],
            rotate: [-4, -4],
            duration: 350,
            easing: 'easeOutExpo'
        });
    });
    row.addEventListener('mouseleave', () => {
        if (!previewVisible) return;
        previewVisible = false;
        anime({
            targets: workPreview,
            opacity: 0,
            duration: 250,
            easing: 'easeOutQuad'
        });
    });
});

// ---- Form handling ----
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Animazione pulsante
    anime({
        targets: form.querySelector('button[type="submit"]'),
        scale: [1, 0.95, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .5)'
    });

    formSuccess.style.display = 'block';
    anime({
        targets: formSuccess,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        easing: 'easeOutExpo'
    });

    form.reset();
    setTimeout(() => { formSuccess.style.display = 'none'; }, 4000);
});

// ---- Barra di avanzamento scroll (progress bar) ----
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
});