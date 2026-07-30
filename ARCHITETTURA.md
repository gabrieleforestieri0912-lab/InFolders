# InFolders — Architettura e Funzionamento

## Panoramica

**InFolders** è un'estensione Chrome (Manifest V3) che permette di organizzare le chat dei bot AI (ChatGPT, Gemini, Claude, Perplexity) in cartelle annidate e bookmark. Inietta una sidebar tematica su ciascun sito supportato, con supporto per autenticazione Google, backup/ripristino dati e piano premium freemium.

---

## Struttura del progetto

```
infolders/
├── src/
│   ├── app/                          # Sito Next.js (landing + privacy)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── privacy/page.tsx
│   ├── extension/                    # Sorgente TypeScript dell'estensione
│   │   ├── background.ts             # Service worker (message broker, OAuth, cache)
│   │   ├── content-app.ts            # Sidebar iniettata, bookmark, UI principale
│   │   ├── popup-app.ts              # Popup estensione (auth, cartelle, backup)
│   │   ├── subscriptions-app.ts      # Pagina piani premium
│   │   ├── entries/                  # Entry point per esbuild
│   │   │   ├── content-entry.ts
│   │   │   ├── popup-entry.ts
│   │   │   └── subscriptions-entry.ts
│   │   └── lib/
│   │       ├── i18n.ts               # Sistema di internazionalizzazione (it/en)
│   │       ├── plans.ts              # Logica piani premium e limiti
│   │       └── platform-config.ts    # Configurazione tema per piattaforma
│   └── lib/                          # Libreria condivisa
│       ├── types.ts                  # Tutti i tipi TypeScript
│       ├── supabase.ts               # Client Supabase + helper auth
│       └── data-service.ts           # Operazioni CRUD su Supabase
├── manifest.json                     # Manifest V3 dell'estensione
├── build-extension.js                # Orchestratore build estensione
├── scripts/
│   ├── bundle-extension.js           # Bundler esbuild (4 entry point → IIFE)
│   ├── generate-icons.js             # Generatore icone
│   └── verify-extension.js           # Validazione sintassi JS bundle
├── dist/
│   ├── packed/                       # Cartella per "Carica estensione non pacchettizzata"
│   └── infolders-extension.zip       # Pacchetto per Chrome Web Store
└── types/                            # Dichiarazioni TypeScript globali
    ├── chrome.d.ts
    ├── css.d.ts
    └── lucide.d.ts
```

---

## Architettura

### Service Worker (`background.ts`)

Cache in memoria dei dati utente. Gestisce 7 azioni via `chrome.runtime.onMessage`:

| Azione | Descrizione |
|---|---|
| `addChat` | Aggiunge chat a una cartella (con limite free 50 chat) |
| `getFolders` | Restituisce cartelle + contatore per l'utente |
| `saveFolders` | Salva cartelle in cache e storage |
| `getBookmarks` | Legge bookmark dallo storage |
| `saveBookmarks` | Salva bookmark nello storage |
| `loginWithGoogle` | Flusso OAuth2 completo via `chrome.identity.launchWebAuthFlow` |
| `logout` | Pulisce token e dati utente |

### Content Script (`content-app.ts`)

Il cuore dell'estensione. A ogni caricamento pagina su un sito supportato:

1. **Rilevamento piattaforma** — `window.location.hostname` determina tema e posizione sidebar
2. **Iniezione pulsanti** — Due pulsanti flottanti (cartella + corona premium)
3. **Sidebar** — Pannello 352px con 4 tab: Account, Tools, Cartelle, Bookmark
4. **Bookmark** — `MutationObserver` inietta pulsanti bookmark nelle righe chat
5. **Premium popup** — Overlay con piani Free/Pro/Team e pagamento simulato

### Flusso dati

```
Service Worker (background.js)
    ↕ chrome.runtime.sendMessage
Content Script (content.js) ←→ chrome.storage.local ←→ Supabase (opzionale)
    ↕ DOM
Piattaforma (chatgpt.com, gemini.google.com, claude.ai, perplexity.ai)
```

I dati sono salvati localmente in `chrome.storage.local`. La sincronizzazione Supabase è opzionale e fallisce silenziosamente.

---

## Temi per piattaforma

La sidebar si adatta automaticamente al sito in uso con una palette viola unificata:

| Piattaforma | Tono viola | Posizione |
|---|---|---|
| **ChatGPT** | `#a855f7` (violet) | Destra |
| **Gemini** | `#7c3aed` (indigo) | Sinistra |
| **Claude** | `#d946ef` (fucsia) | Destra |
| **Perplexity** | `#6366f1` (indigo) | Sinistra |

Ogni tema include: gradienti di sfondo scuri, superficie semitrasparente, effetti glassmorphism, e glow viola.

---

## Sistema premium

- **Free**: 50 chat massime (conteggio ricorsivo su tutte le cartelle)
- **Pro**: 2.99€/mese (7 giorni di prova simulati)
- **Team**: 9.99€/mese

Il pagamento è simulato con un timeout di 2 secondi. I dati premium sono salvati in `chrome.storage.local` come `infolders_premium`.

---

## Build

```bash
npm run build          # Build sito Next.js
npm run build:extension  # Build completa estensione (icone → bundle → zip)
npm run verify         # Bundle + validazione sintassi
```

La build estensione (esbuild) produce 4 file JS in formato IIFE:
- `background.js` — Service worker
- `content.js` — Content script
- `popup.js` — Popup
- `subscriptions.js` — Pagina piani

---

## Dipendenze principali

- **Runtime**: Next.js 16, React 19, Supabase JS, Lucide icone
- **Build**: esbuild, adm-zip, sharp, Tailwind CSS v4
- **Estensione**: Chrome API (storage, identity, tabs, runtime)
