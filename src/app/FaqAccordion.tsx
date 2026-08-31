'use client';

import { useState } from 'react';

const faqs = [
  {
    q: "Cos'è InFolders?",
    a: "InFolders è un'estensione browser che aggiunge una sidebar intelligente a ChatGPT, Gemini, Claude e Perplexity. Ti permette di organizzare le conversazioni in cartelle, salvare bookmark, gestire prompt e creare profili di istruzioni personalizzati.",
  },
  {
    q: 'Come installo InFolders?',
    a: 'InFolders è disponibile sul Chrome Web Store. Basta cliccare su "Aggiungi a Chrome" e l\'estensione sarà attiva in pochi secondi su tutti i tuoi strumenti AI preferiti.',
  },
  {
    q: 'InFolders è gratuito?',
    a: 'InFolders offre un piano Free con 50 chat nelle cartelle, bookmark illimitati e tutte le funzionalità base. Il piano Pro (€9,99/mese) sblocca chat illimitate, sincronizzazione cloud, libreria prompt e profili istruzioni. Il piano Team (€29,99/mese) include tutte le funzionalità Pro più strumenti di condivisione per il team.',
  },
  {
    q: 'Quali piattaforme AI supporta?',
    a: 'InFolders funziona con ChatGPT, Google Gemini, Claude (Anthropic) e Perplexity. Ogni piattaforma ha i propri colori personalizzati nella sidebar.',
  },
  {
    q: 'I miei dati sono al sicuro?',
    a: 'Assolutamente. Cartelle e bookmark restano sul tuo dispositivo tramite le API di storage del browser. La sincronizzazione su cloud (riservata al piano Pro) usa Supabase con connessione HTTPS e autenticazione Google OAuth 2.0; i prompt e i profili restano sempre sul dispositivo.',
  },
  {
    q: 'Il piano Pro è un abbonamento mensile?',
    a: 'Sì. Il piano Pro costa €9,99 al mese tramite Stripe e puoi disdire quando vuoi. Il piano Team costa €29,99 al mese.',
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl border transition-colors duration-200"
            style={{
              borderColor: isOpen ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)',
              background: isOpen ? 'rgba(168,85,247,0.03)' : 'rgba(255,255,255,0.01)',
            }}
          >
            {/* Trigger */}
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left text-sm font-medium transition-colors duration-150"
              style={{ color: isOpen ? '#c4b5fd' : '#e4e4e7' }}
              aria-expanded={isOpen}
            >
              <span>{faq.q}</span>

              {/* Chevron — rotates 180° when open */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Animated body — grid trick: 0fr → 1fr */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-white/5 px-6 py-5 text-sm leading-relaxed text-zinc-400">
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
