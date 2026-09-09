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
      title: 'Design d\u2019interazione',
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
      detail: 'Nelle settimane successive sistemiamo dettagli emersi dall\u2019uso reale e consegniamo sorgenti e istruzioni. Non è un contratto a tempo indeterminato: è la chiusura ordinata del lavoro.'
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
      bio: 'Progetta il movimento e i momenti in cui il sito risponde. Cerca il gesto giusto, non l\u2019effetto più rumoroso.',
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
      teaser: 'E-commerce immersivo con transizione di prodotto 3D. Ricostruzione completa dell\u2019esperienza di acquisto.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      brief: 'Il brand vendeva oggetti di design su un catalogo piatto: si capiva il prezzo, non il prodotto. Serviva un acquisto che facesse sentire materia e scala, senza perdere chiarezza su spedizione e checkout.',
      process: [
        { title: 'Mappa dell\u2019acquisto', text: 'Abbiamo seguito un cliente tipo dal primo sguardo alla conferma. I punti deboli erano la fiducia sul prodotto e il salto verso il carrello.' },
        { title: 'Direzione 3D utile', text: 'Il 3D mostra ruota, scala e finitura. Non è un videogioco: ogni gesto porta a "aggiungi" o "scopri".' },
        { title: 'Checkout sobrio', text: 'Dopo la scena immersiva, il pagamento torna calmo: pochi campi, riepilogo visibile, niente effetti sul form.' }
      ],
      deliverable: ['Sito e-commerce', 'Configuratore 3D prodotto', 'Sistema di transizioni', 'Linee guida di aggiornamento catalogo'],
      gallery: [
        { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80', alt: 'Nebula, atmosfera', caption: 'Atmosfera di ingresso' },
        { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80', alt: 'Prodotto', caption: 'Scheda prodotto' },
        { src: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80', alt: 'Acquisto', caption: 'Percorso verso l\u2019acquisto' },
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
      brief: 'Un festival di arti visive a Milano aveva un programma ricco e un volto debole. Serviva un\u2019identità che tenesse insieme locandine, social e un sito da sfogliare come una serata, non come un PDF.',
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
      brief: 'Un centro di ricerca voleva far toccare i dati orbitali a un pubblico non tecnico. L\u2019obiettivo non era un paper: era restare tre minuti a giocare e uscire con un\u2019immagine chiara.',
      process: [
        { title: 'Una metafora sola', text: 'Orbite visibili, masse che si attraggono. Niente dashboard. I numeri arrivano solo se li cerchi.' },
        { title: 'Prove col corpo', text: 'Abbiamo testato trascinamento e inerzia con persone esterne al team, finché il gesto era ovvio senza istruzioni.' },
        { title: 'Chiusura gentile', text: 'Una pagina "cosa avete visto" traduce il gioco in tre frasi, per chi vuole portare via il contenuto.' }
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
