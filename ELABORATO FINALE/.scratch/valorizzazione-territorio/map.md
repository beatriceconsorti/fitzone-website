# Mappa: sito di valorizzazione del territorio

Label: `wayfinder:map`

## Destination

Una specifica pronta da implementare per un sito (pagina web nel browser, non PWA) che valorizza i Luoghi di Ascoli Piceno e gli Eventi che li animano, su una mappa interattiva Leaflet, già popolata al primo avvio da Luoghi ed Eventi di semina; il tap sul pin apre un popup sulla mappa, senza pagina di dettaglio. Il Visitatore esplora e invia una Proposta (form Web3Forms) senza Account: è sempre un Evento, su un Luogo esistente o su un Luogo nuovo descritto insieme. Il Creatore apre la Revisione da un percorso riservato, senza password; i dati accettati si salvano in localStorage nel suo browser e lì comparono sulla mappa. Non è una bacheca pubblica: gli altri Visitatori, su altri dispositivi, non vedono le Proposte accettate.

## Notes

- Elaborato finale; Beatrice è designer e vuole poi lavorare in codice, ma questa mappa produce **decisioni e specifica**, non il sito, finché restano ticket aperti.
- Lingua del prodotto: italiano.
- Skills da consultare in ogni sessione: grilling, domain-modeling. Per integrazioni esterne: research. Per la mappa interattiva: prototype.
- Glossario: [`CONTEXT.md`](../../CONTEXT.md).
- Tracker: markdown locale in `.scratch/valorizzazione-territorio/`.
- Vincoli di destinazione: Leaflet; form Proposta con Web3Forms; dopo la Revisione, persistenza in localStorage nel browser del Creatore. I fatti sono in [Cosa possono fare Web3Forms e localStorage insieme](issues/03-web3forms-e-localstorage.md). La visibilità è chiusa in [Chi vede un Evento dopo la Revisione](issues/06-chi-vede-evento-pubblicato.md).

## Decisions so far

- [Cosa possono fare Web3Forms e localStorage insieme](issues/03-web3forms-e-localstorage.md): Web3Forms consegna email/dashboard (webhook Pro solo verso terzi); localStorage è del singolo browser; insieme non fanno comparire l’Evento sulla mappa degli altri Visitatori.
- [Quale comune è il Territorio](issues/01-quale-comune.md): comune di Ascoli Piceno; primo inquadro sul centro storico; le frazioni restano Luoghi possibili.
- [Chi vede un Evento dopo la Revisione](issues/06-chi-vede-evento-pubblicato.md): demo: l’Evento accettato vive nel localStorage del browser del Creatore; non è una bacheca pubblica.
- [Come si autentica il Visitatore](issues/02-autenticazione-visitatore.md): nessun Account; mappa e Proposta aperti; il Creatore entra da un percorso riservato senza password.
- [Una Proposta può creare un Luogo nuovo](issues/04-proposta-evento-o-luogo.md): ogni Proposta è un Evento; il Luogo nuovo è ammesso solo insieme a quel primo Evento.
- [Cosa c'è sulla mappa al primo avvio](issues/05-contenuto-iniziale-mappa.md): Luoghi e pochi Eventi di semina nel Sito; le Proposte accettate si aggiungono nel localStorage del Creatore.
- [Dettaglio Luogo o solo popup](issues/12-dettaglio-luogo-o-popup.md): solo popup sulla mappa; niente pagina di dettaglio del Luogo né dell’Evento.

## Not yet specified

- Hosting e come il Creatore mette online il sito (la destinazione è la specifica, non il deploy).
- Categorie di Eventi e filtri sulla mappa: restano in fog finché [Come si esplora la mappa](issues/09-esperienza-mappa.md) non mostra se servono.
- Se un Evento può ripetersi (ricorrenza): dipende da [Quali campi ha il form di Proposta](issues/07-campi-form-proposta.md) (data unica vs inizio/fine).

## Out of scope

- App nativa e PWA.
- Più comuni o una rete di territori.
- Pagamenti, biglietti, prenotazioni.
- Commenti, like, o social network tra Visitatori.
- Store condiviso e backend applicativo proprio: esclusi da questa destinazione-demo; l’Evento accettato non deve comparire sui dispositivi degli altri Visitatori.
- Account, login, registrazione, OAuth: il Visitatore non si autentica; il cancello del Creatore è solo un percorso riservato.
- Proposta di un Luogo senza Evento: il Visitatore non segnala pin nudi; un Luogo senza date lo mette solo il Creatore.
- Pagine di dettaglio di Luogo o Evento: il contenuto si legge sul popup in mappa.
