# Chrome Web Store — testi per la pubblicazione (InFolders)

Sostituisci segnaposto (URL privacy, email, screenshot) prima dell'invio.

## Scopo singolo (single purpose)

InFolders aggiunge un'interfaccia laterale e strumenti di organizzazione (cartelle annidate, bookmark, libreria prompt, profili istruzioni) sulle pagine dei principali servizi di chat AI supportati, per aiutare l'utente a catalogare i collegamenti alle conversazioni. Non altera il funzionamento dei siti oltre a questa integrazione e non legge il contenuto delle conversazioni.

## Giustificazione permessi (inglese, per il form store)

- **storage**: Save the user's folder tree, bookmarks, plan status, Google profile fields and the auth session locally with `chrome.storage.local`; prompts and profiles in the site's `localStorage`. Cloud sync to Supabase happens only for users on a paid plan (Pro/Team) after explicit login.
- **identity**: Sign in with Google using `chrome.identity.launchWebAuthFlow` with `response_type=id_token` to read basic profile fields (email, name). The Google ID token is not persisted; the session created with the sync service is stored locally and removed on logout.
- **tabs**: Open a saved chat URL in a new tab when the user clicks a bookmark or folder entry.
- **activeTab**: Interact with the current tab only in the context of the user invoking the extension UI on supported chat sites.
- **host_permissions (chat sites)**: Inject the InFolders sidebar and bookmark buttons on ChatGPT, Gemini, Claude and Perplexity (`*://chatgpt.com/*`, `*://gemini.google.com/*`, `*://claude.ai/*`, `*://perplexity.ai/*`, with `www.` variants).
- **host_permissions (https://*.supabase.co/*)**: Cloud sync (folders, bookmarks, plan status) for users on a paid plan.
- **host_permissions (https://www.googleapis.com/*)**: Reserved for Google account verification; the current login decodes the ID token locally and does not call the userinfo endpoint.

## Giustificazione permessi (italiano, bozza)

- **storage**: memorizza in locale cartelle, bookmark, profilo Google, stato del piano e sessione con `chrome.storage.local`; prompt e profili in `localStorage`. La sincronizzazione cloud avviene solo per gli utenti con piano a pagamento.
- **identity**: accesso Google per associare i dati al profilo; l'ID token non viene salvato, la sessione del servizio di sync viene rimossa al logout.
- **tabs**: apre in una nuova scheda l'URL di una chat salvata.
- **activeTab**: uso della scheda attiva solo quando l'utente usa l'interfaccia InFolders sui siti supportati.
- **host_permissions siti chat**: iniezione della sidebar e dei pulsanti bookmark su ChatGPT, Gemini, Claude e Perplexity.
- **host_permissions Supabase**: sincronizzazione cloud per gli utenti Pro/Team.
- **host_permissions Google APIs**: riservata alla verifica dell'account Google (il login attuale decodifica l'ID token localmente).

## URL privacy policy

Imposta nel Developer Dashboard l'URL HTTPS della policy (es. sito Next deployato su `/privacy` oppure pagina GitHub Pages). Il pacchetto estensione include `privacy.html` consultabile anche come `chrome-extension://<id>/privacy.html` ma lo store richiede in genere un URL **https pubblico**. Entrambe le versioni descrivono il comportamento reale (sessioni, sync cloud per piani a pagamento, pagamenti Stripe).

## Screenshot (checklist)

- 1280×800 (o dimensioni richieste dalla console): sidebar aperta su ChatGPT con cartelle.
- Popup / pagina piani con piani Free, Pro e Team.
- Flusso bookmark su una conversazione.

## Note revisione

- Piano Free: massimo 50 chat totali nelle cartelle (contate ricorsivamente).
- Piani Pro (€9,99/mese) e Team (€29,99/mese): abbonamenti mensili reali tramite Stripe, attivati via webhook.
- Sincronizzazione cloud bidirezionale per i piani a pagamento: al login e a ogni modifica i dati vengono confrontati con il cloud e uniti con risoluzione dei conflitti per timestamp; le eliminazioni si propagano tra dispositivi tramite marcatori temporanei.
- La creazione di prompt e profili istruzioni è riservata ai piani a pagamento (Pro/Team); i dati salvati restano sul dispositivo. L'iniezione automatica delle istruzioni dei profili nelle impostazioni di ChatGPT è in sviluppo.
