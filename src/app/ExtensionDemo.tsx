'use client';

import React from 'react';
import { Folder, Bookmark, Search, Cloud, ChevronRight, Plus, MessageSquare, LogOut, Settings, User } from 'lucide-react';

const FOLDERS = [
  {
    name: 'Sviluppo Web',
    color: '#a855f7',
    count: 12,
    expanded: true,
    children: [
      { name: 'Next.js', count: 5 },
      { name: 'React Tips', count: 4 },
      { name: 'TypeScript', count: 3 },
    ],
  },
  {
    name: 'Lavoro',
    color: '#60a5fa',
    count: 8,
    expanded: false,
    children: [],
  },
  {
    name: 'Ricerca AI',
    color: '#06b6d4',
    count: 15,
    expanded: false,
    children: [],
  },
  {
    name: 'Idee Personal',
    color: '#fb923c',
    count: 6,
    expanded: false,
    children: [],
  },
];

const RECENT_CHATS = [
  { title: 'Come ottimizzare le query SQL', folder: 'Sviluppo Web', time: '2 min fa' },
  { title: 'Architettura microservizi', folder: 'Lavoro', time: '15 min fa' },
  { title: 'Confronto LLM 2025', folder: 'Ricerca AI', time: '1 ora fa' },
];

function SidebarFolder({ folder, depth = 0 }: { folder: typeof FOLDERS[0]; depth?: number }) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-white/5 cursor-pointer"
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-zinc-600 transition-transform ${folder.expanded ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={folder.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span className="flex-1 text-zinc-300 truncate">{folder.name}</span>
        <span className="text-zinc-600 text-[10px]">{folder.count}</span>
      </div>
      {folder.expanded && folder.children.length > 0 && (
        <div>
          {folder.children.map((child) => (
            <div
              key={child.name}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-white/5 cursor-pointer"
              style={{ paddingLeft: `${8 + (depth + 1) * 12}px` }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-700"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="truncate">{child.name}</span>
              <span className="ml-auto text-[10px]">{child.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InFoldersSidebar() {
  return (
    <div className="flex flex-col h-full w-64 bg-[#0d0015] border-r border-white/5 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-300">InFolders</span>
        </div>
        <button className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-zinc-600">Cerca chat...</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-2">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#a855f7]/20 px-2 py-1.5 text-[#a855f7] transition-colors hover:bg-[#a855f7]/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuova cartella
        </button>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Cartelle
        </div>
        {FOLDERS.map((folder) => (
          <SidebarFolder key={folder.name} folder={folder} />
        ))}
      </div>

      {/* Recent Chats */}
      <div className="border-t border-white/5 px-2 py-2">
        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Chat recenti
        </div>
        {RECENT_CHATS.map((chat, i) => (
          <div
            key={i}
            className="flex flex-col gap-0.5 rounded-md px-2 py-1.5 hover:bg-white/5 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 shrink-0">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-zinc-400 truncate">{chat.title}</span>
            </div>
            <div className="flex items-center gap-1 pl-3.5">
              <span className="text-zinc-600 text-[10px]">{chat.folder}</span>
              <span className="text-zinc-700 text-[10px]">&middot;</span>
              <span className="text-zinc-600 text-[10px]">{chat.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="border-t border-white/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#a855f7] to-[#60a5fa] flex items-center justify-center text-[10px] font-bold text-white">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-zinc-300 font-medium truncate">Utente</div>
            <div className="text-zinc-600 text-[10px] truncate">Pro</div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ChatGPTInterface() {
  return (
    <div className="flex flex-col h-full bg-[#212121]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-white">ChatGPT</span>
        <span className="text-xs text-zinc-500 ml-auto">Plus</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[70%] rounded-2xl bg-[#2f2f2f] px-4 py-3 text-sm text-white">
            Come posso ottimizzare le performance di una pagina Next.js?
          </div>
        </div>

        {/* Assistant message */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z" />
            </svg>
          </div>
          <div className="max-w-[70%] space-y-2">
            <div className="rounded-2xl bg-[#2f2f2f] px-4 py-3 text-sm text-white leading-relaxed">
              <p className="mb-3">Ecco le principali strategie per ottimizzare le performance di una pagina Next.js:</p>
              <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                <li><strong className="text-white">Usa il Server Rendering</strong> per le pagine che necessitano di dati dinamici</li>
                <li><strong className="text-white">Implementa il caching</strong> con React.cache() e revalidate</li>
                <li><strong className="text-white">Ottimizza le immagini</strong> con il componente next/image</li>
                <li><strong className="text-white">Usa i Server Components</strong> per ridurre il bundle JavaScript</li>
              </ol>
            </div>
            <div className="flex items-center gap-3 pl-2">
              <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Copia</button>
              <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">👍</button>
              <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">👎</button>
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[#424242] bg-[#2f2f2f] px-4 py-3 focus-within:border-zinc-500 transition-colors">
          <textarea
            placeholder="Message ChatGPT..."
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-500 outline-none min-h-[20px] max-h-32"
            rows={1}
          />
          <button className="rounded-full p-1.5 bg-white text-black opacity-50 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExtensionDemo() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            La tua sidebar intelligente
          </h2>
          <p className="mt-4 text-zinc-400">
            InFolders si integra direttamente nell&apos;interfaccia di ChatGPT, Gemini, Claude e Perplexity.
            Organizza le chat con cartelle, bookmark e ricerche istantanee.
          </p>
        </div>

        {/* Browser mockup */}
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-[#0d0015] shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1a0a2e] border-b border-white/5">
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              {/* URL bar */}
              <div className="flex-1 flex items-center gap-2 rounded-lg bg-[#0d0015] border border-white/5 px-3 py-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-xs text-zinc-500">chatgpt.com</span>
              </div>
              {/* Extension icon */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center" title="InFolders attivo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content: Sidebar + Chat */}
            <div className="flex h-[500px]">
              {/* InFolders Sidebar */}
              <InFoldersSidebar />

              {/* ChatGPT Interface */}
              <div className="flex-1">
                <ChatGPTInterface />
              </div>
            </div>
          </div>

          {/* Features callout */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Folder, label: 'Cartelle', desc: 'Organizza per tema', color: '#a855f7' },
              { icon: Bookmark, label: 'Bookmark', desc: 'Salva chat importanti', color: '#60a5fa' },
              { icon: Search, label: 'Ricerca', desc: 'Trova tutto subito', color: '#06b6d4' },
              { icon: Cloud, label: 'Cloud sync', desc: 'Pro e Premium', color: '#fb923c' },
            ].map((feat) => (
              <div
                key={feat.label}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: feat.color + '15' }}>
                  <feat.icon size={20} style={{ color: feat.color }} />
                </div>
                <div className="text-xs font-medium text-zinc-300">{feat.label}</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
