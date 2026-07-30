# Chrome Web Store — testi per la pubblicazione (InFolders)

Sostituisci segnaposto (URL privacy, email, screenshot) prima dell’invio.

## Scopo singolo (single purpose)

InFolders aggiunge un’interfaccia laterale e strumenti di organizzazione (cartelle annidate, bookmark, backup locale JSON) sulle pagine dei principali servizi di chat AI supportati, per aiutare l’utente a catalogare i collegamenti alle conversazioni. Non altera il funzionamento dei siti oltre a questa integrazione.

## Giustificazione permessi (inglese, per il form store)

- **storage**: Save the user’s folder tree, bookmarks, and optional Google profile id/email locally with `chrome.storage.local`. No remote sync unless explicitly added in a future version.
- **identity**: Sign in with Google using `chrome.identity.launchWebAuthFlow` to read basic profile fields (email, name). Access tokens are not persisted.
- **tabs**: Open a saved chat URL in a new tab when the user clicks a bookmark or folder entry.
- **activeTab**: Interact with the current tab only in the context of the user invoking the extension UI on supported chat sites.
- **host_permissions (https://www.googleapis.com/\*)**: Call Google’s OAuth2 userinfo endpoint once after login to associate local data with the signed-in account.

## Giustificazione permessi (italiano, bozza)

- **storage**: memorizza in locale cartelle, bookmark e dati account (id/email) con `chrome.storage.local`.
- **identity**: accesso Google per associare i dati al profilo; il token OAuth non viene salvato.
- **tabs**: apre in una nuova scheda l’URL di una chat salvata.
- **activeTab**: uso della scheda attiva solo quando l’utente usa l’interfaccia InFolders sui siti supportati.
- **host_permissions Google**: chiamata a `userinfo` dopo il login.

## URL privacy policy

Imposta nel Developer Dashboard l’URL HTTPS della policy (es. sito Next deployato su `/privacy` oppure pagina GitHub Pages). Il pacchetto estensione include `privacy.html` consultabile anche come `chrome-extension://<id>/privacy.html` ma lo store richiede in genere un URL **https pubblico**.

## Screenshot (checklist)

- 1280×800 (o dimensioni richieste dalla console): sidebar aperta su ChatGPT con cartelle.
- Popup / pagina piani con piani Free e Pro.
- Flusso bookmark su una conversazione.

## Note revisione

- Piano Free: massimo 50 chat totali nelle cartelle (contate ricorsivamente); Pro simulato in sviluppo per prove.
- Funzioni indicate come “in sviluppo” (backup cloud, multi-dispositivo) non sono ancora implementate: aggiorna il listing se le abiliti.
