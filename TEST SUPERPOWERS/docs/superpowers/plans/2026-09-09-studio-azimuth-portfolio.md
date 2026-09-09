# Studio Azimuth Portfolio Cliente-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estendere il sito one-page di Studio Azimuth (`2/`) con sintesi in home, pagina Studio, schede caso complete e quattro canali di contatto (email, telefono, WhatsApp, prenotazione chiamata).

**Architecture:** Dati e regole (progetti, team, slot, link) vivono in moduli UMD testabili con `node --test`. Le pagine interne sono shell HTML che idratano il contenuto. La home resta lo spettacolo Canvas; Studio e casi non caricano blob/palline. Il server statico esistente serve `404.html` per i file mancanti.

**Tech Stack:** HTML5, CSS3, JavaScript vanilla (IIFE/UMD, ES6), Node.js `http` nativo (`server.js`), `node --test`. Nessun framework frontend. Matter.js resta solo in home.

## Global Constraints

- Lingua UI: italiano
- Nessun framework frontend (React/Vue/Angular): vanilla come il progetto attuale
- Palette invariata: `--accent: #ff4d00`, `--bg: #f4f3f0`, `--ink: #141414`, `--muted: #6b6a66`, `--line: #d9d7d2`
- Font: Space Grotesk display, Inter body
- Home: effetti visivi attuali; pagine interne: niente canvas blob/palline a pieno schermo
- `prefers-reduced-motion: reduce` non deve togliere contenuto
- Email studio: `hello@studioazimuth.it`
- Telefono/WhatsApp placeholder: `+39 02 0000 0000` / `390200000000`
- Prenotazione: 5 giorni lavorativi × 2 slot (10:00 e 15:00), è una *richiesta* non un appuntamento confermato
- Quattro progetti esistenti: Nebula Commerce, Materia Festival, Orbit Playground, Archive ID
- Non creare pagina archivio Work, blog, login, preventivatore, multilingua
- Percorsi file dal root del repo `WORKSHOP AI` (cartella sito: `2/`)
- Non fare `git push`. Dopo ogni task: commit come indicato
- Prima di dichiarare finito: verificare i flussi in browser (home → caso → next → contatto; Studio; 404; mobile ~375px)

## File structure

| File | Responsabilità |
| --- | --- |
| `2/js/content.js` | Dati: servizi, fasi, persone, premi, progetti, recapiti; `getProject`, `neighbors` |
| `2/js/contact-links.js` | Costruisce `mailto:`, `tel:`, `https://wa.me/...` |
| `2/js/booking.js` | Slot lavorativi, validazione richiesta, messaggi errore/ok |
| `2/js/render.js` | Stringhe HTML: sintesi home, Studio, caso, blocco contatto, 404 interno |
| `2/js/site-chrome.js` | Cursore, hover label, hash smooth-scroll, social placeholder |
| `2/js/booking-ui.js` | Griglia slot + form + localStorage slot presi |
| `2/js/hydrate.js` | Avvio pagine: legge `data-page` / `data-slug` e monta render + booking |
| `2/js/resolve-url.js` | Mappa URL → file relativo per il server |
| `2/server.js` | Serve statici; 404 → `404.html` |
| `2/index.html` | Home: nav, sintesi, link progetti, canali |
| `2/studio.html` | Shell pagina Studio |
| `2/work/*.html` | Shell quattro casi |
| `2/404.html` | Progetto/pagina non trovata |
| `2/styles.css` | Stili sintesi, inner, gallery, booking, canali, people |
| `2/script.js` | Solo home: loader, hero split, reveal; cursore delegato a site-chrome |
| `2/tests/*.test.js` | Test Node dei moduli |

---

### Task 1: Dati di contenuto

**Files:**
- Create: `2/js/content.js`
- Test: `2/tests/content.test.js`

**Interfaces:**
- Consumes: niente
- Produces: `AzimuthContent` / `module.exports` con
  - `CONTACT: { email: string, phoneDisplay: string, phoneTel: string, whatsapp: string, whatsappMessage: string }`
  - `SERVICES: Array<{ id: string, title: string, client: string, delivers: string }>` (4)
  - `PROCESS_PHASES: Array<{ id: string, title: string, summary: string, detail: string }>` (5)
  - `PEOPLE: Array<{ id: string, name: string, role: string, bio: string, photo: string }>` (3)
  - `AWARDS: Array<{ title: string, note: string }>` (3)
  - `PROJECTS: Array<Project>` in questo ordine: nebula-commerce, materia-festival, orbit-playground, archive-id
  - `Project`: `{ slug, num, title, year, role, teaser, brief, process: Array<{ title, text }>, deliverable: string[], gallery: Array<{ src, alt, caption }>, image }`
  - `getProject(slug: string): Project | null`
  - `neighbors(slug: string): { prev: Project, next: Project } | null`

- [ ] **Step 1: Write the failing test**

Create `2/tests/content.test.js`:

