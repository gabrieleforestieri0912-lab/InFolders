# InFolders

Estensione Chrome (Manifest V3) che organizza le chat dei bot AI (ChatGPT, Gemini, Claude, Perplexity) in cartelle annidate, bookmark, libreria prompt e profili di istruzioni. Include un sito Next.js (landing, privacy, piani premium).

## Struttura

```
extension/    Estensione Chrome pronta da caricare (manifest, icone, asset statici)
  static/       Bundle JS, HTML e CSS (background, content, popup, subscriptions)
  icons/        Icone PNG (16, 48, 128)
src/          Sorgenti TypeScript del sito Next.js
  app/          Pagine e API routes
  lib/          Libreria condivisa (piani, email)
types/        Dichiarazioni TypeScript globali
store/        Note per la pubblicazione sullo store
```

## Script

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il sito Next.js in sviluppo |
| `npm run build` | Build del sito Next.js |
| `npm run lint` | ESLint |
| `npm run typecheck` | Controllo dei tipi TypeScript |

## Caricare l'estensione in Chrome

In `chrome://extensions` abilita "Modalità sviluppatore" e scegli **Carica estensione non pacchettizzata** puntando alla cartella `extension/`.

## Sincronizzazione cloud (multi-dispositivo)

Per i piani Pro/Team l'estensione sincronizza cartelle e bookmark su Supabase con un **merge bidirezionale**: al login, al ripristino della sessione, al ritorno sulla scheda e dopo ogni modifica i dati locali vengono confrontati con quelli nel cloud e uniti con risoluzione dei conflitti basata sulla modifica più recente (timestamp per singolo item, unione delle chat per URL, tombstone per le eliminazioni).

**Migration richiesta una tantum su Supabase** (SQL Editor o `psql`):

```sql
ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS tombstones jsonb NOT NULL DEFAULT '[]'::jsonb;
```

Il merge è coperto da test unitari (`npm test`), che estraggono il blocco puro da `extension/static/content.js`.

## URL del sito (checkout e contatti)

Di default l'estensione contatta il sito di produzione (`https://infolders.app`) per il checkout Stripe e il modulo di contatto Team. Per puntare a un server locale durante lo sviluppo, imposta l'override in `chrome.storage.local` (es. dalla console del popup):

```js
chrome.storage.local.set({ infolders_site_url: "http://localhost:3000" });
```
