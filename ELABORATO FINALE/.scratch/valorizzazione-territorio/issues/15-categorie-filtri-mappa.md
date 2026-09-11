# Servono categorie di Eventi e filtri sulla mappa

Type: grilling
Status: resolved
Blocked by: 09

## Question

Il prototipo giudicato in [Come si esplora la mappa](09-esperienza-mappa.md) distingue i Luoghi solo per stato temporale: in corso, in arrivo, nessun Evento. Non ci sono categorie (musica, mercato, sacro, …) né filtri.

Servono, nella specifica?

1. **No**: sulla mappa restano solo gli stati temporali.
2. **Categorie nei dati**, senza filtri in interfaccia al primo giro.
3. **Categorie e filtri** sulla mappa (il Visitatore restringe cosa vede).

Scenario: in un weekend coincidono un mercato, un concerto e una festa patronale. Senza filtri il Visitatore li vede tutti come in arrivo. Con i filtri deve già sapere che tipo cerca.

Questo non è il catalogo dei pin ([Quali Luoghi e Eventi di semina per Ascoli Piceno](10-luoghi-semina-ascoli.md)) né il tone of voice ([Taglio turistico o bacheca civica](13-taglio-turistico-o-bacheca.md)).

Raccomandazione: **1**. Il prototipo si è fatto giudicare senza. Se i tipi di Evento serviranno, usciranno dalla semina e dal taglio, non da una UI di filtro ora.

## Answer

**No.** Sulla mappa restano solo gli stati temporali: in corso, in arrivo, passato, nessun Evento. Niente categorie nei dati e niente filtri. Che Evento sia si legge sul popup.
