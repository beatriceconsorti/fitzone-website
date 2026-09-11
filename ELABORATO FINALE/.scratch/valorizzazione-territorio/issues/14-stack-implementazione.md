# Con quale stack si implementa la specifica

Type: grilling
Status: resolved

## Question

La destinazione è una specifica pronta da implementare. Con che strumenti si costruirà il Sito, così la spec non resta ambigua?

Vincoli già decisi: form Proposta con Web3Forms; persistenza in localStorage nel browser del Creatore; niente backend applicativo proprio; niente PWA. Il prototipo giudicato in [Come si esplora la mappa](09-esperienza-mappa.md) è OSM Buildings **3D**, non Leaflet: la libreria della mappa è parte di questa scelta.

1. **HTML, CSS e JavaScript** senza framework; OSM Buildings da CDN, come il prototipo.
2. Stesso, ma **Leaflet 2D** da CDN (vincolo originale, prima del prototipo).
3. Un **bundler + framework** (Vite e React, o equivalente) con la libreria mappa come dipendenza.
4. Un **sito statico con tool di build** ma senza UI framework (Vite o simile, JS a moduli).

Scenario: Beatrice apre il repo e deve capire da dove partire. La spec deve nominare una strada, non “qualunque mappa nel browser”.

Raccomandazione: **1**. Web3Forms è un form HTML; localStorage è l’API del browser; OSM Buildings ha un’API da script, già giudicata. Un framework non sblocca la destinazione-demo.

## Answer

**HTML, CSS e JavaScript** senza framework. Mappa: **OSM Buildings 3D** da CDN, come il prototipo. Form Proposta in HTML verso Web3Forms; `localStorage` nel browser del Creatore. Niente React, niente bundler, niente Leaflet. Beatrice parte da file statici serviti nel browser.
