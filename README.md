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
