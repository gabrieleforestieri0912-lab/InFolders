import Image from 'next/image';
import Link from 'next/link';
import { PLANS, PLATFORM_COLORS } from '@/lib/plans-config';
import FeatureCards from './FeatureCards';
import FaqAccordion from './FaqAccordion';
import Footer from './Footer';
import Header from './Header';
import ChatMockup from './ChatMockup';
import ExtensionDemo from './ExtensionDemo';
import { PLATFORM_ICONS } from './PlatformIcons';




const CheckIcon = ({ color = '#22c55e' }: { color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const platforms = Object.entries(PLATFORM_COLORS).map(([name, { color }]) => ({ name, color }));

const howItWorksSteps = [
  {
    step: '01',
    color: '#a855f7',
    title: "Installa l'estensione",
    desc: "Aggiungi InFolders a Chrome con un clic. L'estensione si integra automaticamente con ChatGPT, Gemini, Claude e Perplexity.",
  },
  {
    step: '02',
    color: '#60a5fa',
    title: 'Organizza le conversazioni',
    desc: "Usa la sidebar per creare cartelle, spostare chat con drag & drop, aggiungere bookmark e salvare i tuoi prompt preferiti.",
  },
  {
    step: '03',
    color: '#06b6d4',
    title: 'Accedi da ovunque',
    desc: 'Con il piano Pro, sincronizza tutto sul cloud e ritrova le tue conversazioni organizzate su qualsiasi dispositivo.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">

      <Header />


      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16 text-center sm:pt-14 sm:pb-20">

        {/* Multi-color pill badge */}
        <div
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(96,165,250,0.08), rgba(251,146,60,0.08), rgba(34,197,94,0.08))',
            border: '1px solid rgba(168,85,247,0.3)',
            color: '#c4b5fd',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          Estensione per ChatGPT, Gemini, Claude & Perplexity
        </div>

        {/* Logo with multi-color conic glow */}
        <div className="mx-auto mb-8 flex justify-center">
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[40px] opacity-40 blur-2xl"
              style={{ background: 'conic-gradient(from 0deg, #a855f7, #60a5fa, #fb923c, #06b6d4, #a855f7)' }}
            />
            <Image src="/icon-128.png" alt="InFolders" width={96} height={96} className="relative rounded-3xl shadow-2xl" />
          </div>
        </div>

        {/* H1 with 4-platform color gradient */}
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Organizza le tue{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(90deg, #a855f7 0%, #60a5fa 40%, #fb923c 70%, #06b6d4 100%)' }}
          >
            conversazioni AI
          </span>
          <br />
          come non hai mai fatto
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          InFolders aggiunge una sidebar intelligente ai tuoi strumenti AI preferiti.
          Cartelle, bookmark, prompt e profili istruzioni — tutto a portata di clic.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-8 py-3.5 text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] sm:w-auto"
          >
            {/* FontAwesome fa-chrome white */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="white" aria-hidden="true">
              <path d="M0 256C0 209.4 12.47 165.6 34.27 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222 512 256C512 397.4 397.4 512 256 512C242.3 512 228.8 511.1 215.6 509.2L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.19 98.47C103 38.53 178.2 0 256 0C350.8 0 433.5 51.26 477.8 128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z" />
            </svg>
            Aggiungi a Chrome
          </a>
          <a
            href="#pricing"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 sm:w-auto"
          >
            Vedi i prezzi
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 13l5 5 5-5" /><path d="M7 6l5 5 5-5" /></svg>
          </a>
        </div>

        <ChatMockup />
      </section>

      <ExtensionDemo />

      {/* Platforms */}
      <section className="border-y border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
            Supportato su
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {platforms.map((p) => {
              const Icon = PLATFORM_ICONS[p.name];
              return (
                <div key={p.name} className="flex items-center gap-2.5 text-sm font-semibold text-zinc-300">
                  {Icon ? <Icon color={p.color} /> : (
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: p.color }} />
                  )}
                  {p.name}
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-xs text-zinc-600">
            I colori della sidebar si adattano automaticamente — viola per ChatGPT, blu per Gemini, arancione per Claude, ciano per Perplexity.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tutto ciò che ti serve</h2>
            <p className="mt-4 text-zinc-400">
              InFolders trasforma il modo in cui gestisci le tue conversazioni AI. Ogni funzionalità
              è pensata per farti risparmiare tempo.
            </p>
          </div>
          <FeatureCards />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Come funziona</h2>
            <p className="mt-4 text-zinc-400">
              Installa, connetti, organizza. Tre passaggi per portare ordine nelle tue conversazioni AI.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {howItWorksSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center"
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}cc, ${item.color}88)`,
                    boxShadow: `0 4px 20px ${item.color}33`,
                  }}
                >
                  {item.step}
                </div>
                <h3 className="mb-3 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform color showcase */}
      <section className="border-t border-white/5 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ogni piattaforma, il suo stile</h2>
            <p className="mt-4 text-zinc-400">
              La sidebar di InFolders cambia colore in base alla piattaforma che stai usando.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'ChatGPT', color: '#a855f7', desc: 'Viola — organizza le tue chat GPT con stile' },
              { name: 'Google Gemini', color: '#60a5fa', desc: 'Blu — gestisci le conversazioni Gemini' },
              { name: 'Claude', color: '#fb923c', desc: 'Arancione — tieni traccia delle chat Claude' },
              { name: 'Perplexity', color: '#06b6d4', desc: 'Ciano — organizza le ricerche AI' },
            ].map((p) => {
              const Icon = PLATFORM_ICONS[p.name];
              return (
                <div
                  key={p.name}
                  className="rounded-xl border p-6"
                  style={{
                    borderColor: `${p.color}33`,
                    background: `linear-gradient(135deg, ${p.color}0A 0%, transparent 100%)`,
                  }}
                >
                  <div className="mb-4" style={{ color: p.color }}>
                    {Icon ? <Icon color={p.color} size={36} /> : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-bold" style={{ color: p.color }}>{p.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-[28px] opacity-50 blur-xl"
                style={{ background: 'conic-gradient(from 0deg, #a855f7, #60a5fa, #fb923c, #06b6d4, #a855f7)' }}
              />
              <Image src="/icon-128.png" alt="InFolders" width={64} height={64} className="relative rounded-2xl shadow-xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pronto a mettere ordine?</h2>
          <p className="mt-4 text-zinc-400">
            Installa InFolders e trasforma il modo in cui gestisci le tue conversazioni AI.
          </p>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-10 py-4 text-sm font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
              <path d="M0 256C0 209.4 12.47 165.6 34.27 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222 512 256C512 397.4 397.4 512 256 512C242.3 512 228.8 511.1 215.6 509.2L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.19 98.47C103 38.53 178.2 0 256 0C350.8 0 433.5 51.26 477.8 128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z"/>
            </svg>
            Aggiungi a Chrome
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Scegli il tuo piano</h2>
            <p className="mt-4 text-zinc-400">
              Inizia gratis, passa al Pro quando sei pronto. Abbonamento mensile, disdici quando vuoi.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all ${plan.highlighted
                  ? 'border-[#a855f7]/40 bg-gradient-to-b from-[#a855f7]/10 to-[#a855f7]/[0.03] shadow-[0_0_60px_rgba(168,85,247,0.12)]'
                  : 'border-white/5 bg-white/[0.02]'
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-4 py-1 text-xs font-bold tracking-wide">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{plan.tagline}</p>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                    <span className="mb-1 text-sm text-zinc-500">/{plan.priceNote}</span>
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat.label} className="flex items-start gap-2.5 text-sm">
                      {feat.included
                        ? <CheckIcon color={plan.highlighted ? '#a855f7' : '#22c55e'} />
                        : <XIcon />
                      }
                      <span className={feat.included ? 'text-zinc-300' : 'text-zinc-600 line-through'}>
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.ctaHref}
                  target={plan.ctaHref.startsWith('http') ? '_blank' : undefined}
                  rel={plan.ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${plan.highlighted
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                >
                  {plan.ctaLabel}
                </a>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-zinc-600">
            Pro e Team si acquistano dall&apos;estensione: installala, accedi con Google e scegli il piano dalla sidebar. Pagamento sicuro tramite Stripe.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Domande frequenti</h2>
            <p className="mt-4 text-zinc-400">Tutto quello che vuoi sapere su InFolders.</p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <Footer />
    </div>
  );
}
