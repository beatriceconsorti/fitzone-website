# Dettaglio Luogo o solo popup

Type: grilling
Status: resolved

## Question

Il Visitatore che tocca un Luogo sulla mappa, dove legge?

1. Solo un **popup** (o equivalente) sulla mappa: nome, magari i prossimi Eventi, stop.
2. Il popup è un’anteprima; esiste anche una **pagina di dettaglio** del Luogo (testo, Eventi, magari come arrivarci).
3. Nessun popup: il tap apre subito la **pagina di dettaglio**.

Scenario: un Visitatore al telefono, in Piazza del Popolo, tocca il pin. Deve restare sulla mappa o uscire verso un’altra vista?

Questo decide cosa [Come si esplora la mappa](09-esperienza-mappa.md) deve prototipare. Non è identità visiva: è dove vive il contenuto del Luogo.

Raccomandazione: **1**. La specifica è un sito-demo centrato sulla mappa; una pagina di dettaglio è un secondo giro, dopo che il popup si è fatto giudicare.

## Answer

Il Visitatore legge il Luogo **solo sul popup** (o equivalente) sulla mappa: nome, Eventi di quel Luogo, stop. Nessuna pagina di dettaglio del Luogo, nessuna pagina dell’Evento. Il tap sul pin non lascia la mappa.

Cosa mostra esattamente il popup, e come si distingue un Luogo con Eventi in corso, sta nel prototipo [Come si esplora la mappa](09-esperienza-mappa.md).
