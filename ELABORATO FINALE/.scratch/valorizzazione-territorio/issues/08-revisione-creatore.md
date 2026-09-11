# Come il Creatore revisiona le Proposte

Type: grilling
Status: open
Blocked by: 03, 06

## Question

Il Creatore riceve la Proposta via Web3Forms (una mail). Dove e come la accetta, così finisce in localStorage e sulla mappa?

Fatti (ticket [Cosa possono fare Web3Forms e localStorage insieme](03-web3forms-e-localstorage.md)): Web3Forms non ha un’azione “accept” che pubblica sul sito. Destini dopo il submit: email; storico dashboard / Submissions API in sola lettura (Pro); webhook verso un terzo (Pro). Un `fetch` di successo torna solo al browser che ha inviato. Se il form scrive anche in `localStorage` al submit, quella copia vive nel browser del **Propositore**, non in una coda del Creatore.

1. Solo **fuori dal sito**: legge la mail (o la dashboard Web3Forms) e poi, a mano, aggiunge l’Evento in una vista Creatore sul sito.
2. Una **coda sul sito** alimentata da sola: non è documentata, restando in Web3Forms + localStorage. Diventa possibile solo se [Chi vede un Evento dopo la Revisione](06-chi-vede-evento-pubblicato.md) introduce uno store condiviso.
3. Ibrido: la mail è l’avviso; il Creatore copia i campi in una vista sul sito che scrive nel *suo* localStorage. La dashboard Web3Forms può sostituire la mail come inbox, ma resta fuori dal sito.

La vista Creatore si raggiunge dal percorso riservato deciso in [Come si autentica il Visitatore](02-autenticazione-visitatore.md): `/creatore` (o `creatore.html`), senza password e senza link in vista Visitatore.

Scenario: il Creatore è al telefono, legge la mail, non ha il laptop. L’Evento resta in attesa finché non apre quella vista sul browser dove vive lo storage.

Raccomandazione: **3** (mail o dashboard come inbox; vista Creatore per pubblicare in localStorage), allineata a una destinazione-demo. Non costruire una coda “vera” sul sito senza lo store deciso in [Chi vede un Evento dopo la Revisione](06-chi-vede-evento-pubblicato.md).
