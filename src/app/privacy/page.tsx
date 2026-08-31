import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../Header';
import Footer from '../Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | InFolders',
  description: 'Informativa sulla privacy di InFolders, l\'estensione browser per organizzare le conversazioni AI in cartelle, bookmark e profili istruzioni.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-zinc-400">{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">
      <Header />

      {/* Hero */}
      <section className="border-b border-white/5 py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#a855f7]">Legale</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-4 text-sm text-zinc-500">
            Ultimo aggiornamento: 21 agosto 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">

        <p className="mb-12 text-sm leading-relaxed text-zinc-400">
          InFolders è un&apos;estensione browser che aiuta a organizzare le conversazioni con servizi
          di chat AI (ad es. ChatGPT, Gemini, Claude, Perplexity). Questa pagina descrive quali dati
          vengono trattati e perché.
        </p>

        <Section title="1. Dati memorizzati sul dispositivo">
          <p>
            Tramite le API di storage del browser (<code>chrome.storage.local</code>) l&apos;estensione
            salva: struttura delle cartelle e riferimenti alle chat, bookmark, stato del piano
            (Free/Pro/Team), dati del profilo Google (id, email, nome, foto) e la sessione di
            autenticazione usata per la sincronizzazione cloud. I prompt e i profili istruzioni
            vengono salvati nel <code>localStorage</code> del sito su cui usi l&apos;estensione.
          </p>
        </Section>

        <Section title="2. Accesso con Google">
          <p>
            Il login usa OAuth 2.0 di Google. L&apos;ID token temporaneo viene usato per leggere i
            campi base del profilo (email, nome) e non viene salvato; la sessione di autenticazione
            generata con il servizio di sincronizzazione viene conservata localmente nel browser
            e rimossa al logout.
          </p>
        </Section>

        <Section title="3. Sincronizzazione cloud (Supabase)">
          <p>
            Solo gli utenti con un piano a pagamento (Pro/Team) sincronizzano i dati sul cloud.
            Vengono sincronizzati: struttura delle cartelle, bookmark e stato del piano, su
            connessione HTTPS, associati al tuo account. Gli utenti del piano Free non caricano
            dati sul cloud. La sincronizzazione è bidirezionale: al login e a ogni modifica le
            cartelle e i bookmark vengono confrontati con quelli nel cloud e uniti con risoluzione
            dei conflitti basata sulla modifica più recente (timestamp). Le eliminazioni vengono
            propagate tra i dispositivi tramite marcatori temporanei e un dispositivo rimasto
            offline a lungo riprende il sync al primo accesso.
          </p>
        </Section>

        <Section title="4. Pagamenti">
          <p>
            I piani a pagamento sono abbonamenti mensili elaborati tramite Stripe. InFolders non
            raccoglie né memorizza i dati della tua carta di credito: il pagamento avviene
            interamente sulla piattaforma Stripe.
          </p>
        </Section>

        <Section title="5. Content script">
          <p>
            Su siti di terze parti (fornitori di chat) viene iniettata un&apos;interfaccia (sidebar,
            pulsanti). L&apos;estensione non legge né invia il contenuto delle conversazioni: salva
            solo il collegamento e il titolo delle chat che decidi di organizzare.
          </p>
        </Section>

        <Section title="6. I tuoi diritti">
          <p>
            Puoi revocare l&apos;accesso Google dalle impostazioni del tuo account Google,
            disconnetterti dall&apos;estensione (il logout rimuove anche la sessione cloud dal
            dispositivo), cancellare i dati dall&apos;estensione e disinstallarla in qualsiasi momento.
          </p>
        </Section>

        <Section title="7. Contatti">
          <p>
            Per richieste relative alla privacy, contattaci all&apos;indirizzo{' '}
            <a href="mailto:privacy@infolders.app" className="text-[#a855f7] hover:underline">
              privacy@infolders.app
            </a>{' '}
            (aggiorna con un indirizzo reale prima del lancio pubblico).
          </p>
        </Section>

        {/* Back link */}
        <div className="mt-6 border-t border-white/5 pt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
            </svg>
            Torna alla home
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
