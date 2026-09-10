# Home — loader a palline

Data: 2026-09-10  
Prodotto: Studio Azimuth, cartella `2/`  
Stato: design approvato in sessione brainstorming (approccio A)

## 1. Problema

La home si apre con uno schermo nero, il nome dello studio, una barra e una percentuale finta. È un caricamento da sito “premium 2018”, non il gesto dello studio.

Il riferimento è [patrickheng.com](https://patrickheng.com/): il sito si carica **attraverso le palline**, poi quelle palline **sono** il carattere della pagina.

## 2. Obiettivo

Ogni volta che si apre la **home**, il visitatore vede solo palline. Quando il sito è pronto, quelle palline diventano blob e palline della home. Titolo e menu arrivano insieme a quel passaggio.

Successo: si capisce che il sito sta arrivando senza leggere un numero; il passaggio alla home è un solo gesto, non un overlay che sparisce e un altro mondo che compare.

## 3. Fuori ambito

- Loader su Studio, pagine caso, 404
- Copiare 1:1 colori, timing o WebGL di Heng
- Barra, percentuale, scritta “Studio Azimuth” nel loader
- Pulsante per saltare il rituale
- Cambiare fisica o quantità delle palline **dopo** che la home è viva
- Identità (palette, font, tono) — restano Azimuth

## 4. Approccio scelto

Tra tre percorsi:

- **A — Palline al centro che diventano la home (scelto):** schermo carta, pochi dischi al centro, crescono, poi sono blob e palline della home.
- **B — Mucchio che cade:** le palline nascono già come quelle che cadono, poi parte la gravità. Più laboratorio, meno cerimonia.
- **C — Riempimento totale:** i dischi coprono lo schermo e poi si “rompe”. Più spettacolo, più stacco.

Scelto **A**.

## 5. Dove e quando

- Solo `index.html` (home).
- **Ogni load** di `index.html`: primo arrivo, refresh, logo, Work da un’altra pagina. Non solo la prima volta della sessione.
- Se sei già in home e clicchi Work / Contatti (ancora nella stessa pagina): il rituale **non** riparte.
- Arrivare su Studio o su un caso: nessun rituale a palline.

## 6. Sequenza (cosa si vede)

1. **Vuoto.** Sfondo carta Azimuth (`--bg`). Niente logo, menu, titolo, barra, percentuale.
2. **Nascita.** Al centro, 4 dischi pieni, leggermente sfalsati (come una registrazione di stampa): arancio, nero, grigio scuro, grigio. Piccoli.
3. **Attesa.** I dischi crescono (e restano leggermente offset). Se il load è lento, continuano un respiro lento. Nessun numero.
4. **Passaggio.** Quando il sito è pronto (asset caricati **e** un tempo minimo, così non lampeggia): i 4 dischi si allargano e si sciolgono nelle forme già della home — blob grandi e palline che cadono, stessi colori. Overlay del loader sparisce. Header, titolo, sottotitolo e CTA compaiono con il reveal già esistente.
5. **Home viva.** Da qui: cursore, blob, palline, scroll orizzontale. Come oggi, dopo il boot.

Durante 1–3 lo scroll orizzontale non parte: si resta fermi sull’hero.

## 7. Tempo

- Durata minima del rituale: circa **1,4 s**, anche se gli asset sono già in cache. Deve essere un gesto, non un flash.
- Il rituale non finisce prima che `window` sia `load` (come oggi, più il minimo).
- Se il load è lungo, i dischi restano in crescita/respiro finché non è pronto. Nessun timeout massimo: non si “sblocca” a metà con la pagina vuota.
- Stampa (`print`): niente rituale, home visibile.

## 8. Meno movimento

Se `prefers-reduced-motion: reduce`: niente crescita, niente scioglimento. Overlay carta che va via in una dissolvenza breve (~200 ms). Blob e palline restano spenti (come oggi). Testo della home visibile subito.

## 9. Relazione con ciò che c’è già

- I blob (`fx-canvas`, `fx-mid`) e le palline che cadono (`fx-balls`) restano il carattere della home **dopo** il passaggio.
- Il loader attuale (nero, label, barra, `%`) sulla home **scompare**.
- Il passaggio deve usare gli **stessi colori** delle palline/blob esistenti, non una palette nuova.
- Header e contenuto restano sotto, coperti, finché il passaggio non è fatto. Non si vede testo che “aspetta” sotto le palline.

## 10. Unità

| Unità | Fa | Non fa |
| --- | --- | --- |
| Rituale home | Nasce, cresce, decide quando è pronto (load + minimo), lancia il passaggio | Non disegna la fisica della home, non gira su Studio/casi |
| Home effects | Blob e palline che cadono, come oggi, **partono visibili** dal passaggio | Non mostrano nulla durante il vuoto iniziale |
| Reveal testo | Header/hero come oggi, dopo il passaggio | Non parte durante i dischi al centro |

Il rituale parla agli effects solo con un segnale: “passa”. Gli effects non conoscono barre o percentuali.

## 11. Verifica

- Aprire la home: niente barra/nome/%; solo dischi al centro su carta.
- Attendere: i dischi crescono; poi diventano blob/palline; compare il titolo.
- Refresh e ritorno dal logo: di nuovo il rituale.
- Aprire Studio o un caso: nessun rituale.
- `prefers-reduced-motion`: home senza cerimonia.
- Ctrl+rotella (zoom) resta del browser; dopo il boot lo scroll rotella è orizzontale come ora.
