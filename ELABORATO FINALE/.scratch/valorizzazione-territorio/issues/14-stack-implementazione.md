# Con quale stack si implementa la specifica

Type: grilling
Status: open

## Question

La destinazione è una specifica pronta da implementare. Con che strumenti si costruirà il Sito, così la spec non resta ambigua?

Vincoli già decisi: Leaflet; form Proposta con Web3Forms; persistenza in localStorage nel browser del Creatore; niente backend applicativo proprio; niente PWA.

1. **HTML, CSS e JavaScript** senza framework, Leaflet da CDN.
2. Un **bundler + framework** (Vite e React, o equivalente) con Leaflet come dipendenza.
3. Un **sito statico con tool di build** ma senza UI framework (Vite o simile, JS a moduli).

Scenario: Beatrice apre il repo e deve capire da dove partire. La spec deve nominare una strada, non “qualunque mappa nel browser”.

Raccomandazione: **1**. Web3Forms è un form HTML; localStorage è l’API del browser; Leaflet ha un’API da script. Un framework non sblocca la destinazione-demo e allontana l’elaborato dal vincolo dichiarato.
