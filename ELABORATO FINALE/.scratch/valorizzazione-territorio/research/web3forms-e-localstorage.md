# Cosa possono fare Web3Forms e localStorage insieme

Data della ricerca: 10 settembre 2026.

Domanda: la destinazione chiede tre pezzi insieme — il Visitatore invia una Proposta con Web3Forms; il Creatore la revisiona; una volta accettata, la Proposta è salvata in localStorage e compare sulla mappa per gli altri Visitatori. Cosa dicono le fonti primarie su questo accoppiamento?

Esito in una riga: **la destinazione, così com’è, non è raggiungibile**. Web3Forms consegna la Proposta al Creatore (email, storico dashboard, eventualmente webhook verso un terzo). `localStorage` appartiene all’origine nel browser di chi lo scrive. Nessuna delle due fonti documenta un percorso in cui, restando solo dentro questi due strumenti, un Evento accettato compaia sulla mappa degli altri Visitatori.

---

## Fonti

Fonti primarie consultate (proprietario del claim tra parentesi):

- [Web3Forms homepage](https://web3forms.com) e [pricing](https://web3forms.com/pricing) (Web3Forms / Web3Creative)
- [Documentazione Web3Forms](https://docs.web3forms.com) e indice [llms.txt](https://docs.web3forms.com/llms.txt)
- Pagine docs: [Introduction](https://docs.web3forms.com), [Installation](https://docs.web3forms.com/getting-started/installation), [API Reference](https://docs.web3forms.com/getting-started/api-reference), [Ajax / JS submit](https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript), [FAQ](https://docs.web3forms.com/getting-started/faq), [Troubleshooting](https://docs.web3forms.com/getting-started/troubleshooting), [Pro Features](https://docs.web3forms.com/getting-started/pro-features), [File Attachments](https://docs.web3forms.com/getting-started/pro-features/file-attachments), [Advanced File Uploader](https://docs.web3forms.com/getting-started/pro-features/advanced-file-uploader), [Webhooks](https://docs.web3forms.com/getting-started/integrations/webhooks), [Submissions API](https://docs.web3forms.com/getting-started/submissions-api), [Google Sheets](https://docs.web3forms.com/getting-started/integrations/google-sheets), [Slack](https://docs.web3forms.com/getting-started/integrations/slack), [Advanced — All Options](https://docs.web3forms.com/getting-started/examples/advanced-all-options)
- [Privacy Policy Web3Forms](https://web3forms.com/privacy) (last updated 13 Jul 2026)
- [MDN: `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN: Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [HTML Living Standard, Web storage](https://html.spec.whatwg.org/multipage/webstorage.html) (WHATWG, last updated 8 September 2026)

Non usate come fonte di fatti: blog di terzi, Stack Overflow, riassunti non firmati dal proprietario dell’API o dello standard.

---

## 1. Cosa fa Web3Forms dopo il submit

### Ruolo del prodotto

Web3Forms si definisce uno strumento per form di contatto su siti statici: le submission arrivano nella casella email del titolare del form, senza codice server o backend applicativo sul sito. ([docs Introduction](https://docs.web3forms.com): “Receive form submissions directly in your email inbox without any server or back-end code”; [homepage](https://web3forms.com): “Receive your html contact form submissions directly in your email inbox using our contact form api service. No server or backend code needed.”)

Il flusso documentato sul sito marketing è: (1) verificare l’email e ottenere un access key; (2) creare il form che fa `POST` a `https://api.web3forms.com/submit`; (3) sostituire l’access key. ([homepage, “How it works”](https://web3forms.com); [Installation](https://docs.web3forms.com/getting-started/installation))

L’access key **non è un segreto**: è pubblico, usabile nel client, e funziona come alias verso l’indirizzo email del titolare. Chi lo ottiene può solo inviare email a quel titolare, non leggere le submission altrui. ([FAQ, Access Keys](https://docs.web3forms.com/getting-started/faq); [homepage FAQ](https://web3forms.com): “The Access Key is not a secret API Key. it can be Public”; [Installation](https://docs.web3forms.com/getting-started/installation): “Don't worry this can be public”.)

L’endpoint di submit è pensato per il **client**. L’uso server-side richiede piano a pagamento e whitelist dell’IP del server; in assenza si ottiene `403 This method is not allowed`. ([API Reference](https://docs.web3forms.com/getting-started/api-reference); [Troubleshooting, 403](https://docs.web3forms.com/getting-started/troubleshooting))

### Email

`POST https://api.web3forms.com/submit` con `access_key` obbligatorio “send[s] the form to your email address”. ([API Reference](https://docs.web3forms.com/getting-started/api-reference))

Risposta HTTP 200 documentata:

```json
{
  "success": true,
  "body": {
    "data": { "[USER SUBMITTED DATA]" },
    "message": "Email sent successfully!"
  }
}
```

([API Reference, Response Codes](https://docs.web3forms.com/getting-started/api-reference))

Le email di notifica “are sent instantly and will reach your inbox in seconds. In rare cases, it can take up to 1-2 minutes.” Mittente documentato: `notify+{hash}@web3forms.com` / `notify@web3forms.com`. ([Troubleshooting](https://docs.web3forms.com/getting-started/troubleshooting))

Il campo `email` del form, se presente, è usato come reply-to. `subject`, `from_name`, `replyto`, `redirect`, honeypot `botcheck` sono opzioni riservate. `ccemail` è Pro. ([API Reference](https://docs.web3forms.com/getting-started/api-reference); [Installation](https://docs.web3forms.com/getting-started/installation))

Senza JavaScript, un submit HTML può fare redirect (default `https://api.web3forms.com/submit/success`, o URL in `redirect`). Con fetch JS il docs vieta di usare `redirect` nel form e indica di reindirizzare nel callback. ([API Reference](https://docs.web3forms.com/getting-started/api-reference); [Troubleshooting, CORS](https://docs.web3forms.com/getting-started/troubleshooting))

### Dashboard / conservazione delle submission

Tre testi del proprietario non coincidono:

1. Homepage: “All emails are sent directly to your email address. Form submissions are securely stored for up to 3 years, with a retention period you control.” ([web3forms.com](https://web3forms.com))
2. Privacy Policy (13 Jul 2026): “Form submission data is retained for a maximum of three years from the date of submission, after which it is automatically deleted, unless a shorter period applies to your plan or you delete it earlier.” I dati sono “stored in a database hosted by AWS and its encrypted at rest.” ([Privacy Policy](https://web3forms.com/privacy))
3. FAQ docs (sezione GDPR): “We do not store any form submissions of our users. We process them and forward to your email or the endpoint you specified such as webhooks.” ([FAQ](https://docs.web3forms.com/getting-started/faq))

La Privacy Policy datata e la Submissions API (sotto) descrivono conservazione e lettura delle submission. La frase FAQ “we do not store” è in contraddizione con quelle pagine più specifiche; non è usata come fatto isolato.

Pricing elenca “Form Submission History” (quanto indietro la dashboard elenca le submission) e “Data Retention Policy” (quanto a lungo i dati restano prima della cancellazione; impostabile per form da 7 giorni a 3 anni; Pro/Agency possono tenere i dati indefinitamente). ([pricing](https://web3forms.com/pricing))

Il dashboard è il luogo in cui si abilitano integrazioni (tab Integrations sul form). ([Webhooks setup](https://docs.web3forms.com/getting-started/integrations/webhooks); [Google Sheets](https://docs.web3forms.com/getting-started/integrations/google-sheets); [Slack](https://docs.web3forms.com/getting-started/integrations/slack))

### Submissions API (sola lettura)

Esiste un REST API Pro, **read-only**, distinta dall’endpoint di submit: `https://api.web3forms.com/v1`. Autenticazione con Bearer `w3f_live_…`, chiave mostrata una sola volta, fino a 10 chiavi attive, scoped all’account. Operazioni documentate: listare i form, listare le submission, leggere una submission. Non è documentata alcuna operazione di scrittura, “accept”, o pubblicazione sul sito. ([Submissions API](https://docs.web3forms.com/getting-started/submissions-api))

### Webhook

I webhook sono una **feature Pro** (docs webhook: “You must have an active PRO plan”; Installation: “PRO & Starter Plan users only” per il campo hidden `webhook` — i due testi del proprietario non allineano Starter vs solo Pro; il confronto piani su pricing include la riga Webhooks). ([Webhooks](https://docs.web3forms.com/getting-started/integrations/webhooks); [Installation](https://docs.web3forms.com/getting-started/installation); [pricing](https://web3forms.com/pricing))

Comportamento documentato: dopo il submit, Web3Forms invia un HTTP POST JSON all’URL configurato, “immediately after form submission”, su HTTPS, con retry automatico. Il payload contiene i campi del form più metadati (`subject`, `from_name`, `submittedAt`). Sono esclusi `access_key`, `apikey`, `attachment`, `botcheck`, `recaptcha_response`. L’endpoint deve rispondere entro 30 secondi. L’URL deve essere `https://` e pubblicamente raggiungibile. ([Webhooks](https://docs.web3forms.com/getting-started/integrations/webhooks))

Destinazioni elencate dal docs: piattaforme di automazione (Zapier, Make, n8n, Pipedream), CRM, email marketing, project management, **database** (Airtable, MongoDB, PostgreSQL), chat, e **“Custom Applications: Your own backend services”**. ([Webhooks, “What are Webhooks?”](https://docs.web3forms.com/getting-started/integrations/webhooks))

Si può anche mettere un campo hidden `webhook` nel form. ([API Reference](https://docs.web3forms.com/getting-started/api-reference); [Installation](https://docs.web3forms.com/getting-started/installation))

Nessuna di queste destinazioni è il `localStorage` di un Visitatore, né un layer mappa nel browser.

### Altre integrazioni documentate

- **Google Sheets** (Pro, beta): ogni submit aggiunge una riga al foglio collegato (timestamp + campi). ([Google Sheets](https://docs.web3forms.com/getting-started/integrations/google-sheets))
- **Slack / Discord / Telegram**: notifiche al team, non uno store per il sito pubblico. ([Slack](https://docs.web3forms.com/getting-started/integrations/slack); indice [llms.txt](https://docs.web3forms.com/llms.txt))

L’indice docs elenca come “Coming Soon”: Zapier, Make, n8n, Notion, Airtable (guide dedicate); i webhook però già nominano quegli strumenti come endpoint HTTP. ([llms.txt](https://docs.web3forms.com/llms.txt); [Webhooks](https://docs.web3forms.com/getting-started/integrations/webhooks))

### Upload di file

Gli allegati sono **Pro**. Serve `enctype="multipart/form-data"` sull’uploader HTML5. Limite documentato dell’uploader di default: **un file, fino a 5 MB**. Per più file o allegati più grandi: Advanced File Uploader (sempre Pro). ([File Attachments](https://docs.web3forms.com/getting-started/pro-features/file-attachments); [Pro Features](https://docs.web3forms.com/getting-started/pro-features); [Advanced File Uploader](https://docs.web3forms.com/getting-started/pro-features/advanced-file-uploader); [React File Upload: “File Upload is only available for PRO users.”](https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/react-file-upload-form))

Pricing: file upload assente nel piano Free; storage file incluso sui piani a pagamento (es. 5 GB su un piano intermedio; add-on +10 GB). ([pricing](https://web3forms.com/pricing))

I webhook **non includono** gli attachment nel JSON. ([Webhooks, “What’s Excluded”](https://docs.web3forms.com/getting-started/integrations/webhooks))

### Limiti sui campi

L’API accetta campi con nomi arbitrari, inoltrati “as-is” all’email, salvo i nomi riservati (`access_key`, `email`, `subject`, `ccemail`, `replyto`, `redirect`, `botcheck`, `attachment`, `webhook`). Sulla variante POST `/submit/YOUR_FORM_ID`: “Any fields are accepted.” ([API Reference](https://docs.web3forms.com/getting-started/api-reference))

Ogni input deve avere `name`, altrimenti non entra nell’email. ([Troubleshooting, “Email received without any data”](https://docs.web3forms.com/getting-started/troubleshooting); [Installation](https://docs.web3forms.com/getting-started/installation))

Nella guida Framer, Web3Forms è descritto come form “unlimited fields and inputs without limitation” rispetto al form nativo Framer. ([Framer guide](https://docs.web3forms.com/how-to-guides/site-builders/framer))

**Nelle pagine ufficiali consultate non compare un tetto numerico documentato sul numero di campi** (nessun “max 20 fields” o simile). Restano i limiti di piano: 250 submission/mese sul Free, poi il servizio “stop[s] accepting new submissions until the next month”; rate limit per IP (`429`) se si invia troppo in fretta. ([pricing FAQ](https://web3forms.com/pricing); [Troubleshooting, 429](https://docs.web3forms.com/getting-started/troubleshooting); [homepage](https://web3forms.com): “250 submissions/month free”)

### Submit da JavaScript

Il docs mostra `fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: json })` e poi legge `json.message` nella pagina **che ha inviato il form**. ([Ajax Contact Form using Javascript](https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript))

Quella risposta JSON torna solo al client che ha fatto il POST. Non è documentato un canale da quella risposta verso gli altri browser.

### Web3Forms può scrivere da solo sulla mappa?

Nelle fonti primarie Web3Forms **non espone un’API mappa, un write su `localStorage` del visitatore, né un “publish to website”**. I destini dopo il submit sono: email; conservazione/lettura dashboard e Submissions API; redirect di ringraziamento; webhook HTTP verso un URL terzo; integrazioni Sheets/Slack/Discord/Telegram.

Un webhook può raggiungere “Your own backend services” o un database. ([Webhooks](https://docs.web3forms.com/getting-started/integrations/webhooks)) Quel passo è un **terzo sistema**, non Web3Forms e non `localStorage`.

---

## 2. localStorage: di chi è, quanto dura, chi lo vede

### Di chi è

`window.localStorage` restituisce l’oggetto `Storage` “associated with window's origin's local storage area.” ([HTML Standard, 12.2.3](https://html.spec.whatwg.org/multipage/webstorage.html); [MDN `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): “a `Storage` object for the `Document`'s origin”)

MDN: “`localStorage` is partitioned by origin only. All documents with the same origin have access to the same `localStorage` area”. Un’origine è schema + hostname + porta. `http://example.com` e `https://example.com` hanno storage diversi. ([MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API); [MDN `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage); [MDN Storage quotas: definizione di origin](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))

HTML: “This specification introduces two related mechanisms … for storing name-value pairs **on the client side**.” “Each site has its own separate storage area.” ([HTML Standard, 12.1](https://html.spec.whatwg.org/multipage/webstorage.html))

I dati stanno quindi nel **user agent** (browser + profilo) di chi visita quella origine, non su un server condiviso del sito e non “nel Territorio” come store pubblico.

Autori sullo stesso hostname condividono **un** local storage object; non c’è restrizione per pathname. ([HTML Standard, 12.4.2 Cross-directory attacks](https://html.spec.whatwg.org/multipage/webstorage.html))

### Quanto dura

MDN: `localStorage` “data has **no expiration time**”; `sessionStorage` si svuota a fine sessione di pagina. I dati “persist even when the browser is closed and reopened.” ([MDN `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage); [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API))

HTML: lo storage locale è pensato per durare “beyond the current session”; però “User agents may, possibly in a manner configured by the user, automatically delete stored data after a period of time.” ([HTML Standard, 12.1 e 12.3.1](https://html.spec.whatwg.org/multipage/webstorage.html))

Altri fatti MDN sulla cessazione:

- Navigazione privata: i dati in `localStorage` sono trattati come `sessionStorage` e cancellati alla chiusura dell’ultima tab privata. ([MDN `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage); [MDN Web Storage API, Private Browsing](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API))
- L’utente può cancellare i dati dalle impostazioni del browser. Lo storage di default è **best-effort**: persiste finché l’origine è sotto quota, c’è spazio disco, e l’utente non cancella. ([MDN Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))
- Safari, con prevenzione tracking: dati creati da script per origini senza interazione utente negli ultimi sette giorni di uso del browser possono essere cancellati. ([MDN Storage quotas, Proactive eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))
- Quota Web Storage: fino a 5 MiB di local storage e 5 MiB di session storage per origine; oltre, `QuotaExceededError`. ([MDN Storage quotas, Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria))

Quindi: **non c’è scadenza di API**, ma il browser o l’utente possono cancellare i dati; non è uno store duraturo condiviso tra dispositivi.

### Visibile agli altri Visitatori su altri dispositivi?

No, secondo il modello origin + client-side.

- Altra origine: niente accesso. ([MDN Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API): “Pages on other origins can't access the same storage objects.”)
- Stessa origine, **stesso** browser (altre tab): sì, stesso `localStorage`; l’evento `storage` avvisa gli altri documenti che condividono quello spazio, non la pagina che ha scritto. ([MDN Using the Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API); [HTML Standard, broadcast `Storage`](https://html.spec.whatwg.org/multipage/webstorage.html): i remote storage sono oggetti `Storage` **same origin** nello stesso user agent)
- Altro dispositivo, altro profilo browser, altro Visitatore: è un altro user agent, quindi un’altra copia dello storage di quell’origine. Lo standard e MDN descrivono storage sul client, non un sync tra dispositivi.

Non esiste nelle fonti MDN/HTML un’API `localStorage` che replichi i dati verso gli altri visitatori del sito.

---

## 3. Percorso documentato: Creatore legge la mail → Evento visibile a tutti, restando in Web3Forms + localStorage

Percorsi **documentati** dopo un submit:

| Destino | Cosa fa | Visibile a tutti i Visitatori del sito? |
| --- | --- | --- |
| Email al titolare del form | Notifica in inbox | No. È la casella del Creatore. ([API Reference](https://docs.web3forms.com/getting-started/api-reference); [Troubleshooting](https://docs.web3forms.com/getting-started/troubleshooting)) |
| Dashboard / Submissions API | Storico e GET read-only (API: Pro + chiave segreta) | No. Lettura da parte dell’account Web3Forms, non push sul sito pubblico. ([Submissions API](https://docs.web3forms.com/getting-started/submissions-api); [Privacy Policy](https://web3forms.com/privacy)) |
| JSON di risposta al `fetch` | Messaggio di successo al browser che ha inviato | Solo quel browser, in quella sessione di pagina, se lo script lo usa. ([Ajax JS example](https://docs.web3forms.com/getting-started/examples/ajax-contact-form-using-javascript)) |
| `localStorage.setItem` nel sito | Scrittura nell’origine di **quel** user agent | Solo tab/profilo/dispositivo di chi esegue lo script. ([MDN Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)) |
| Webhook / Sheets / Slack | POST verso un terzo | Solo se quel terzo è un backend o uno store condiviso — cioè **un altro strumento**. ([Webhooks](https://docs.web3forms.com/getting-started/integrations/webhooks); [Google Sheets](https://docs.web3forms.com/getting-started/integrations/google-sheets)) |

Non è documentata, in Web3Forms, un’azione di Revisione (“accept”) che pubblichi sul sito. Il prodotto inoltra e (secondo Privacy Policy / API) conserva; non modera né aggiorna una mappa.

Se il Creatore, dopo aver letto l’email, apre il sito e scrive l’Evento in `localStorage`, le fonti su Web Storage dicono che quella scrittura vive nell’origine **del suo** browser. Gli altri Visitatori non condividono quel `Storage`.

Se si usa un webhook verso “Your own backend” o un database, si esce dal vincolo “solo Web3Forms + localStorage”.

Combinando le due serie di fatti: **non c’è un percorso documentato** in cui, restando dentro Web3Forms + localStorage, il Creatore faccia comparire l’Evento per tutti i Visitatori.

---

## 4. Esito rispetto alla destinazione

La destinazione chiede che, dopo Revisione, la Proposta salvata in localStorage **compaia sulla mappa** (implicito: per chi visita il sito, non solo per il Creatore).

Fatti:

1. Web3Forms consegna la Proposta al Creatore (email; eventuale storico; eventuale POST a un URL terzo). Non scrive sulla mappa e non scrive nel `localStorage` degli altri Visitatori.
2. `localStorage` è storage client-side per origine, nel browser di chi lo imposta. Non è visibile su altri dispositivi né ad altri Visitatori.
3. Le fonti primarie non descrivono un ponte tra “Creatore ha letto la mail” e “tutti i Visitatori vedono l’Evento” che usi solo questi due strumenti.

Quindi: **la destinazione non è raggiungibile così com’è**. Il pezzo “compare sulla mappa per gli altri Visitatori” è **incompatibile** con l’accoppiamento Web3Forms + localStorage.

(Un backend o un altro store condiviso — es. webhook verso database, come Web3Forms stesso elenca — è fuori da questa coppia di strumenti. Questa nota non valuta quale terzo strumento scegliere.)
