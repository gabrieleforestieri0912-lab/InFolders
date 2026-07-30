import Image from 'next/image';
import Link from 'next/link';
import { PLATFORM_ICONS } from './PlatformIcons';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09000d]">
      {/* Platform color strip */}
      <div className="flex h-0.5 w-full">
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #a855f7, #60a5fa)' }} />
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #60a5fa, #fb923c)' }} />
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #fb923c, #06b6d4)' }} />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8">
        {/* Top grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <Image src="/icon-48.png" alt="InFolders" width={32} height={32} className="rounded-xl" />
              <span className="text-base font-bold tracking-tight">InFolders</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-500">
              Organizza le conversazioni AI in cartelle, bookmark e profili istruzioni. Un&apos;unica sidebar per ChatGPT, Gemini, Claude e Perplexity.
            </p>
            {/* Platform icons */}
            <div className="mt-5 flex items-center gap-2">
              {[
                { color: '#a855f7', name: 'ChatGPT' },
                { color: '#60a5fa', name: 'Gemini' },
                { color: '#fb923c', name: 'Claude' },
                { color: '#06b6d4', name: 'Perplexity' },
              ].map((p) => {
                const Icon = PLATFORM_ICONS[p.name];
                return Icon ? <Icon key={p.name} color={p.color} /> : null;
              })}
              <span className="ml-1 text-xs text-zinc-600">4 piattaforme</span>
            </div>
          </div>

          {/* Prodotto */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Prodotto</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/#features" className="transition-colors hover:text-white">Funzionalità</Link></li>
              <li><Link href="/#pricing" className="transition-colors hover:text-white">Prezzi</Link></li>
              <li><Link href="/#how-it-works" className="transition-colors hover:text-white">Come funziona</Link></li>
              <li>
                <a
                  href="https://chromewebstore.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  Installa su Chrome
                </a>
              </li>
            </ul>
          </div>

          {/* Risorse */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Risorse</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/guide" className="transition-colors hover:text-white">Guida all&apos;estensione</Link></li>
              <li><Link href="/#faq" className="transition-colors hover:text-white">FAQ</Link></li>
              <li>
                <a href="mailto:support@infolders.app" className="transition-colors hover:text-white">
                  Contatta il supporto
                </a>
              </li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">Legale</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-white">Termini di servizio</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} InFolders. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}
