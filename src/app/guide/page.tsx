import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../Footer';
import Header from '../Header';



export const metadata: Metadata = {
  title: 'Guida — InFolders',
  description: 'Guida completa all\'estensione InFolders: come installare, creare cartelle, usare bookmark, ricerca globale, libreria prompt e profili istruzioni su ChatGPT, Gemini, Claude e Perplexity.',
};

/* ─── Tipi ─────────────────────────────────────────────── */
interface Step {
  n: number;
  title: string;
  desc: string;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  subtitle: string;
  steps: Step[];
  tip?: string;
}

/* ─── Icone ─────────────────────────────────────────────── */
const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const BookmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const PromptIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
  </svg>
);
const InstallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ─── Contenuto sezioni ─────────────────────────────────── */
const sections: Section[] = [
  {
    id: 'install',
    icon: <InstallIcon />,
    color: '#a855f7',
    title: 'Installazione',
    subtitle: 'Aggiungi InFolders a Chrome in 3 passaggi',
    steps: [
      { n: 1, title: 'Apri il Chrome Web Store', desc: 'Vai su chromewebstore.google.com e cerca "InFolders" oppure clicca il link diretto dalla homepage.' },
      { n: 2, title: 'Clicca "Aggiungi a Chrome"', desc: 'Conferma i permessi richiesti (lettura della pagina corrente) e attendi l\'installazione automatica.' },
      { n: 3, title: 'Apri un chatbot supportato', desc: 'Naviga su ChatGPT, Gemini, Claude o Perplexity. Sul lato della pagina compariranno i pulsanti fluttuanti di InFolders: clicca quello della sidebar per aprirla.' },
    ],
    tip: 'Non vedi i pulsanti fluttuanti? Ricarica la pagina con F5. L\'icona InFolders nella barra delle estensioni apre il popup dei piani Premium.',
  },
  {
    id: 'folders',
    icon: <FolderIcon />,
    color: '#60a5fa',
    title: 'Cartelle',
    subtitle: 'Organizza le conversazioni con cartelle e sottocartelle',
    steps: [
      { n: 1, title: 'Crea una nuova cartella', desc: 'Clicca il pulsante "+ Nuova cartella" in cima alla sidebar. Dai un nome alla cartella e conferma.' },
      { n: 2, title: 'Aggiungi una chat', desc: 'Clicca il pulsante cartella (📁) accanto a qualsiasi conversazione nella lista chat. Scegli la cartella di destinazione dal menu.' },
      { n: 3, title: 'Riordina con Drag & Drop', desc: 'Trascina le conversazioni tra le cartelle tenendo premuto il mouse. Puoi riordinare anche le cartelle stesse.' },
      { n: 4, title: 'Rinomina o elimina', desc: 'Fai clic destro su una cartella (o clicca i tre puntini ⋯) per rinominarla, cambiarle colore o eliminarla.' },
    ],
    tip: 'Con il piano Free puoi avere fino a 50 chat nelle cartelle. Con il piano Pro le cartelle sono illimitate.',
  },
  {
    id: 'bookmarks',
    icon: <BookmarkIcon />,
    color: '#fb923c',
    title: 'Bookmark',
    subtitle: 'Salva le conversazioni più importanti con un clic',
    steps: [
      { n: 1, title: 'Aggiungi un bookmark', desc: 'Clicca l\'icona segnalibro (🔖) accanto a qualsiasi chat nella sidebar. La conversazione viene salvata nella sezione Bookmark.' },
      { n: 2, title: 'Accedi ai bookmark', desc: 'Clicca la scheda "Bookmark" in cima alla sidebar per visualizzare tutte le chat salvate, ordinate per data.' },
      { n: 3, title: 'Rimuovi un bookmark', desc: 'Clicca di nuovo l\'icona segnalibro sulla stessa chat per rimuoverla dai preferiti.' },
    ],
    tip: 'I bookmark sono illimitati su tutti i piani, compreso quello Free.',
  },
  {
    id: 'search',
    icon: <SearchIcon />,
    color: '#06b6d4',
    title: 'Ricerca Globale',
    subtitle: 'Trova qualsiasi chat in tutti i tuoi folder istantaneamente',
    steps: [
      { n: 1, title: 'Apri la ricerca', desc: 'Clicca l\'icona di ricerca 🔍 in cima alla sidebar e digita il termine da trovare.' },
      { n: 2, title: 'Digita il termine', desc: 'La ricerca filtra in tempo reale tutte le conversazioni (nelle cartelle, nei bookmark e nell\'elenco generale) per titolo.' },
      { n: 3, title: 'Apri il risultato', desc: 'Clicca il risultato desiderato per aprire direttamente quella conversazione nel chatbot.' },
    ],
    tip: 'La ricerca funziona anche mentre sei in un\'altra piattaforma — filtra solo le chat della piattaforma attiva.',
  },
  {
    id: 'prompts',
    icon: <PromptIcon />,
    color: '#a855f7',
    title: 'Libreria Prompt',
    subtitle: 'Salva e riutilizza i tuoi prompt preferiti (Piano Pro)',
    steps: [
      { n: 1, title: 'Apri la libreria', desc: 'Clicca la scheda "Prompt" nella sidebar. Vedrai i tuoi prompt salvati (se presenti).' },
      { n: 2, title: 'Crea un nuovo prompt', desc: 'Clicca "+ Nuovo prompt", dai un nome al template e scrivi il testo del prompt. Puoi usare {variabile} come segnaposto dinamico.' },
      { n: 3, title: 'Usa un prompt', desc: 'Clicca su qualsiasi prompt salvato: viene copiato automaticamente negli appunti. Incollalo nella chat con Ctrl+V.' },
      { n: 4, title: 'Organizza i prompt', desc: 'Trascina i prompt per riordinarli. Clicca i tre puntini ⋯ per modificarli o eliminarli.' },
    ],
    tip: 'La libreria prompt è disponibile nel piano Pro: con il piano Free puoi visualizzare e copiare i prompt già salvati ma non crearne di nuovi. I prompt vengono salvati localmente nel browser (non fanno parte della sincronizzazione cloud).',
  },
  {
    id: 'profiles',
    icon: <ProfileIcon />,
    color: '#fb923c',
    title: 'Profili Istruzioni',
    subtitle: 'Personalità e istruzioni custom per ogni contesto (Piano Pro)',
    steps: [
      { n: 1, title: 'Accedi ai profili', desc: 'Clicca la scheda "Profili" nella sidebar. Troverai i profili predefiniti (Sviluppatore, Marketing, Consulente).' },
      { n: 2, title: 'Crea un profilo custom', desc: 'Clicca "+ Nuovo profilo", scegli un nome e un colore identificativo, poi scrivi le istruzioni personalizzate per il modello.' },
      { n: 3, title: 'Attiva un profilo', desc: 'Clicca "Attiva" sul profilo desiderato: il profilo attivo viene salvato sul dispositivo e resta selezionato finché non lo disattivi.' },
      { n: 4, title: 'Cambia profilo al volo', desc: 'Puoi passare da un profilo all\'altro in qualsiasi momento.' },
    ],
    tip: 'La creazione di profili personalizzati richiede il piano Pro; i profili predefiniti restano disponibili su tutti i piani. Le istruzioni vengono salvate sul dispositivo e l\'iniezione automatica nelle impostazioni di ChatGPT è in sviluppo.',
  },
];

