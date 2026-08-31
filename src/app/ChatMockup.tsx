'use client';

import React from 'react';
import { PLATFORM_ICONS } from '@/app/PlatformIcons';

const ChatGPT_COLOR = '#a855f7';
const GEMINI_COLOR = '#60a5fa';
const CLAUDE_COLOR = '#fb923c';
const PERPLEXITY_COLOR = '#06b6d4';

type PlatformKey = 'ChatGPT' | 'Gemini' | 'Claude' | 'Perplexity';

const platforms: { name: PlatformKey; color: string; label: string }[] = [
  { name: 'ChatGPT', color: ChatGPT_COLOR, label: 'ChatGPT' },
  { name: 'Gemini', color: GEMINI_COLOR, label: 'Gemini' },
  { name: 'Claude', color: CLAUDE_COLOR, label: 'Claude' },
  { name: 'Perplexity', color: PERPLEXITY_COLOR, label: 'Perplexity' },
];

const mockMessages = [
  {
    role: 'user' as const,
    content: 'Qual è la differenza tra Next.js e React puro?',
  },
  {
    role: 'assistant' as const,
    content: 'React è una libreria per costruire interfacce utente, mentre Next.js è un framework completo che aggiunge routing, server-side rendering, API routes e ottimizzazioni al di sopra di React. Con Next.js ottieni out-of-the-box supporto per SEO, performance e deployment senza configurazioni aggiuntive.',
  },
  {
    role: 'user' as const,
    content: 'Perfetto, e per quanto riguarda l\'ottimizzazione delle immagini?',
  },
  {
    role: 'assistant' as const,
    content: 'Next.js fornisce il componente `next/image` che ottimizza automaticamente le immagini: riduzione del peso, formato WebP, lazy loading e dimensioni responsive. Basta importare l\'immagine e Next si occupa del resto, migliorando il punteggio Lighthouse e l\'esperienza utente.',
  },
];

function ChatWindow({ platform, color }: { platform: PlatformKey; color: string }) {
  const Icon = PLATFORM_ICONS[platform];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-center w-7 h-7 rounded-full" style={{ background: color + '22' }}>
          {Icon ? <Icon color={color} size={16} /> : null}
        </div>
        <span className="text-sm font-medium text-zinc-300">{platform}</span>
        <span className="text-xs text-zinc-600 ml-auto">Online</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {mockMessages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} color={color} />
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] focus-within:border-white/10">
          <textarea
            placeholder="Scrivi un messaggio..."
            className="flex-1 resize-none bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none min-h-[20px] max-h-32"
            rows={1}
          />
          <button
            className="rounded-full p-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ background: color }}
          >
            Invia
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, content, color }: { role: 'user' | 'assistant'; content: string; color: string }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-xl bg-white/5 px-4 py-2.5 text-sm text-zinc-300">
          <p>{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ background: color + '22' }}
      >
        <div className="h-4 w-4 rounded-full" style={{ background: color }} />
      </div>
      <div className="max-w-[80%] space-y-1.5">
        <div className="rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300">
          <p className="leading-relaxed">{content}</p>
        </div>
        <div className="flex items-center gap-3 pl-1">
          <button className="text-xs text-zinc-500 hover:text-zinc-400">Copia</button>
          <button className="text-xs text-zinc-500 hover:text-zinc-400">👍</button>
          <button className="text-xs text-zinc-500 hover:text-zinc-400">👎</button>
        </div>
      </div>
    </div>
  );
}

export default function ChatMockup() {
  const [activePlatform, setActivePlatform] = React.useState<PlatformKey>('ChatGPT');
  const activeColor = platforms.find((p) => p.name === activePlatform)!.color;

  return (
    <div className="mt-16 mx-auto max-w-4xl rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a0a2e] to-[#09000d] p-2 shadow-2xl">
      <div className="rounded-xl border border-white/5 bg-[#0d0015] p-4 sm:p-6">
        <div className="flex gap-3">
          {/* Platform switch tabs */}
          <div className="hidden w-64 shrink-0 flex-col gap-2 sm:flex">
            <div className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-600">
              Piattaforme
            </div>
            <div className="flex flex-col gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setActivePlatform(p.name)}
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-all ${
                    activePlatform === p.name
                      ? 'bg-white/10 font-medium'
                      : 'text-zinc-500 hover:text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-auto border-t border-white/5 pt-2">
              <div className="flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a3 3 0 106 0 3 3 0 01-6 0z" />
                  <path d="M19.4 4.5a5 5 0 010 6.9L12 18l-7.4-6.6A5 5 0 014.6 4.5a5 5 0 017.3 0L12 6l.1.1.1-.1a5 5 0 017.3 0z" />
                </svg>
                <span>Connesso</span>
              </div>
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1 overflow-hidden rounded-lg">
            <ChatWindow platform={activePlatform} color={activeColor} />
          </div>
        </div>
      </div>
    </div>
  );
}
