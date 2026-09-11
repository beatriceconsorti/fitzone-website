# Chi vede un Evento dopo la Revisione

Type: grilling
Status: resolved
Blocked by: 03

## Question

Dopo che il Creatore ha accettato una Proposta, chi deve vedere il nuovo Evento (o Luogo) sulla mappa?

Scenario: il Creatore revisiona sul proprio computer. Un Visitatore apre il sito da un altro telefono. Vede l’Evento nuovo, o solo il Creatore lo vede (perché localStorage è di quel browser)?

Fatti (ticket risolto [Cosa possono fare Web3Forms e localStorage insieme](03-web3forms-e-localstorage.md)): Web3Forms consegna email/dashboard (webhook Pro solo verso un URL terzo). `localStorage` è dello stesso origin nello stesso browser. Non esiste un percorso documentato, restando in quella coppia, in cui l’Evento accettato compaia sulla mappa di un altro Visitatore.

Quindi le tre strade non sono più simmetriche:

1. L’Evento accettato è visibile **solo nel browser del Creatore** (e in altre tab dello stesso profilo). Destinazione onesta per un elaborato-demo: Web3Forms avvisa, localStorage pubblica in locale.
2. Visibile **a ogni Visitatore che usa lo stesso browser/dispositivo del Creatore**. Stesso limite tecnico di 1, detto in altro modo.
3. Deve essere visibile **a tutti i Visitatori, su qualsiasi dispositivo**. Allora si **ridisegna la destinazione**: serve uno store condiviso (un terzo, che Web3Forms può solo *chiamare* via webhook Pro). localStorage non chiude più il giro pubblico.

Raccomandazione: **1**, se l’elaborato è una dimostrazione sul computer di Beatrice. **3** solo se il sito deve funzionare da vero bacheca pubblica; in quel caso il vincolo “solo Web3Forms + localStorage” esce dalla destinazione.

## Answer

Destinazione **demo** (opzione 1). Dopo la Revisione, l’Evento (o il Luogo) accettato vive nel `localStorage` del browser del Creatore e compare sulla mappa in quel browser. Non è una bacheca pubblica: un Visitatore su un altro dispositivo non vede le Proposte accettate. Web3Forms avvisa; localStorage pubblica in locale. Uno store condiviso e un backend applicativo proprio restano fuori da questo sforzo.
