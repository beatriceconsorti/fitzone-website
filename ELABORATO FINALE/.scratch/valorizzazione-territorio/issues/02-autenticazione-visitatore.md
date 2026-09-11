# Come si autentica il Visitatore

Type: grilling
Status: resolved

## Question

Il Visitatore deve avere un Account per usare il sito. Come nasce e come si riconosce quell’Account?

Da decidere, in un colpo solo perché stanno insieme:

1. Si può **vedere** la mappa senza Account, o l’intero sito è dietro al login?
2. L’Account si **registra** (email + password) o esistono solo Account di dimostrazione precaricati per l’elaborato?
3. Il **Creatore** entra con un Account distinto (stesso meccanismo, ruolo diverso) o con un accesso a parte?

Vincolo già deciso: niente backend applicativo proprio, finché Web3Forms + localStorage bastano. Quindi un login “vero” (email, OAuth, server sessioni) è in tensione con quel vincolo.

Raccomandazione: mappa visibile solo dopo login; Account salvati in localStorage (registrazione locale, senza server); un Account Creatore predefinito, distinto dai Visitatori. È un login da elaborato, non un sistema di identità reale. Web3Forms resta l’unico servizio esterno, per le Proposte.

## Answer

Il Visitatore **non si autentica**. Mappa e form di Proposta sono aperti. Non esiste Account: il Propositore si dice nei campi Web3Forms.

Il Creatore non è un Visitatore con un ruolo. Entra da un **percorso riservato** (nome sul Creatore: `/creatore` o `creatore.html`), **senza password**. Chi conosce quell’indirizzo, su quel browser, apre la Revisione. Nessun link “Accesso Creatore” in vista Visitatore.

Login, registrazione, OAuth e identità da elaborato sono fuori da questa destinazione.
