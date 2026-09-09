# Studio Azimuth — Portfolio cliente-first

Data: 2026-09-09  
Prodotto: sito one-page esistente di Studio Azimuth (cartella `2/`), da estendere  
Stato: design approvato in sessione brainstorming

## 1. Problema

Oggi il sito fa “wow” ma non aiuta un potenziale cliente a decidere. I progetti sono teaser senza profondità. Lo studio è una bio breve e una lista di servizi. Il contatto è solo un’email.

Il visitatore principale è un **cliente che valuta se affidare un lavoro**. I designer restano un pubblico secondario: devono trovare lavoro e carattere, senza che il sito sia fatto per loro.

## 2. Obiettivo

Un cliente deve poter:

1. Capire **chi siete**, **come si lavora insieme** e **cosa consegnate in concreto**
2. Aprire un progetto e giudicare il lavoro da una **scheda completa** (brief, processo, deliverable, gallery)
3. Contattarvi **subito dopo**, con il canale che preferisce

Successo: dopo una visita, il cliente sa se lo studio è adatto, ha visto almeno un caso per intero, e ha un modo chiaro per scrivere, chiamare, usare WhatsApp o prenotare una chiamata.

## 3. Fuori ambito (prima versione)

- Pagina archivio Work separata dalla home
- Blog, news, magazine
- Area clienti, login, preventivatore
- E-commerce o booking di servizi a pagamento
- Multilingua (il sito resta in italiano)
- Cambio identità visiva (palette, font, tono Azimuth restano)

## 4. Approccio scelto

Tra tre percorsi possibili:

- **A — Sito studio riconoscibile (scelto):** home da spettacolo con sintesi; pagina Studio; pagine caso con “prossimo progetto”; contatto su ogni pagina.
- **B — Esperienza unica continua:** casi in overlay sulla home, studio come capitolo dello scroll. Più da studio digitale, meno comodo da condividere e da rileggere.
- **C — Archivi di casi:** la home è soprattutto lavori. Forte per i designer, debole per il cliente che deve capire il metodo.

Scelto **A**: un cliente si orienta, può mandare il link di un caso, approfondisce solo se vuole. Lo spettacolo resta in home.

## 5. Come si muove il visitatore

### 5.1 Percorso principale (cliente)

1. Arriva in home, vede il carattere dello studio (hero attuale).
2. Scorre una **sintesi**: cosa fate in concreto, un assaggio del metodo, i volti.
3. Entra in un progetto dalla lista. Legge brief → processo → deliverable → gallery.
4. In fondo può aprire il caso successivo **oppure** contattarvi (quattro canali).
5. Se vuole di più su di voi, apre **Studio** (da nav o dalla sintesi in home).

### 5.2 Percorso secondario (designer)

Stesso sito. Può andare dritto ai casi e alla pagina Studio. Non c’è un’esperienza parallela: solo contenuto abbastanza ricco da restare interessante.

### 5.3 Navigazione globale

Sempre visibile: logo (torna home), Work (lista progetti in home), Studio, Contatti.

Work **non** è una pagina nuova: porta alla lista in home. Dai casi e da Studio, “Work” riporta a quella lista.

Contatti: in home scorre alla sezione contatti. Su Studio e sulle schede caso scorre al blocco contatto di quella pagina.

## 6. Pagine e contenuto

### 6.1 Home

Resta la pagina dello spettacolo (loader, hero, effetti). Cambia il contenuto sotto l’hero.

**Sintesi Studio (nuova, obbligatoria)**

- **Cosa fate in concreto:** quattro attività già presenti (siti interattivi, design d’interazione, motion & WebGL, brand identity). Per ognuna: una frase su cosa significa per il cliente e cosa si porta a casa. Non solo titoli.
- **Come lavoriamo (assaggio):** le stesse 5 fasi della pagina Studio, una riga ciascuna. Link “Il metodo completo” → pagina Studio.
- **Persone (assaggio):** volti, nome, ruolo. Link “Il collettivo” → pagina Studio.

**Progetti**

I quattro lavori restano in lista. Ogni card è cliccabile e apre la scheda del caso. Hover: resta il comportamento attuale (cursore / etichetta tipo “Vedi caso”).

**Contatti**

Sezione ampliata, non solo mailto:

| Canale | Comportamento |
| --- | --- |
| Email | `hello@studioazimuth.it` — apre il client di posta |
| Telefono | numero visibile; tap/click avvia la chiamata |
| WhatsApp | apre la chat con messaggio precompilato (“Ciao, vorrei parlare di un progetto”) |
| Prenota una chiamata | apre il blocco prenotazione (stesso della sezione 7) |

Telefono e WhatsApp usano placeholder da sostituire (es. `+39 02 0000 0000`). In UI deve essere ovvio che sono i recapiti dello studio.

### 6.2 Pagina Studio

Più calma della home: stesso carattere (tipo, arancione, whitespace), meno effetti. Si legge prima di tutto.

Ordine della pagina:

1. Titolo e lead: chi è Azimuth in 2–3 frasi (collettivo a Milano, grafica + motion + codice).
2. **Cosa facciamo in concreto** — le quattro attività, ciascuna con paragrafo e “cosa consegnamo”.
3. **Come lavoriamo** — processo in 5 fasi, ciascuna con titolo + 2–4 frasi su cosa succede e cosa serve dal cliente:
   1. Ascolto e brief
   2. Concept e direzione
   3. Design e motion
   4. Costruzione e lancio
   5. Follow-up
