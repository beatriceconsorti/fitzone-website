# Cosa possono fare Web3Forms e localStorage insieme

Type: research
Status: resolved

## Question

La destinazione chiede tre pezzi insieme: il Visitatore invia una Proposta con **Web3Forms**; il Creatore la **revisiona**; una volta accettata, la Proposta è salvata in **localStorage** e deve comparire sulla mappa.

Cosa dicono le fonti primarie su questo accoppiamento?

Da accertare, con citazioni:

- Web3Forms cosa fa esattamente dopo il submit (email, dashboard, webhook, file, limite campi)? Non può “scrivere” sulla mappa da solo?
- localStorage: di chi è, quanto dura, è visibile agli altri Visitatori su altri dispositivi?
- Esiste un percorso documentato in cui il Creatore, dopo aver letto la mail, fa comparire l’Evento per tutti i Visitatori — restando dentro Web3Forms + localStorage?

L’esito deve dire, in fatti e non in opinioni, se la destinazione è raggiungibile così com’è o se il pezzo “compare sulla mappa per gli altri Visitatori” è incompatibile con questi due strumenti.

## Answer

Web3Forms, dopo il submit, invia la Proposta all’email del Creatore (e può conservarla in dashboard / esporla in sola lettura; i webhook Pro partono verso un URL terzo). Non scrive sulla mappa. `localStorage` è dello stesso origin nello stesso browser: non è visibile agli altri Visitatori su altri dispositivi. Non esiste un percorso documentato, restando in Web3Forms + localStorage, in cui il Creatore dopo la mail faccia comparire l’Evento per tutti. La destinazione così com’è non è raggiungibile: “compare sulla mappa per gli altri Visitatori” è incompatibile con questi due strumenti.

Findings: [research/web3forms-e-localstorage.md](../research/web3forms-e-localstorage.md)