const platforms = [
  { name: 'ChatGPT', color: '#a855f7', url: 'chatgpt.com', note: 'Supporto completo: cartelle, bookmark, ricerca, prompt, profili istruzioni. Sidebar sul lato sinistro.' },
  { name: 'Google Gemini', color: '#60a5fa', url: 'gemini.google.com', note: 'Supporto completo: cartelle, bookmark, ricerca, prompt. Sidebar sul lato destro.' },
  { name: 'Claude', color: '#fb923c', url: 'claude.ai', note: 'Supporto completo: cartelle, bookmark, ricerca, prompt. Sidebar sul lato sinistro.' },
  { name: 'Perplexity', color: '#06b6d4', url: 'perplexity.ai', note: 'Supporto completo: cartelle, bookmark, ricerca. Sidebar sul lato destro.' },
];

/* ─── Chrome CTA ────────────────────────────────────────── */
const ChromeCTA = ({ label = 'Aggiungi a Chrome — è gratis' }: { label?: string }) => (
  <a
    href="https://chromewebstore.google.com"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(168,85,247,0.4)]"
  >
    {/* FontAwesome fa-chrome white */}
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="white" aria-hidden="true">
      <path d="M0 256C0 209.4 12.47 165.6 34.27 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222 512 256C512 397.4 397.4 512 256 512C242.3 512 228.8 511.1 215.6 509.2L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.19 98.47C103 38.53 178.2 0 256 0C350.8 0 433.5 51.26 477.8 128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z"/>
    </svg>
    {label}
  </a>
);