4. **Persone** — tre profili (placeholder sostituibili): nome, ruolo, 2–3 frasi, foto. Ruoli: direzione creativa / design; motion e interazione; design e sviluppo. Non è un organigramma: è volto umano.
5. **Riconoscimenti** — gli stessi già in home (Awwwards, FWA, CSSDA), in forma compatta.
6. Blocco contatto con i quattro canali.

### 6.3 Pagina caso (una per progetto)

Quattro casi, tutti con lo stesso schema. URL dedicata, condivisibile.

Ordine:

1. **Testata:** titolo, anno, ruolo dello studio (es. “Direzione creativa, sito, motion”).
2. **Brief:** il problema del cliente, in linguaggio non tecnico.
3. **Processo:** come avete affrontato *quel* lavoro (non il metodo generico dello Studio). 3–5 passi.
4. **Deliverable:** elenco concreto di cosa è stato consegnato.
5. **Gallery:** almeno 4 immagini per caso, con didascalia breve. Se un’immagine manca, lo slot non si mostra vuoto: si omettono i buchi.
6. **Prossimo / precedente progetto** — titolo + visivo piccolo; si può sfogliare senza tornare alla lista. L’ultimo caso punta al primo (loop).
7. **Contatto compatto** — i quattro canali, con una riga tipo “Questo tipo di lavoro vi serve?”

I quattro progetti restano quelli esistenti (Nebula Commerce, Materia Festival, Orbit Playground, Archive ID). Il copy delle schede è editoriale, coerente con le descrizioni già in home, non elenco di tecnologie.

Tono delle pagine interne: **carattere Azimuth, contenuto prima**. Niente palline/blob a pieno schermo che coprono la lettura. Un accenno visivo (linea, cursore, hover) è ammesso.

## 7. Prenotazione chiamata

Il cliente sceglie uno slot, lascia nome, email e una nota opzionale sul progetto, conferma.

Comportamento:

- Vede una griglia dei prossimi 5 giorni lavorativi, due slot al giorno (mattina e pomeriggio), 10 slot in totale.
- Slot già presi: visibili ma non cliccabili, con etichetta “Non disponibile”.
- Invio ok: messaggio di conferma sulla pagina (“Chiamata richiesta per [giorno ora]. Vi scriviamo per confermare.”). Non si sparisce il resto della pagina.
- Invio non ok: messaggio chiaro e i dati restano nel modulo, si può riprovare.
- Nessun account, nessun pagamento.

La conferma è una **richiesta di chiamata**, non un calendario sincronizzato con la vita reale in questa versione: lo studio ricontatta per confermare. Questo va detto in una riga sotto il pulsante, così il cliente non crede di aver chiuso un appuntamento automatico.

## 8. Interfaccia e stati

- **Desktop e mobile:** stesso contenuto. In home gli effetti pesanti restano; su mobile il cursore custom resta nascosto come ora.
- **Riduzione movimento:** chi la ha attiva non perde contenuto, solo animazioni.
- **Caso inesistente:** pagina breve “Progetto non trovato” con link a Work e Studio. Mai schermata vuota o errore tecnico visibile.
- **Link social** (Instagram, Behance, Dribbble, LinkedIn): restano nel footer; se l’URL è `#`, il click non deve sembrare rotto — in questa versione si possono lasciare come placeholder visibili ma va evitato un salto in cima pagina. Preferibile: aprire in nuova scheda solo quando l’URL è reale.
- **Accesso ai quattro canali:** visibili in home (contatti), in Studio, in ogni caso, e nel footer delle pagine interne.

## 9. Contenuti placeholder

Tutto il copy nuovo può essere editoriale di partenza (studio fittizio, come i casi attuali). Nome, telefono, WhatsApp, foto team e immagini gallery sono **sostituibili** senza cambiare la struttura.

Non si chiede al cliente (visitatore) di caricare file o creare account.

## 10. Criteri di verifica (prodotto)

Si considera fatto quando:

1. Dalla home si capisce cosa fate, come lavorate (assaggio) e chi c’è, e si può approfondire in Studio.
2. Ogni progetto della lista apre una scheda con brief, processo, deliverable e gallery.
3. Da una scheda si va al caso successivo e si torna alla lista.
4. Email, telefono, WhatsApp e prenotazione chiamata sono usabili da home, Studio e scheda caso.
5. La prenotazione mostra conferma o errore senza far perdere i dati.
6. Home resta riconoscibile come Azimuth; Studio e casi si leggono con calma.
7. Su viewport stretta (~375px) e larga (~1280px) i flussi sopra restano completi.

## 11. Decisioni già prese in intervista

| Tema | Decisione |
| --- | --- |
| Pubblico | Cliente prima; designer secondario |
| Cosa deve capire il cliente | Processo + persone + cosa fate in concreto |
| Dentro un progetto | Scheda completa: brief, processo, deliverable, gallery |
| Lista → caso | Pagina dedicata + sfoglio al caso successivo |
| Studio | Sintesi in home + pagina Studio |
| Contatto | Email + telefono + WhatsApp + prenotazione chiamata |
| Tono pagine interne | Carattere dello studio, contenuto prima |
| Prima versione | I tre pezzi vitali: casi, Studio, contatto dopo il caso |
