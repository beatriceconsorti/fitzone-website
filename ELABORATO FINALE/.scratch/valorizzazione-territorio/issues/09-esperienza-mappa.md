# Come si esplora la mappa

Type: prototype
Status: claimed
Blocked by: 01, 04, 05, 12

## Question

Come deve comportarsi la mappa, a bassa fedeltà, perché si possa reagire a qualcosa di concreto?

Da mostrare in un prototipo grezzo (outline o stub), non il sito finito:

- Inquadratura sul centro storico di Ascoli Piceno ([Quale comune è il Territorio](01-quale-comune.md)).
- Pin dei Luoghi di semina, con alcuni Eventi già attaccati ([Cosa c'è sulla mappa al primo avvio](05-contenuto-iniziale-mappa.md)); i nomi precisi restano in [Quali Luoghi e Eventi di semina per Ascoli Piceno](10-luoghi-semina-ascoli.md).
- Tap sul pin: **solo popup** sulla mappa (nome, Eventi di quel Luogo). Niente pagina di dettaglio ([Dettaglio Luogo o solo popup](12-dettaglio-luogo-o-popup.md)).
- Come si distinguono un Luogo senza Eventi e un Luogo con Eventi in corso.
- Da dove il Visitatore apre il form di Proposta (sulla mappa, da un Luogo, da una pagina a parte). Nessun Account: vedi [Come si autentica il Visitatore](02-autenticazione-visitatore.md).

Vincoli: italiano; valorizzazione, non GIS; **Leaflet** (vincolo di destinazione). Il prototipo deve farsi giudicare in un giro, non essere bello. Il tap sul pin segue [Dettaglio Luogo o solo popup](12-dettaglio-luogo-o-popup.md).

## Asset

Prototipo throwaway (tre varianti, `?variant=A|B|C`): [prototype-mappa.html](../prototype-mappa.html)

OSM Buildings **3D** come il viewer ufficiale (`zoom=16`, `tilt=45`, `rotation=-22`, ombre). Chiese e abitazioni: modelli con tetto (capanna / padiglione) da OSM + inferenza se mancano `roof:shape`. Arancio = Evento in corso.

- **A** — mappa piena, popup sul pin, pulsante globale «Proponi un Evento»
- **B** — elenco Luoghi + mappa, «Proponi» in intestazione
- **C** — mappa piena, foglio dal basso sul pin, «Proponi» da quel Luogo (o Luogo nuovo)