/* ─── Componente ─────────────────────────────────────────── */
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">

      <Header />


      {/* Hero guida */}
      <section className="border-b border-white/5 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c4b5fd' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            Documentazione
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Guida all&rsquo;estensione
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Tutto quello che devi sapere per sfruttare al massimo InFolders — dalla prima installazione alle funzionalità avanzate.
          </p>

          {/* Indice rapido */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10"
              >
                {s.title}
              </a>
            ))}
            <a
              href="#platforms"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10"
            >
              Piattaforme
            </a>
          </div>

          {/* CTA 1 — dopo l'indice */}
          <div className="mt-10 flex justify-center">
            <ChromeCTA label="Aggiungi a Chrome — è gratis" />
          </div>
        </div>
      </section>

      {/* Sezioni guida */}
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-24">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            {/* Header sezione */}
            <div className="mb-10 flex items-start gap-4">
              <div
                className="mt-0.5 shrink-0 rounded-xl p-2.5"
                style={{ background: `${s.color}18`, color: s.color }}
              >
                {s.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{s.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{s.subtitle}</p>
              </div>
            </div>

            {/* Step list */}
            <ol className="space-y-5">
              {s.steps.map((step) => (
                <li
                  key={step.n}
                  className="flex gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: `${s.color}20`, color: s.color }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-500">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Tip */}
            {s.tip && (
              <div
                className="mt-6 flex gap-3 rounded-xl border p-4 text-sm"
                style={{
                  borderColor: `${s.color}25`,
                  background: `${s.color}08`,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                <p style={{ color: `${s.color}dd` }}>{s.tip}</p>
              </div>
            )}
          </section>
        ))}

        {/* Sezione Piattaforme */}
        <section id="platforms" className="scroll-mt-24">
          <div className="mb-10">
            <h2 className="text-2xl font-bold">Piattaforme supportate</h2>
            <p className="mt-1 text-sm text-zinc-500">InFolders funziona su questi chatbot AI — ogni piattaforma ha il suo tema colore</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {platforms.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border p-5"
                style={{ borderColor: `${p.color}25`, background: `${p.color}08` }}
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: p.color, boxShadow: `0 0 8px ${p.color}55` }}
                  />
                  <h3 className="font-bold text-sm" style={{ color: p.color }}>{p.name}</h3>
                  <span className="ml-auto text-[11px] text-zinc-600">{p.url}</span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-500">{p.note}</p>
              </div>
            ))}
          </div>

          {/* CTA 2 — dopo le piattaforme */}
          <div className="mt-10 flex justify-center">
            <ChromeCTA label="Aggiungi a Chrome" />
          </div>
        </section>

        {/* Sezione Piani */}
        <section id="plans" className="scroll-mt-24">
          <div className="mb-10">
            <h2 className="text-2xl font-bold">Funzionalità per piano</h2>
            <p className="mt-1 text-sm text-zinc-500">Riepilogo di cosa è disponibile su ogni piano</p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-5 py-3 text-left font-semibold text-zinc-300">Funzionalità</th>
                  <th className="px-5 py-3 text-center font-semibold text-zinc-400">Free</th>
                  <th className="px-5 py-3 text-center font-semibold" style={{ color: '#a855f7' }}>Pro</th>
                  <th className="px-5 py-3 text-center font-semibold text-zinc-400">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { feat: 'Cartelle', free: 'Fino a 50 chat', pro: 'Illimitate', team: 'Illimitate' },
                  { feat: 'Bookmark', free: '✓ Illimitati', pro: '✓ Illimitati', team: '✓ Illimitati' },
                  { feat: 'Ricerca globale', free: '✓', pro: '✓', team: '✓' },
                  { feat: 'Drag & Drop', free: '✓', pro: '✓', team: '✓' },
                  { feat: 'Libreria Prompt (locale)', free: '—', pro: '✓', team: '✓' },
                  { feat: 'Profili Istruzioni (locale)', free: '—', pro: '✓', team: '✓' },
                  { feat: 'Sync cloud (bidirezionale)', free: '—', pro: '✓', team: '✓' },
                  { feat: 'Supporto prioritario', free: '—', pro: '—', team: '✓' },
                ].map((row) => (
                  <tr key={row.feat} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-zinc-300">{row.feat}</td>
                    <td className="px-5 py-3 text-center text-zinc-500">{row.free}</td>
                    <td className="px-5 py-3 text-center font-medium" style={{ color: row.pro === '—' ? '#52525b' : '#c4b5fd' }}>{row.pro}</td>
                    <td className="px-5 py-3 text-center text-zinc-500">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              Vedi tutti i piani e prezzi
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </section>

        {/* Problemi comuni */}
        <section id="troubleshooting" className="scroll-mt-24 pb-8">
          <div className="mb-10">
            <h2 className="text-2xl font-bold">Problemi comuni</h2>
            <p className="mt-1 text-sm text-zinc-500">Soluzioni rapide agli inconvenienti più frequenti</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'La sidebar non appare sul chatbot',
                a: "Verifica che l'estensione sia abilitata (icona InFolders nella barra di Chrome → interruttore attivo). Se il problema persiste, ricarica la pagina del chatbot con F5.",
              },
              {
                q: 'Le cartelle non si sincronizzano su un altro dispositivo',
                a: "La sincronizzazione cloud richiede il piano Pro e l'accesso con lo stesso account Google. Al login e a ogni modifica l'estensione confronta i dati locali con quelli nel cloud e li unisce (vince la modifica più recente, le eliminazioni vengono propagate). Assicurati di essere loggato con lo stesso account, di avere il piano Pro attivo e di aver lasciato la pagina aperta qualche secondo dopo il login: il sync avviene automaticamente.",
              },
              {
                q: 'Il pulsante bookmark non è visibile',
                a: "Il pulsante bookmark appare passando il mouse sopra la conversazione nella sidebar. Se non appare, ricarica la pagina. Assicurati di essere su una versione aggiornata dell'estensione.",
              },
              {
                q: 'Ho perso le mie cartelle dopo un aggiornamento',
                a: "Cartelle e bookmark sono salvati nello storage locale del browser (chrome.storage.local); prompt e profili nel localStorage del sito. Potresti averli persi se hai cancellato i dati del browser o disinstallato l'estensione. Con il piano Pro e l'accesso allo stesso account Google, al primo login su un nuovo dispositivo i dati vengono ripristinati dal cloud in automatico (merge con risoluzione dei conflitti per timestamp).",
              },
              {
                q: 'I profili istruzioni non si attivano',
                a: "La creazione di profili personalizzati richiede il piano Pro; i profili predefiniti sono disponibili su tutti i piani. I profili vengono salvati sul dispositivo: l'attivazione imposta quello attivo nella sidebar e l'iniezione automatica delle istruzioni nelle impostazioni di ChatGPT è in sviluppo.",
              },
            ].map((item, i) => (
              <details key={i} className="group rounded-xl border border-white/5 bg-white/[0.02] transition-all open:border-[#a855f7]/20 open:bg-[#a855f7]/[0.02]">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium transition-colors hover:text-[#a855f7]">
                  {item.q}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform group-open:rotate-180">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="border-t border-white/5 px-5 py-4 text-sm leading-relaxed text-zinc-400">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-zinc-400">Non hai trovato risposta?</p>
            <a
              href="mailto:support@infolders.app"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#a855f7] hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              Contatta il supporto
            </a>
          </div>

          {/* CTA 3 — finale */}
          <div className="mt-12 rounded-2xl border border-white/5 bg-white/[0.02] p-10 text-center">
            <div className="mx-auto mb-3 flex justify-center">
              <Image src="/icon-128.png" alt="InFolders" width={52} height={52} className="rounded-2xl opacity-90" />
            </div>
            <h3 className="text-xl font-bold">Pronto a iniziare?</h3>
            <p className="mt-2 text-sm text-zinc-500">Installa InFolders e porta ordine nelle tue conversazioni AI. Gratis, senza carta di credito.</p>
            <div className="mt-6 flex justify-center">
              <ChromeCTA label="Aggiungi a Chrome — gratis" />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
