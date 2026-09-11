# Specifica: Ascoli Piceno

Sito nel browser che rende visibili i Luoghi di Ascoli Piceno e gli Eventi che li animano. Glossario: [`CONTEXT.md`](../../CONTEXT.md). Decisioni: [`map.md`](map.md).

Non è una bacheca pubblica. Demo: ciò che il Creatore accetta vive nel `localStorage` del suo browser.

## Presentazione

Ibrido: mappa da esplorare, Proposte di chi vive il Territorio. Lingua: italiano.

- Tab e titolo: **Ascoli Piceno**
- Sotto: **Cosa accade in questi giorni**
- Pulsante globale: **Proponi un Evento**

## Stack

HTML, CSS e JavaScript, senza framework e senza bundler. OSM Buildings 3.x/4.x da CDN (3D, come il prototipo). Form Proposta verso Web3Forms. Persistenza delle Proposte accettate in `localStorage` nel browser del Creatore. Niente Leaflet, niente PWA, niente backend applicativo proprio.

Percorso Visitatore: pagina della mappa. Percorso Creatore: riservato (`/creatore` o `creatore.html`), senza password e senza link in vista Visitatore.

## Mappa

Centro storico di Ascoli Piceno (inquadro tipo zoom 16, tilt 45, ombre). Un **edificio**, un **colore**, un **Evento**. Pallino con stelo punteggiato; click sul pallino o sul volume. Popup overlay (volume 3D + testo). Niente pagina di dettaglio, niente filtri, niente categorie.

| Stato | Colore | Click |
| --- | --- | --- |
| In corso | arancio `#ff4d00` | sì |
| In arrivo | giallo `#eab308` | sì |
| Solo passato | grigio/pietra | sì |
| Nessun Evento | bianco | no |

Priorità del colore: in corso > in arrivo > passato. Il passato resta sul popup; il Creatore può toglierlo a mano. Niente archivio, niente taglio automatico.

## Semina (nel Sito, tutti la vedono)

Luoghi: Piazza del Popolo; Piazza Arringo; Cattedrale di Sant'Emidio; Chiesa di San Francesco; Teatro Ventidio Basso; Ponte di Cecco; Forte Malatesta; Giardini di Piazza Roma; Piazza Ventidio Basso; Battistero di San Giovanni.

Eventi 2026:

- 12 settembre — Aperture FAI del Teatro Ventidio Basso — Teatro Ventidio Basso
- 19 settembre — Mercatino dell’Antiquariato — Piazza del Popolo
- 2 agosto — Corteo storico della Quintana — Piazza Ventidio Basso
- 5 agosto — Festa di Sant’Emidio — Cattedrale di Sant’Emidio

Le frazioni restano Luoghi possibili via Proposta, non in semina.

## Proposta (Visitatore, nessun Account)

Sempre un Evento. Campi obbligatori verso Web3Forms: titolo; giorno (una data, senza ora né fine); testo breve; nome; email; Luogo da elenco **oppure** nome + testo su dove sta. Niente foto, telefono, ricorrenza.

## Revisione (Creatore)

La mail (o la dashboard Web3Forms) è l’inbox. Rifiutare è non copiare. La vista Creatore scrive nel suo `localStorage`: copia i campi, piazza un Luogo nuovo con click sulla mappa 3D, può inserire anche senza Proposta, può correggere e togliere. L’Evento accettato non compare sugli altri dispositivi.