```javascript
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

  it('neighbors fa loop sull’elenco', () => {
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

  it('CONTACT usa l’email dello studio e il telefono placeholder', () => {
    assert.equal(content.CONTACT.email, 'hello@studioazimuth.it');
    assert.equal(content.CONTACT.phoneDisplay, '+39 02 0000 0000');
    assert.equal(content.CONTACT.whatsapp, '390200000000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/content.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: FAIL (cannot find module `../js/content.js`)

- [ ] **Step 3: Write minimal implementation**

Create `2/js/content.js` with this exact factory (UMD):

```javascript
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthContent = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CONTACT = {
    email: 'hello@studioazimuth.it',
    phoneDisplay: '+39 02 0000 0000',
    phoneTel: '+390200000000',
    whatsapp: '390200000000',
    whatsappMessage: 'Ciao, vorrei parlare di un progetto'
  };

  const SERVICES = [
    {
      id: 'siti',
      title: 'Siti web interattivi',
      client: 'Un sito che racconta il brand e si può usare, non solo guardare.',
      delivers: 'Sito live, pagine chiave, interazioni e linee guida di uso.'
    },
    {
      id: 'interazione',
      title: 'Design d’interazione',
      client: 'Flussi chiari: il visitatore sa cosa fare a ogni passo.',
      delivers: 'Mappe di flusso, prototipi cliccabili, micro-interazioni.'
    },
    {
      id: 'motion',
      title: 'Motion & WebGL',
      client: 'Movimento e 3D al servizio del racconto, non come decorazione.',
      delivers: 'Direzione motion, scene WebGL, asset e integrazione nel sito.'
    },
    {
      id: 'brand',
      title: 'Brand identity',
      client: 'Un sistema visivo che regge sito, social e materiali.',
      delivers: 'Logo, palette, tipo, regole di uso, kit essenziale.'
    }
  ];

  const PROCESS_PHASES = [
    {
      id: 'ascolto',
      title: 'Ascolto e brief',
      summary: 'Capire obiettivo, vincoli e cosa deve succedere dopo il lancio.',
      detail: 'Partiamo da una chiamata e da materiali esistenti. Ci serve sapere chi è il pubblico, cosa deve ottenere, tempi e cosa è già deciso. Consegniamo un brief condiviso, così nessuno lavora su ipotesi diverse.'
    },
    {
      id: 'concept',
      title: 'Concept e direzione',
      summary: 'Una direzione visiva e narrativa da approvare prima di produrre.',
      detail: 'Proponiamo 1–2 direzioni, con riferimenti e una pagina chiave. Voi scegliete. Da qui in poi il lavoro cresce su quella linea, senza ricominciare da zero a ogni round.'
    },
    {
      id: 'design',
      title: 'Design e motion',
      summary: 'Schermi, movimento e contenuti prendono forma insieme.',
      detail: 'Progettiamo le pagine e il moto. Vi mostriamo percorsi reali (home, caso, contatto), non solo mood. I commenti arrivano su quei percorsi, in round concordati.'
    },
    {
      id: 'build',
      title: 'Costruzione e lancio',
      summary: 'Mettiamo online un sito stabile, rapido, allineato al design.',
      detail: 'Costruiamo, integriamo contenuti, controlliamo mobile e riduzione movimento. Il lancio include una passata insieme: cosa è live, cosa resta da sostituire (foto, recapiti).'
    },
    {
      id: 'followup',
      title: 'Follow-up',
      summary: 'Dopo il lancio restiamo per ritocchi e consegna file.',
      detail: 'Nelle settimane successive sistemiamo dettagli emersi dall’uso reale e consegniamo sorgenti e istruzioni. Non è un contratto a tempo indeterminato: è la chiusura ordinata del lavoro.'
    }
  ];

  const PEOPLE = [
    {
      id: 'lara',
      name: 'Lara Vico',
      role: 'Direzione creativa / design',
      bio: 'Guida la direzione visiva e tiene insieme brand, layout e tono. Prima di disegnare, fissa cosa deve capire il cliente.',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80'
    },
    {
      id: 'matteo',
      name: 'Matteo Rhee',
      role: 'Motion e interazione',
      bio: 'Progetta il movimento e i momenti in cui il sito risponde. Cerca il gesto giusto, non l’effetto più rumoroso.',
      photo: 'https://images.unsplash.com/photo-1500648767791-11d2b0d4d0ad?w=640&q=80'
    },
    {
      id: 'sofia',
      name: 'Sofia Kant',
      role: 'Design e sviluppo',
      bio: 'Traduce il progetto in pagine vive. Si occupa di ritmo, dettaglio e di far arrivare il contenuto anche quando le animazioni sono spente.',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&q=80'
    }
  ];

  const AWARDS = [
    { title: 'Awwwards', note: 'Site of the Day ×6' },
    { title: 'FWA', note: 'Site of the Day ×9' },
    { title: 'CSS Design Awards', note: 'UI, UX, Innovation' }
  ];

  const PROJECTS = [
    {
      slug: 'nebula-commerce',
      num: '01',
      title: 'Nebula Commerce',
      year: '2024',
      role: 'Direzione creativa, sito, motion 3D',
      teaser: 'E-commerce immersivo con transizione di prodotto 3D. Ricostruzione completa dell’esperienza di acquisto.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      brief: 'Il brand vendeva oggetti di design su un catalogo piatto: si capiva il prezzo, non il prodotto. Serviva un acquisto che facesse sentire materia e scala, senza perdere chiarezza su spedizione e checkout.',
      process: [
        { title: 'Mappa dell’acquisto', text: 'Abbiamo seguito un cliente tipo dal primo sguardo alla conferma. I punti deboli erano la fiducia sul prodotto e il salto verso il carrello.' },
        { title: 'Direzione 3D utile', text: 'Il 3D mostra ruota, scala e finitura. Non è un videogioco: ogni gesto porta a “aggiungi” o “scopri”.' },
        { title: 'Checkout sobrio', text: 'Dopo la scena immersiva, il pagamento torna calmo: pochi campi, riepilogo visibile, niente effetti sul form.' }
      ],
      deliverable: ['Sito e-commerce', 'Configuratore 3D prodotto', 'Sistema di transizioni', 'Linee guida di aggiornamento catalogo'],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80', alt: 'Nebula, atmosfera', caption: 'Atmosfera di ingresso' },
        { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80', alt: 'Prodotto', caption: 'Scheda prodotto' },
        { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80', alt: 'Acquisto', caption: 'Percorso verso l’acquisto' },
        { src: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&q=80', alt: 'Dettaglio UI', caption: 'Dettaglio interfaccia' }
      ]
    },
    {
      slug: 'materia-festival',
      num: '02',
      title: 'Materia Festival',
      year: '2024',
      role: 'Identità, sito, motion',
      teaser: 'Identità visiva animata e sito one-page con layout orizzontale, scroll cinematografico e palette vibrante.',
      image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80',
      brief: 'Un festival di arti visive a Milano aveva un programma ricco e un volto debole. Serviva un’identità che tenesse insieme locandine, social e un sito da sfogliare come una serata, non come un PDF.',
      process: [
        { title: 'Segno e colore', text: 'Una marca semplice, usabile in motion e in stampa. Palette alta, ma con un neutro per i testi lunghi (orari, accessi).' },
        { title: 'Sito da percorrere', text: 'Il programma si sfoglia in orizzontale sul desktop; su mobile diventa una sequenza verticale leggibile.' },
        { title: 'Kit per il team', text: 'Template social e regole corte, così il festival può comunicare ogni giorno senza chiedere allo studio.' }
      ],
      deliverable: ['Identità visiva', 'Sito one-page', 'Motion kit', 'Template social'],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80', alt: 'Materia, identità', caption: 'Sistema visivo' },
        { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80', alt: 'Festival', caption: 'Atmosfera evento' },
        { src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80', alt: 'Palco', caption: 'Palco e pubblico' },
        { src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80', alt: 'Motion still', caption: 'Still dalla motion' }
      ]
    },
    {
      slug: 'orbit-playground',
      num: '03',
      title: 'Orbit Playground',
      year: '2023',
      role: 'Esperienza interattiva, WebGL',
      teaser: 'Esperienza interattiva in WebGL ispirata alla fisica orbitale. Sperimentazione libera su motorio e dati.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      brief: 'Un centro di ricerca voleva far toccare i dati orbitali a un pubblico non tecnico. L’obiettivo non era un paper: era restare tre minuti a giocare e uscire con un’immagine chiara.',
      process: [
        { title: 'Una metafora sola', text: 'Orbite visibili, masse che si attraggono. Niente dashboard. I numeri arrivano solo se li cerchi.' },
        { title: 'Prove col corpo', text: 'Abbiamo testato trascinamento e inerzia con persone esterne al team, finché il gesto era ovvio senza istruzioni.' },
        { title: 'Chiusura gentile', text: 'Una pagina “cosa avete visto” traduce il gioco in tre frasi, per chi vuole portare via il contenuto.' }
      ],
      deliverable: ['Esperienza WebGL', 'Livelli di gioco guidato', 'Pagina di contesto', 'Note di manutenzione scena'],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', alt: 'Orbita', caption: 'Campo orbitale' },
        { src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80', alt: 'Spazio', caption: 'Profondità della scena' },
        { src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80', alt: 'Stelle', caption: 'Dettaglio particelle' },
        { src: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80', alt: 'Interfaccia minima', caption: 'Controlli minimi' }
      ]
    },
    {
      slug: 'archive-id',
      num: '04',
      title: 'Archive ID',
      year: '2023',
      role: 'Strumento di branding, UI',
      teaser: 'Database tipografico per uno studio di branding. Ricerca parametrica, font variabili e micro-interazioni.',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      brief: 'Uno studio di branding perdeva ore a cercare font già usati nei progetti. Serviva un archivio interno veloce, con prova del carattere sul testo reale del cliente, non su Lorem.',
      process: [
        { title: 'Cosa si cerca davvero', text: 'Interviste corte: si cerca per progetto, umore, licenza. Abbiamo ridotto i filtri a quelli usati ogni settimana.' },
        { title: 'Prova sul testo vero', text: 'Si incolla il titolo del cliente e il font si muove. La decisione avviene lì, non su una scheda tecnica.' },
        { title: 'Micro-interazioni di conferma', text: 'Salvataggio, confronto, copia CSS: feedback visibili in meno di un secondo, perché lo strumento si usa in call.' }
      ],
      deliverable: ['Archivio interno', 'Ricerca e filtri', 'Prova font variabile', 'Export per il team'],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80', alt: 'Archive ID', caption: 'Vista archivio' },
        { src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80', alt: 'Tipo', caption: 'Prova tipografica' },
        { src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80', alt: 'UI', caption: 'Filtri e confronto' },
        { src: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=80', alt: 'Dettaglio', caption: 'Dettaglio scheda font' }
      ]
    }
  ];

  function getProject(slug) {
    return PROJECTS.find((p) => p.slug === slug) || null;
  }

  function neighbors(slug) {
    const i = PROJECTS.findIndex((p) => p.slug === slug);
    if (i < 0) return null;
    const n = PROJECTS.length;
    return {
      prev: PROJECTS[(i + n - 1) % n],
      next: PROJECTS[(i + 1) % n]
    };
  }

  return {
    CONTACT, SERVICES, PROCESS_PHASES, PEOPLE, AWARDS, PROJECTS,
    getProject, neighbors
  };
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/content.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: PASS, 6 passing

- [ ] **Step 5: Commit**

```bash
git add 2/js/content.js 2/tests/content.test.js
git commit -m "Aggiungi dati editoriali Azimuth testabili (servizi, team, casi)."
```

---

### Task 2: Link di contatto

**Files:**
- Create: `2/js/contact-links.js`
- Test: `2/tests/contact-links.test.js`

**Interfaces:**
- Consumes: `CONTACT` shape da Task 1 (`email`, `phoneTel`, `whatsapp`, `whatsappMessage`)
- Produces: `AzimuthContactLinks` con
  - `mailto(email: string): string`
  - `tel(phoneTel: string): string`
  - `whatsapp(number: string, message: string): string`

- [ ] **Step 1: Write the failing test**

Create `2/tests/contact-links.test.js`:

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/contact-links.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: FAIL (cannot find module `../js/contact-links.js`)

- [ ] **Step 3: Write minimal implementation**

Create `2/js/contact-links.js`:

```javascript
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthContactLinks = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function mailto(email) {
    return 'mailto:' + email;
  }

  function tel(phoneTel) {
    const n = String(phoneTel).replace(/\s/g, '');
    return n.startsWith('tel:') ? n : 'tel:' + n;
  }

  function whatsapp(number, message) {
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
  }

  return { mailto, tel, whatsapp };
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/contact-links.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add 2/js/contact-links.js 2/tests/contact-links.test.js
git commit -m "Aggiungi costruttori mailto, tel e WhatsApp."
```

---

### Task 3: Logica prenotazione chiamata

**Files:**
- Create: `2/js/booking.js`
- Test: `2/tests/booking.test.js`

**Interfaces:**
- Consumes: niente (data `now` iniettata)
- Produces: `AzimuthBooking` con
  - `buildSlots(now: Date): Array<{ id: string, label: string, period: 'mattina' | 'pomeriggio' }>` — 10 slot, dal giorno calendario successivo, saltando sabato e domenica, ore 10:00 e 15:00
  - `id` formato `YYYY-MM-DDTHH:mm`
  - `validateBooking({ name, email, slotId, slots, takenIds }): { ok: true } | { ok: false, error: string }`
  - `confirmMessage(slotId: string): string` — `Chiamata richiesta per [giorno ora]. Vi scriviamo per confermare.`
  - `DISCLAIMER: string` — riga sotto il pulsante

- [ ] **Step 1: Write the failing test**

Create `2/tests/booking.test.js`:

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const booking = require('../js/booking.js');

const WED = new Date(2026, 8, 9, 12, 0, 0); // 9 set 2026 mercoledì, locale

describe('AzimuthBooking.buildSlots', () => {
  it('restituisce 10 slot sui 5 giorni lavorativi successivi', () => {
    const slots = booking.buildSlots(WED);
    assert.equal(slots.length, 10);
    assert.equal(slots[0].id, '2026-09-10T10:00');
    assert.equal(slots[1].id, '2026-09-10T15:00');
    assert.equal(slots[4].id, '2026-09-14T10:00');
    assert.equal(slots[9].id, '2026-09-16T15:00');
  });
});

describe('AzimuthBooking.validateBooking', () => {
  const slots = booking.buildSlots(WED);

  it('rifiuta nome vuoto', () => {
    const r = booking.validateBooking({
      name: '  ', email: 'a@b.it', slotId: slots[0].id, slots, takenIds: []
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Inserisci il nome.');
  });

  it('rifiuta email non valida', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada', slotId: slots[0].id, slots, takenIds: []
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Inserisci un’email valida.');
  });

  it('rifiuta slot mancante', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada@b.it', slotId: '', slots, takenIds: []
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Scegli uno slot.');
  });

  it('rifiuta slot già preso', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada@b.it', slotId: slots[0].id, slots, takenIds: [slots[0].id]
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'Questo slot non è disponibile.');
  });

  it('accetta una richiesta valida', () => {
    const r = booking.validateBooking({
      name: 'Ada', email: 'ada@b.it', slotId: slots[1].id, slots, takenIds: [slots[0].id]
    });
    assert.deepEqual(r, { ok: true });
  });
});

describe('AzimuthBooking.confirmMessage', () => {
  it('dice che è una richiesta da confermare', () => {
    const msg = booking.confirmMessage('2026-09-10T10:00');
    assert.equal(
      msg,
      'Chiamata richiesta per giovedì 10 settembre 2026, ore 10:00. Vi scriviamo per confermare.'
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/booking.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: FAIL (cannot find module)

- [ ] **Step 3: Write minimal implementation**

Create `2/js/booking.js`:

```javascript
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthBooking = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DISCLAIMER = 'È una richiesta di chiamata: vi confermiamo lo slot con un messaggio.';
  const WEEKDAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const MONTHS_IT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function slotId(date, hour) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(hour) + ':00';
  }

  function isWeekend(date) {
    const d = date.getDay();
    return d === 0 || d === 6;
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function buildSlots(now) {
    const slots = [];
    const cursor = startOfDay(now);
    cursor.setDate(cursor.getDate() + 1);
    while (slots.length < 10) {
      if (!isWeekend(cursor)) {
        slots.push({
          id: slotId(cursor, 10),
          period: 'mattina',
          label: WEEKDAYS_IT[cursor.getDay()] + ' ' + cursor.getDate() + ' ' + MONTHS_IT[cursor.getMonth()] + ', 10:00'
        });
        slots.push({
          id: slotId(cursor, 15),
          period: 'pomeriggio',
          label: WEEKDAYS_IT[cursor.getDay()] + ' ' + cursor.getDate() + ' ' + MONTHS_IT[cursor.getMonth()] + ', 15:00'
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return slots;
  }

  function validateBooking({ name, email, slotId: id, slots, takenIds }) {
    if (!String(name || '').trim()) return { ok: false, error: 'Inserisci il nome.' };
    if (!/^\S+@\S+\.\S+$/.test(String(email || '').trim())) {
      return { ok: false, error: 'Inserisci un’email valida.' };
    }
    if (!id) return { ok: false, error: 'Scegli uno slot.' };
    const exists = (slots || []).some((s) => s.id === id);
    if (!exists || (takenIds || []).indexOf(id) !== -1) {
      return { ok: false, error: 'Questo slot non è disponibile.' };
    }
    return { ok: true };
  }

  function confirmMessage(id) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(id);
    if (!m) return 'Chiamata richiesta. Vi scriviamo per confermare.';
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    const day = WEEKDAYS_IT[date.getDay()] + ' ' + date.getDate() + ' ' + MONTHS_IT[date.getMonth()] + ' ' + date.getFullYear();
    const time = pad(date.getHours()) + ':' + pad(date.getMinutes());
    return 'Chiamata richiesta per ' + day + ', ore ' + time + '. Vi scriviamo per confermare.';
  }

  return { buildSlots, validateBooking, confirmMessage, DISCLAIMER };
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/booking.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: PASS (incluso `2026-09-14` dopo il weekend)

Se `confirmMessage` fallisce sul weekday (fuso), allinea il test alla stringa prodotta da `new Date(2026, 8, 10, 10, 0)` in locale Windows: il 10 settembre 2026 è giovedì.

- [ ] **Step 5: Commit**

```bash
git add 2/js/booking.js 2/tests/booking.test.js
git commit -m "Aggiungi slot lavorativi e validazione richiesta chiamata."
```

---

### Task 4: Render HTML (stringhe)

**Files:**
- Create: `2/js/render.js`
- Test: `2/tests/render.test.js`

**Interfaces:**
- Consumes: `AzimuthContent`, `AzimuthContactLinks` passati come argomenti (non leggere i global nel test)
- Produces: `AzimuthRender` con
  - `escapeHtml(str: string): string`
  - `contactBlock({ contact, links, variant: 'full' | 'compact' }): string` — deve contenere i 4 canali e `data-booking`
  - `homeSintesi({ services, phases, people, studioHref }): string`
  - `studioPage({ lead, services, phases, people, awards, contactHtml }): string`
  - `casePage({ project, prev, next, workHref, contactHtml }): string`
  - `notFound({ workHref, studioHref }): string`

`escapeHtml` deve convertire `& < > "` per testi inseriti.

- [ ] **Step 1: Write the failing test**

Create `2/tests/render.test.js`:

```javascript
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
      contactHtml: '<div data-booking></div>'
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/render.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: FAIL (cannot find module)

- [ ] **Step 3: Write minimal implementation**

Create `2/js/render.js` with UMD name `AzimuthRender`. Implementazione richiesta (non abbreviare i template: l’ingegnere copia questo blocco):

```javascript
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
      return '<figure><img src="' + escapeHtml(g.src) + '" alt="' + escapeHtml(g.alt) + ' loading="lazy"><figcaption>' + escapeHtml(g.caption) + '</figcaption></figure>';
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
```

Lead Studio (usare in hydrate, Task 8): `Studio Azimuth è un collettivo di designer a Milano. Uniamo grafica, motion e codice per costruire esperienze che si ricordano — e che un cliente può giudicare con calma.`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/render.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add 2/js/render.js 2/tests/render.test.js
git commit -m "Aggiungi render HTML di sintesi, Studio, casi e contatto."
```

---

### Task 5: Server 404 e risoluzione URL

**Files:**
- Create: `2/js/resolve-url.js`
- Modify: `2/server.js`
- Create: `2/404.html` (shell minima, idratata nel Task 8; per questo task deve esistere come file statico già servibile)
- Test: `2/tests/resolve-url.test.js`

**Interfaces:**
- Consumes: niente
- Produces: `resolveUrl(url: string): { status: 200 | 403, relative: string }`
  - strip query
  - `decodeURIComponent` del pathname
  - `/` → `/index.html`
  - rifiuta path che dopo `path.join` uscirebbero da root: lo fa il server con `startsWith`; `resolveUrl` rifiuta `..` nel path normalizzato (`status: 403`, `relative: ''`)

- [ ] **Step 1: Write the failing test**

Create `2/tests/resolve-url.test.js`:

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { resolveUrl } = require('../js/resolve-url.js');

describe('resolveUrl', () => {
  it('mappa la root a index.html', () => {
    assert.deepEqual(resolveUrl('/'), { status: 200, relative: '/index.html' });
  });

  it('ignora la query', () => {
    assert.equal(resolveUrl('/studio.html?x=1').relative, '/studio.html');
  });

  it('rifiuta path traversal', () => {
    assert.equal(resolveUrl('/../secret').status, 403);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/resolve-url.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: FAIL (cannot find module)

- [ ] **Step 3: Write minimal implementation**

Create `2/js/resolve-url.js`:

```javascript
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthResolve = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function resolveUrl(url) {
    let raw = String(url || '/').split('?')[0];
    let relative;
    try {
      relative = decodeURIComponent(raw);
    } catch (e) {
      return { status: 403, relative: '' };
    }
    if (relative === '/') relative = '/index.html';
    if (relative.indexOf('..') !== -1) return { status: 403, relative: '' };
    return { status: 200, relative: relative };
  }

  return { resolveUrl };
}));
```

Replace `2/server.js` with:

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const { resolveUrl } = require('./js/resolve-url.js');

const ROOT = __dirname;
const PORT = process.env.PORT || 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

function sendFile(res, filePath, status) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(status, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

http.createServer((req, res) => {
  const mapped = resolveUrl(req.url);
  if (mapped.status === 403) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  let filePath = path.join(ROOT, mapped.relative);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFound = path.join(ROOT, '404.html');
      return fs.stat(notFound, (err2, st2) => {
        if (err2 || !st2.isFile()) {
          res.writeHead(404);
          return res.end('404 Not Found');
        }
        sendFile(res, notFound, 404);
      });
    }
    sendFile(res, filePath, 200);
  });
}).listen(PORT, () => {
  console.log('Server attivo su http://localhost:' + PORT);
});
```

Create `2/404.html` (pagina autonoma, senza idratazione, così il 404 funziona anche se JS fallisce):

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Progetto non trovato — Studio Azimuth</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="page-inner">
  <header class="site-header">
    <a href="/index.html" class="logo">Studio<span>Azimuth</span></a>
    <nav class="nav">
      <a href="/index.html#work" class="nav-link">Work</a>
      <a href="/studio.html" class="nav-link">Studio</a>
      <a href="/index.html#contact" class="nav-link">Contatti</a>
    </nav>
  </header>
  <main class="inner-main">
    <header class="page-hero">
      <h1 class="sec-title">Progetto non trovato</h1>
      <p class="hero-sub">Questa pagina non esiste o il caso è stato spostato.</p>
      <p><a class="text-link" href="/index.html#work">Work</a> · <a class="text-link" href="/studio.html">Studio</a></p>
    </header>
  </main>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/resolve-url.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: PASS

Smoke (opzionale nello stesso step): `node server.js` in background, `curl -s -o NUL -w "%{http_code}" http://localhost:8000/work/non-esiste.html` atteso `404`. Poi termina il processo.

- [ ] **Step 5: Commit**

```bash
git add 2/js/resolve-url.js 2/tests/resolve-url.test.js 2/server.js 2/404.html
git commit -m "Servi 404.html per i percorsi mancanti."
```

---

### Task 6: CSS inner, sintesi, gallery, booking, canali

**Files:**
- Modify: `2/styles.css` (appendere in fondo, dopo il blocco `@media (max-width: 768px)` esistente)
- Test: visivo nel Task 10; nessun test Node

**Interfaces:**
- Consumes: classi emesse da `AzimuthRender` (`sintesi-grid`, `svc`, `phase-preview`, `people-preview`, `channels`, `booking-panel`, `gallery`, `case-next`, `page-inner`, `inner-main`, `person`, `phase`, `text-link`, `page-hero`, `case-hero`)
- Produces: stili usabili in home e pagine interne

- [ ] **Step 1: Append CSS**

Appendere a `2/styles.css`:

```css
/* ---------- Inner pages (no canvas spectacle) ---------- */
.page-inner {
  cursor: none;
}
.inner-main {
  position: relative;
  z-index: 4;
  padding: 0 6vw 6rem;
}
.page-inner .site-header {
  mix-blend-mode: difference;
}
.page-hero,
.case-hero {
  padding: 8rem 0 3rem;
  border-bottom: 1px solid var(--line);
}
.case-role {
  margin-top: 1rem;
  color: var(--muted);
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: .85rem;
}
.studio-block {
  padding: 4rem 0;
  border-bottom: 1px solid var(--line);
}
.studio-block h2 {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 500;
  margin-bottom: 1.6rem;
}
.text-link {
  display: inline-block;
  margin-top: 1.2rem;
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: .8rem;
  border-bottom: 1px solid var(--accent);
  padding-bottom: 2px;
}

/* sintesi home */
#sintesi { min-height: auto; padding-bottom: 5rem; }
.sintesi-kicker {
  font-family: var(--font-display);
  letter-spacing: .1em;
  text-transform: uppercase;
  font-size: .8rem;
  color: var(--accent);
  margin-bottom: 1.4rem;
}
.sintesi-grid {
  display: grid;
  gap: 4rem;
  padding-top: 3rem;
}
.svc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.6rem;
}
.svc h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  margin-bottom: .5rem;
}
.svc p { color: var(--muted); line-height: 1.55; font-size: .95rem; }
.svc-delivers { margin-top: .6rem; color: var(--ink); }
.phase-preview { list-style: none; }
.phase-preview li {
  padding: .7rem 0;
  border-bottom: 1px solid var(--line);
  color: var(--muted);
}
.phase-preview strong { color: var(--ink); display: block; font-family: var(--font-display); }
.people-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.person-card {
  display: flex;
  flex-direction: column;
  gap: .4rem;
}
.person-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  filter: grayscale(100%);
  border-radius: 8px;
}
.person-card span { font-family: var(--font-display); }
.person-card em { font-style: normal; color: var(--muted); font-size: .85rem; }

.phase-list { display: grid; gap: 2rem; }
.phase-num { color: var(--accent); letter-spacing: .16em; font-size: .8rem; }
.people-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.person img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  filter: grayscale(100%);
  margin-bottom: 1rem;
  border-radius: 8px;
}
.person-role { color: var(--accent); text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; margin: .4rem 0 1rem; }

.gallery {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}
.gallery figure img {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}
.gallery figcaption {
  margin-top: .5rem;
  font-size: .8rem;
  color: var(--muted);
}
.case-process { list-style: none; display: grid; gap: 1.4rem; }
.case-next {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding: 3rem 0;
  border-bottom: 1px solid var(--line);
}
.case-next-link {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.2rem);
}
.case-next-link span {
  display: block;
  font-family: var(--font-main);
  font-size: .75rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: .4rem;
}

.channels {
  list-style: none;
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0 2.5rem;
}
.channel {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--line);
  padding: .8rem 0;
  font-family: var(--font-display);
  font-size: 1.2rem;
}
.channel span { color: var(--muted); font-family: var(--font-main); font-size: .95rem; }
.contact-prompt {
  font-family: var(--font-display);
  font-size: 1.4rem;
  margin-bottom: 1rem;
}
.booking-panel h3 {
  font-family: var(--font-display);
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
.slot-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .6rem;
  margin-bottom: 1.2rem;
}
.slot-btn {
  border: 1px solid var(--line);
  background: transparent;
  padding: .7rem .8rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.slot-btn[aria-pressed="true"] { border-color: var(--accent); color: var(--accent); }
.slot-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
  text-decoration: line-through;
}
.booking-form {
  display: grid;
  gap: .8rem;
  max-width: 28rem;
}
.booking-form label { font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.booking-form input,
.booking-form textarea {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  font: inherit;
  padding: .5rem 0;
  color: var(--ink);
}
.booking-submit {
  margin-top: .6rem;
  border: 1px solid var(--ink);
  background: transparent;
  padding: .9rem 1.4rem;
  font-family: var(--font-display);
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  width: fit-content;
}
.booking-disclaimer { font-size: .85rem; color: var(--muted); margin-top: .6rem; }
.booking-msg { margin-top: .8rem; }
.booking-msg.is-error { color: var(--accent); }
.booking-msg.is-ok { color: var(--ink); }

@media (max-width: 900px) {
  .svc-grid, .people-grid, .people-preview, .gallery { grid-template-columns: 1fr; }
  .case-next { flex-direction: column; }
}
@media (max-width: 768px) {
  .page-inner { cursor: auto; }
  .slot-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Commit**

```bash
git add 2/styles.css
git commit -m "Aggiungi stili per sintesi, schede caso, canali e prenotazione."
```

---

### Task 7: Chrome condiviso e UI prenotazione

**Files:**
- Create: `2/js/site-chrome.js`
- Create: `2/js/booking-ui.js`
- Create: `2/js/hydrate.js`
- Modify: `2/script.js`
- Test: `2/tests/booking-ui-storage.test.js` (solo helper storage, senza DOM)

**Interfaces:**
- Consumes: `AzimuthBooking`, `AzimuthContent`, `AzimuthContactLinks`, `AzimuthRender`
- Produces:
  - `AzimuthChrome.init()` — cursore `#cursor` se presente; hover su `a, .project, .nav-link`; `click` su `a[data-placeholder-social]` → `preventDefault`; `a[href^="#"]` same-page → `scrollIntoView`
  - `AzimuthBookingUI.STORAGE_KEY = 'azimuth-taken-slots'`
  - `AzimuthBookingUI.readTaken(): string[]`
  - `AzimuthBookingUI.writeTaken(ids: string[]): void`
  - `AzimuthBookingUI.mount(el: Element, now?: Date): void` — se `el` è null, no-op
  - `AzimuthHydrate.run(): void` — vedi sotto

`readTaken` / `writeTaken` in Node: se `localStorage` manca, usare una variabile modulo `_mem`.

Demo “Non disponibile”: dopo `buildSlots`, se `taken` è vuoto, pre-marcare `slots[2].id` (terzo slot) **solo in memoria di visualizzazione**, senza scriverlo in storage, così al primo load si vede almeno uno slot preso. Label del bottone disabilitato: testo dello slot + ` (Non disponibile)`.

Markup montato da `mount`:
- `div.slot-grid` con un `button.slot-btn` per slot (`data-slot-id`, `type="button"`)
- form `.booking-form`: nome, email, nota opzionale, submit “Invia richiesta”
- `p.booking-disclaimer` = `AzimuthBooking.DISCLAIMER`
- `p.booking-msg` per ok/errore (`is-ok` / `is-error`)
- Submit non ok: messaggio, campi restano
- Submit ok: `writeTaken([...taken, slotId])`, messaggio `confirmMessage`, form visibile

`hydrate.js`:
```
data-page="home" → inserisce homeSintesi in #sintesi-root, contactBlock full in #contact-channels
data-page="studio" → studioPage in #page-root, poi mount booking
data-page="case" + data-slug → casePage oppure notFound; prefix link casi = stesso folder
```

Path prefix: `document.body.dataset.base || ''`  
Home: `data-base=""`, studioHref `studio.html`, work `index.html#work`  
Studio: `data-base=""`, contact full  
Case: `data-base="../"`, workHref `../index.html#work`, case links `slug.html` (stessa cartella)

- [ ] **Step 1: Write the failing test**

Create `2/tests/booking-ui-storage.test.js`:

```javascript
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const ui = require('../js/booking-ui.js');

describe('AzimuthBookingUI storage', () => {
  beforeEach(() => {
    ui.writeTaken([]);
  });

  it('legge e scrive gli slot presi', () => {
    assert.deepEqual(ui.readTaken(), []);
    ui.writeTaken(['2026-09-10T10:00']);
    assert.deepEqual(ui.readTaken(), ['2026-09-10T10:00']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/booking-ui-storage.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: FAIL (cannot find module)

- [ ] **Step 3: Write implementation**

Create `2/js/booking-ui.js`:

```javascript
(function (root, factory) {
  const Booking = (typeof require === 'function' && typeof document === 'undefined')
    ? require('./booking.js')
    : root.AzimuthBooking;
  const exported = factory(Booking);
  if (typeof module === 'object' && module.exports) module.exports = exported;
  else root.AzimuthBookingUI = exported;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (Booking) {
  'use strict';

  const STORAGE_KEY = 'azimuth-taken-slots';
  let mem = [];

  function storage() {
    try {
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) { /* ignore */ }
    return null;
  }

  function readTaken() {
    const s = storage();
    if (!s) return mem.slice();
    try {
      const raw = s.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeTaken(ids) {
    mem = ids.slice();
    const s = storage();
    if (s) s.setItem(STORAGE_KEY, JSON.stringify(mem));
  }

  function mount(el, now) {
    if (!el || !Booking) return;
    const slots = Booking.buildSlots(now || new Date());
    const stored = readTaken();
    const demoTaken = stored.length ? stored : [slots[2] && slots[2].id];
    let selected = '';

    el.innerHTML =
      '<div class="slot-grid"></div>' +
      '<form class="booking-form">' +
        '<label>Nome <input name="name" required autocomplete="name"></label>' +
        '<label>Email <input name="email" type="email" required autocomplete="email"></label>' +
        '<label>Nota sul progetto <textarea name="note" rows="3"></textarea></label>' +
        '<button class="booking-submit" type="submit">Invia richiesta</button>' +
      '</form>' +
      '<p class="booking-disclaimer">' + Booking.DISCLAIMER + '</p>' +
      '<p class="booking-msg" hidden></p>';

    const grid = el.querySelector('.slot-grid');
    const form = el.querySelector('.booking-form');
    const msg = el.querySelector('.booking-msg');

    function paint() {
      grid.innerHTML = '';
      slots.forEach(function (slot) {
        const taken = demoTaken.indexOf(slot.id) !== -1 && stored.indexOf(slot.id) !== -1
          ? true
          : demoTaken.indexOf(slot.id) !== -1 && stored.length === 0
            ? true
            : stored.indexOf(slot.id) !== -1;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.dataset.slotId = slot.id;
        const unavailable = stored.indexOf(slot.id) !== -1 || (stored.length === 0 && slot.id === demoTaken[0]);
        btn.disabled = unavailable;
        btn.textContent = unavailable ? slot.label + ' (Non disponibile)' : slot.label;
        btn.setAttribute('aria-pressed', selected === slot.id ? 'true' : 'false');
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          selected = slot.id;
          paint();
        });
        grid.appendChild(btn);
      });
    }

    paint();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = form.elements.name.value;
      const email = form.elements.email.value;
      const takenIds = readTaken().concat(stored.length === 0 ? demoTaken : []);
      const result = Booking.validateBooking({
        name: name,
        email: email,
        slotId: selected,
        slots: slots,
        takenIds: takenIds
      });
      msg.hidden = false;
      if (!result.ok) {
        msg.className = 'booking-msg is-error';
        msg.textContent = result.error;
        return;
      }
      const nextTaken = readTaken().concat([selected]);
      writeTaken(nextTaken);
      demoTaken.length = 0;
      nextTaken.forEach(function (id) { demoTaken.push(id); });
      msg.className = 'booking-msg is-ok';
      msg.textContent = Booking.confirmMessage(selected);
      paint();
    });
  }

  return { STORAGE_KEY, readTaken, writeTaken, mount };
}));
```

Nota implementativa: la condizione `unavailable` deve far vedere **al primo load** lo slot `slots[2]` come “Non disponibile”. Dopo un submit ok, `readTaken()` guida tutto. Se i test Node non hanno `document`, `mount` non viene eseguito dai test di questo task.

Create `2/js/site-chrome.js`:

```javascript
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AzimuthChrome = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function init() {
    if (typeof document === 'undefined') return;
    const cursor = document.getElementById('cursor');
    const cursorLabel = document.getElementById('cursor-label');
    if (cursor) {
      let cx = innerWidth / 2, cy = innerHeight / 2, mx = cx, my = cy;
      addEventListener('mousemove', function (e) {
        mx = e.clientX;
        my = e.clientY;
      }, { passive: true });
      (function loop() {
        cx += (mx - cx) * 0.18;
        cy += (my - cy) * 0.18;
        cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px) translate(-50%, -50%)';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('a, .project, .nav-link').forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          cursor.classList.add('grow');
          if (cursorLabel) {
            cursorLabel.textContent = el.getAttribute('data-cursor') || el.getAttribute('data-label') || '';
          }
        });
        el.addEventListener('mouseleave', function () {
          cursor.classList.remove('grow');
          if (cursorLabel) cursorLabel.textContent = '';
        });
      });
    }

    document.querySelectorAll('a[data-placeholder-social]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const href = a.getAttribute('href');
        if (!href || href === '#') {
          e.preventDefault();
          return;
        }
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  return { init };
}));
```

Create `2/js/hydrate.js`:

```javascript
(function () {
  'use strict';
  const C = window.AzimuthContent;
  const L = window.AzimuthContactLinks;
  const R = window.AzimuthRender;
  const UI = window.AzimuthBookingUI;
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

  document.querySelectorAll('[data-booking]').forEach(function (el) {
    if (UI) UI.mount(el);
  });
  if (Chrome) Chrome.init();
})();
```

Modify `2/script.js`:
- Rimuovere il blocco Cursor (linee dal commento `/* Cursor */` fino a prima di `/* Reveal on scroll */`, inclusa `colorizeHeroTitle` e `hoverables`).
- Rimuovere lo smooth scroll su `a[href^="#"]` (ora in chrome).
- Rimuovere il click vuoto sui `.project`.
- Tenere loader, `splitHero`, `startReveal`, IntersectionObserver.
- Estendere gli observer a `#sintesi, .svc, .person-card, .channels`.
- In fondo a `boot` (dopo `startReveal`), **non** chiamare Chrome: la home lo carica via hydrate. Quindi in `index.html` l’ordine script sarà: content, contact-links, booking, render, booking-ui, site-chrome, hydrate, poi blobs, script, matter, falling-balls, mid-blobs, shapes. `script.js` non deve chiamare `AzimuthChrome.init` (hydrate lo fa). Attenzione: hydrate gira a parse-time; il loader di `script.js` resta indipendente.
- `colorizeHeroTitle` usava `mx, my` del cursore. Per non perdere l’effetto colore sul titolo, lasciare in `script.js` solo:

```javascript
  let mx = innerWidth / 2, my = innerHeight / 2;
  let heroCharsCache = null;
  function colorizeHeroTitle() {
    if (!heroCharsCache) heroCharsCache = document.querySelectorAll('.hero-title .char');
    if (!heroCharsCache.length) return;
    const palette = ['var(--accent)', 'var(--muted)', 'var(--ink)'];
    const R = 220;
    for (const ch of heroCharsCache) {
      const rect = ch.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const d = Math.hypot(mx - cx, my - cy);
      if (d < R) {
        const t = d / R;
        const idx = Math.min(palette.length - 1, Math.floor(t * palette.length));
        ch.style.color = palette[idx];
      } else {
        ch.style.color = '';
      }
    }
  }
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; colorizeHeroTitle(); }, { passive: true });
```

Non duplicare il pallino cursore.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/booking-ui-storage.test.js`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: PASS

Poi: `node --test tests`  
Expected: tutti i test dei task 1–5 e questo PASS.

- [ ] **Step 5: Commit**

```bash
git add 2/js/booking-ui.js 2/js/site-chrome.js 2/js/hydrate.js 2/script.js 2/tests/booking-ui-storage.test.js
git commit -m "Aggiungi chrome condiviso, prenotazione UI e idratazione pagine."
```

---

### Task 8: Pagine HTML (Studio, casi, home)

**Files:**
- Modify: `2/index.html`
- Create: `2/studio.html`
- Create: `2/work/nebula-commerce.html`
- Create: `2/work/materia-festival.html`
- Create: `2/work/orbit-playground.html`
- Create: `2/work/archive-id.html`
- Modify: `2/404.html` (aggiungere `#cursor` per coerenza chrome, opzionale)

**Interfaces:**
- Consumes: hydrate + moduli `2/js/*`
- Produces: pagine navigabili

Header home (sostituire nav e logo):

```html
  <header class="site-header">
    <a href="#hero" class="logo">Studio<span>Azimuth</span></a>
    <nav class="nav">
      <a href="#work" class="nav-link" data-label="Work">Work</a>
      <a href="studio.html" class="nav-link" data-label="Studio">Studio</a>
      <a href="#contact" class="nav-link" data-label="Contatti">Contatti</a>
    </nav>
  </header>
```

- [ ] **Step 1: Aggiornare `index.html`**

1. Su `<body>` aggiungere `data-page="home"`.
2. Nav come sopra.
3. Tra `#hero` e `#work` inserire (al posto della vecchia logica “about solo lista”, la sezione about va **sostituita** da sintesi; gli awards restano solo in Studio):

Sostituire l’intera `<section id="about" ...>...</section>` con:

```html
    <section id="sintesi" class="section about">
      <div class="sec-head">
        <p class="sec-index">02 / Chi siamo</p>
        <h2 class="sec-title">Studio</h2>
      </div>
      <p class="about-lead">Sintesi per chi valuta un lavoro: cosa facciamo, come collaboriamo, chi c’è.</p>
      <div id="sintesi-root"></div>
    </section>
```

4. Wrappare ogni progetto in un link. Esempio primo:

```html
      <a class="project" data-project href="work/nebula-commerce.html" data-cursor="Vedi caso">
        <div class="project-num">01</div>
        <div class="project-info">
          <h3>Nebula Commerce</h3>
          <p>E-commerce immersivo con WebGL e transizione di prodotto 3D. Ricostruzione completa dell'esperienza di acquisto.</p>
        </div>
        <div class="project-visual"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" alt="Nebula Commerce" loading="lazy"></div>
        <div class="project-year">2024</div>
      </a>
```

Stesso pattern:
- `work/materia-festival.html`
- `work/orbit-playground.html`
- `work/archive-id.html`

5. In `#contact`, dopo `.contact-title`, sostituire il solo `mailto` con:

```html
      <div id="contact-channels"></div>
```

Lasciare `.contact-footer`. Social: aggiungere `data-placeholder-social` e `href="#"` resta, chrome blocca il salto.

6. Script **prima** di `blobs.js`:

```html
  <script src="js/content.js"></script>
  <script src="js/contact-links.js"></script>
  <script src="js/booking.js"></script>
  <script src="js/render.js"></script>
  <script src="js/booking-ui.js"></script>
  <script src="js/site-chrome.js"></script>
  <script src="js/hydrate.js"></script>
```

Poi i canvas scripts esistenti + `script.js` (script.js può restare dopo i canvas come ora, ma hydrate deve girare dopo i moduli e dopo che `#sintesi-root` esiste: è nel body, ok se gli script restano in fondo).

Ordine finale script in home:

```html
  <script src="js/content.js"></script>
  <script src="js/contact-links.js"></script>
  <script src="js/booking.js"></script>
  <script src="js/render.js"></script>
  <script src="js/booking-ui.js"></script>
  <script src="js/site-chrome.js"></script>
  <script src="js/hydrate.js"></script>
  <script src="blobs.js"></script>
  <script src="script.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  <script src="falling-balls.js"></script>
  <script src="mid-blobs.js"></script>
  <script src="shapes.js"></script>
```

- [ ] **Step 2: Create `2/studio.html`**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Studio — Studio Azimuth</title>
  <meta name="description" content="Processo, persone e cosa consegnamo. Studio Azimuth, Milano.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="page-inner" data-page="studio">
  <div id="cursor" aria-hidden="true"><span id="cursor-label"></span></div>
  <header class="site-header">
    <a href="index.html" class="logo">Studio<span>Azimuth</span></a>
    <nav class="nav">
      <a href="index.html#work" class="nav-link" data-label="Work">Work</a>
      <a href="studio.html" class="nav-link" data-label="Studio">Studio</a>
      <a href="#contact" class="nav-link" data-label="Contatti">Contatti</a>
    </nav>
  </header>
  <main class="inner-main" id="page-root"></main>
  <script src="js/content.js"></script>
  <script src="js/contact-links.js"></script>
  <script src="js/booking.js"></script>
  <script src="js/render.js"></script>
  <script src="js/booking-ui.js"></script>
  <script src="js/site-chrome.js"></script>
  <script src="js/hydrate.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create four case shells**

`2/work/nebula-commerce.html` (le altre tre identiche tranne `data-slug`, `<title>`):

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nebula Commerce — Studio Azimuth</title>
  <meta name="description" content="Caso Studio Azimuth: Nebula Commerce.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
</head>
<body class="page-inner" data-page="case" data-slug="nebula-commerce">
  <div id="cursor" aria-hidden="true"><span id="cursor-label"></span></div>
  <header class="site-header">
    <a href="../index.html" class="logo">Studio<span>Azimuth</span></a>
    <nav class="nav">
      <a href="../index.html#work" class="nav-link" data-label="Work">Work</a>
      <a href="../studio.html" class="nav-link" data-label="Studio">Studio</a>
      <a href="#contact" class="nav-link" data-label="Contatti">Contatti</a>
    </nav>
  </header>
  <main class="inner-main" id="page-root"></main>
  <script src="../js/content.js"></script>
  <script src="../js/contact-links.js"></script>
  <script src="../js/booking.js"></script>
  <script src="../js/render.js"></script>
  <script src="../js/booking-ui.js"></script>
  <script src="../js/site-chrome.js"></script>
  <script src="../js/hydrate.js"></script>
</body>
</html>
```

| File | `data-slug` | title |
| --- | --- | --- |
| `2/work/materia-festival.html` | `materia-festival` | Materia Festival — Studio Azimuth |
| `2/work/orbit-playground.html` | `orbit-playground` | Orbit Playground — Studio Azimuth |
| `2/work/archive-id.html` | `archive-id` | Archive ID — Studio Azimuth |

- [ ] **Step 4: Aggiornare CSS `.project`**

`a.project` è un link: aggiungere

```css
a.project { color: inherit; }
```

vicino a `.project` esistente, così il titolo non diventa blu da user agent.

- [ ] **Step 5: Commit**

```bash
git add 2/index.html 2/studio.html 2/work/nebula-commerce.html 2/work/materia-festival.html 2/work/orbit-playground.html 2/work/archive-id.html 2/styles.css 2/404.html
git commit -m "Collega home, Studio e schede caso all’idratazione."
```

---

### Task 9: Verifica flussi e ritocchi script home

**Files:**
- Modify: `2/script.js` se reveal non parte su sintesi (observer)
- Modify: `2/js/booking-ui.js` solo se lo slot demo o il form non rispettano la spec
- Test: `node --test tests` + verifica browser

**Interfaces:** nessuna nuova API.

- [ ] **Step 1: Run all unit tests**

Run: `node --test tests`  
Working directory: `C:\Users\Admin\Desktop\WORKSHOP AI\2`  
Expected: tutti PASS

- [ ] **Step 2: Avviare il server e verificare in browser**

Run: `node server.js`  
Apri `http://localhost:8000`

Checklist (tutti devono passare):

1. Home: hero e effetti restano; sotto c’è sintesi (4 attività, 5 fasi, 3 volti) e link a Studio.
2. Click su un progetto → scheda con brief, processo, deliverable, ≥4 immagini.
3. “Prossimo progetto” e “Precedente” cambiano caso; dall’ultimo si torna al primo.
4. Work in nav da un caso torna a `index.html#work`.
5. Studio: processo 5 fasi, 3 persone, servizi con “cosa consegnamo”, premi, contatto.
6. Email / telefono / WhatsApp visibili in home, Studio, caso.
7. Prenotazione: 10 slot, almeno uno “Non disponibile”, richiesta ok mostra conferma senza cancellare la pagina; richiesta senza slot mostra errore e tiene nome/email.
8. URL inesistente `http://localhost:8000/work/nope.html` → “Progetto non trovato” con Work e Studio.
9. Viewport ~375px: contenuti completi, niente cursore custom.
10. Social in footer: click non riporta in cima pagina.

- [ ] **Step 3: Fix se un punto della checklist fallisce**

Intervenire sul file specifico (render / hydrate / CSS / booking-ui). Ri-lanciare `node --test tests` se si tocca `2/js/*.js` di logica. Ri-verificare in browser il punto fallito **e** i punti vicini (home e caso).

- [ ] **Step 4: Commit**

```bash
git add 2
git commit -m "Verifica flussi Azimuth cliente-first e ritocchi di chiusura."
```

Solo file del sito `2/` (non `node_modules` di TEST SUPERPOWERS).

---

## Self-review (spec coverage)

| Requisito spec | Task |
| --- | --- |
| Cliente capisce processo, persone, cosa fate | 1, 4, 8 (sintesi + Studio) |
| Scheda completa brief/processo/deliverable/gallery | 1, 4, 8 |
| Pagina dedicata + next/prev loop | 1 neighbors, 4 casePage, 8 |
| Sintesi home + pagina Studio | 4, 8 |
| Email, tel, WhatsApp, prenotazione su home/Studio/caso | 2, 3, 4 contactBlock, 7, 8 |
| 10 slot, non disponibile, conferma richiesta, errore senza perdere dati | 3, 7 |
| Inner più calme, home wow | 6, 8 (no canvas inner) |
| 404 amichevole | 5, 8 |
| Reduced motion, mobile, social no jump | 6 (CSS esistente reduce), 7 chrome, 9 |
| Fuori ambito rispettato (no work archive, no blog, no i18n) | nessun task extra |

Nessun TBD. Nomi API allineati: `getProject`, `neighbors`, `buildSlots`, `validateBooking`, `contactBlock`, `mount`, `hydrate` `data-page`.
