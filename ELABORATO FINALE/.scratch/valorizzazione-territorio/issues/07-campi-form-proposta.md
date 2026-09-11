# Quali campi ha il form di Proposta

Type: grilling
Status: resolved
Blocked by: 04

## Question

Quali informazioni deve mandare il Visitatore con Web3Forms perché il Creatore possa fare la Revisione senza scrivere indietro?

Vincolo da [Una Proposta può creare un Luogo nuovo](04-proposta-evento-o-luogo.md): ogni Proposta è un Evento; il Luogo è scelto da elenco **oppure** descritto come nuovo insieme a quell’Evento. Non c’è un form “solo pin”.

Minimo per un Evento su Luogo esistente: Luogo, titolo, data (e ora?), breve descrizione, nome del Propositore. Per un Luogo nuovo servono anche i campi che fanno trovare il pin (nome, dove sta).

Da decidere anche: foto sì/no — gli allegati Web3Forms sono Pro, un file fino a 5 MB, e i webhook non li includono ([Cosa possono fare Web3Forms e localStorage insieme](03-web3forms-e-localstorage.md)); contatto del Propositore obbligatorio; fine Evento o solo giorno unico; come si indica un Luogo nuovo (indirizzo, testo libero, altro).

Raccomandazione: titolo, Luogo (elenco) oppure indirizzo se è un Luogo nuovo, data inizio, testo breve, nome e email del Propositore. Niente foto al primo giro: tengono fuori dal form la parte più fragile.

## Answer

La Proposta manda a Web3Forms, tutti obbligatori:

- Titolo dell’Evento
- Giorno (una data, senza ora e senza fine)
- Testo breve
- Nome del Propositore
- Email del Propositore
- Luogo: scelta dall’elenco **oppure** Luogo nuovo (nome + testo libero su dove sta). Il Creatore mette il punto in Revisione.

Niente foto, telefono, categorie, “si ripete”. Un Evento è un giorno, non una serie: la ricorrenza è fuori da questa specifica.
