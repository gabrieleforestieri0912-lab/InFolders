# Changelog

## 1.1.0 — 2026-05-04

- Estensione: sorgenti modulari in `src/extension/` con bundle esbuild verso `content.js`, `popup.js`, `subscriptions.js`.
- Piano Free: limite di 50 chat totali nelle cartelle (popup e messaggio `addChat` nel service worker).
- Piano Pro: ricerca cartelle/chat nella sidebar; testi piani allineati a funzioni reali (backup cloud / multi-dispositivo indicati come in sviluppo).
- Sicurezza: profilo Google salvato senza `accessToken`; OAuth `client_id` anche in `manifest.json` (`oauth2`).
- Build: `npm run build:extension` genera icone in `icons/`, bundle JS, zip e `dist/packed`.
- Qualità: `try/catch` su init e injection bookmark; `node --check` in `npm run verify`.
- Documentazione: `privacy.html`, `store/SUBMISSION.md` per lo store, pagina Next `/privacy`.

## 1.0.0 — precedente

- Prima versione funzionale con sidebar, cartelle, bookmark, login Google e pagina abbonamenti simulata.
