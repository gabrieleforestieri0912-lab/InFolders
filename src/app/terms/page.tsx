import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../Header';
import Footer from '../Footer';

export const metadata: Metadata = {
  title: 'Termini di Servizio | InFolders',
  description: 'Termini e condizioni di utilizzo di InFolders, l\'estensione browser per organizzare le conversazioni AI in cartelle, bookmark e profili istruzioni.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-zinc-400">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">
      <Header />

      {/* Hero */}
      <section className="border-b border-white/5 py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#a855f7]">Legale</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Termini di Servizio</h1>
          <p className="mt-4 text-sm text-zinc-500">
            Ultimo aggiornamento: 3 luglio 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">

        <p className="mb-12 text-sm leading-relaxed text-zinc-400">
          Benvenuto in InFolders. Leggendo e utilizzando il nostro servizio, accetti i presenti Termini di Servizio.
          Ti invitiamo a leggerli attentamente prima di installare o utilizzare l&apos;estensione.
        </p>

        <Section title="1. Descrizione del Servizio">
          <p>
            InFolders è un&apos;estensione browser che consente di organizzare le conversazioni effettuate su piattaforme
            di intelligenza artificiale (ChatGPT, Google Gemini, Claude, Perplexity) in cartelle, bookmark, profili
            istruzioni e librerie prompt. Il servizio è disponibile in versione gratuita (Free) e a pagamento (Pro).
          </p>
          <p>
            InFolders non è affiliato, sponsorizzato né approvato da OpenAI, Google, Anthropic o Perplexity AI.
            I nomi dei prodotti sono marchi registrati delle rispettive società.
          </p>
        </Section>

        <Section title="2. Accettazione dei Termini">
          <p>
            Utilizzando InFolders, dichiari di avere almeno 16 anni di età e di accettare integralmente i presenti
            Termini di Servizio. Se utilizzi InFolders per conto di un&apos;organizzazione, dichiari di avere l&apos;autorità
            di vincolare tale organizzazione ai presenti Termini.
          </p>
        </Section>

        <Section title="3. Account e Autenticazione">
          <p>
            InFolders utilizza Google OAuth 2.0 per l&apos;autenticazione. L&apos;accesso con Google è necessario per
            abilitare la sincronizzazione cloud (funzionalità Pro). I dati di autenticazione (token) vengono utilizzati
            esclusivamente per identificare l&apos;utente e non vengono mai condivisi con terze parti.
          </p>
          <p>
            In modalità Free, l&apos;estensione funziona senza account: i dati vengono salvati localmente nel browser
            tramite le API standard di storage.
          </p>
        </Section>

        <Section title="4. Piani e Pagamenti">
          <p>
            InFolders offre i seguenti piani:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><span className="text-white font-medium">Free</span> — Gratuito, include cartelle di base, bookmark illimitati e fino a 50 chat nelle cartelle.</li>
            <li><span className="text-white font-medium">Pro</span> — €9,99 una tantum. Sblocca chat illimitate, sincronizzazione cloud multi-dispositivo, libreria prompt e profili istruzioni personalizzati. Accesso a vita senza abbonamenti ricorrenti.</li>
            <li><span className="text-white font-medium">Team</span> — €29,99/utente/anno. Include tutte le funzionalità Pro, condivisione del team e supporto prioritario dedicato.</li>
          </ul>
          <p>
            I pagamenti sono elaborati tramite Stripe in modo sicuro. InFolders non raccoglie né memorizza dati
            delle carte di credito sui propri server. Le transazioni sono soggette ai Termini di Servizio di Stripe.
          </p>
          <p>
            Il piano Pro prevede un pagamento una tantum. Non esistono rinnovi automatici. La fattura viene emessa
            al momento dell&apos;acquisto.
          </p>
        </Section>

        <Section title="5. Politica di Rimborso">
          <p>
            Data la natura digitale del prodotto e la disponibilità immediata di tutte le funzionalità al momento
            dell&apos;acquisto, i rimborsi non sono generalmente previsti. In caso di problemi tecnici gravi che rendano
            il servizio inutilizzabile, potrai contattare il supporto all&apos;indirizzo{' '}
            <a href="mailto:support@infolders.app" className="text-[#a855f7] hover:underline">support@infolders.app</a>
            {' '}entro 14 giorni dall&apos;acquisto per una valutazione caso per caso.
          </p>
        </Section>

        <Section title="6. Utilizzo Accettabile">
          <p>Accetti di non utilizzare InFolders per:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Violare leggi vigenti o diritti di terzi;</li>
            <li>Tentare di accedere in modo non autorizzato ai sistemi di InFolders;</li>
            <li>Distribuire malware, virus o codice dannoso;</li>
            <li>Effettuare reverse engineering o decompilare l&apos;estensione;</li>
            <li>Rivendere o sublicenziare l&apos;accesso al servizio;</li>
            <li>Interferire con il funzionamento corretto del servizio o delle piattaforme AI supportate.</li>
          </ul>
        </Section>

        <Section title="7. Dati e Privacy">
          <p>
            Il trattamento dei tuoi dati personali è disciplinato dalla nostra{' '}
            <Link href="/privacy" className="text-[#a855f7] hover:underline">Privacy Policy</Link>, che fa parte
            integrante dei presenti Termini. In sintesi:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>I dati delle cartelle e bookmark sono salvati localmente nel tuo browser (piano Free) o sincronizzati su Supabase con crittografia (piano Pro).</li>
            <li>Non vendiamo i tuoi dati a terze parti.</li>
            <li>I dati di autenticazione Google (nome ed email) vengono usati solo per identificarti nel sistema.</li>
          </ul>
        </Section>

        <Section title="8. Proprietà Intellettuale">
          <p>
            InFolders e i relativi loghi, interfaccia grafica, codice sorgente e documentazione sono di proprietà
            esclusiva degli sviluppatori di InFolders. È vietata la riproduzione, distribuzione o utilizzo
            non autorizzato di qualsiasi elemento del servizio.
          </p>
          <p>
            I contenuti caricati dagli utenti (nomi di cartelle, prompt, ecc.) rimangono di proprietà dell&apos;utente.
            Concedi a InFolders una licenza limitata e non esclusiva per memorizzare e processare tali dati al
            solo fine di erogare il servizio.
          </p>
        </Section>

        <Section title="9. Limitazione di Responsabilità">
          <p>
            InFolders è fornito &quot;così com&apos;è&quot; (as-is), senza garanzie di alcun tipo, espresse o implicite.
            Non garantiamo la disponibilità continua del servizio, la compatibilità con futuri aggiornamenti delle
            piattaforme AI supportate, né l&apos;assenza di errori.
          </p>
          <p>
            In nessun caso InFolders sarà responsabile per danni indiretti, consequenziali o perdita di dati
            derivanti dall&apos;uso o dall&apos;impossibilità di utilizzo del servizio, nei limiti consentiti dalla legge applicabile.
          </p>
        </Section>

        <Section title="10. Interruzione del Servizio">
          <p>
            Ci riserviamo il diritto di sospendere o interrompere il servizio (o parte di esso) con ragionevole
            preavviso. In caso di interruzione definitiva del servizio Pro a pagamento, verrà valutato un rimborso
            proporzionale al periodo residuo.
          </p>
          <p>
            Possiamo terminare o sospendere l&apos;accesso di un utente specifico in caso di violazione dei presenti Termini,
            senza preavviso e senza obbligo di rimborso.
          </p>
        </Section>

        <Section title="11. Modifiche ai Termini">
          <p>
            Ci riserviamo il diritto di aggiornare i presenti Termini in qualsiasi momento. Le modifiche sostanziali
            verranno comunicate con almeno 14 giorni di anticipo tramite email (se registrato) o tramite avviso
            nell&apos;estensione. L&apos;utilizzo continuato del servizio dopo la notifica costituisce accettazione dei nuovi Termini.
          </p>
        </Section>

        <Section title="12. Legge Applicabile">
          <p>
            I presenti Termini sono disciplinati dalla legge italiana. Per qualsiasi controversia, le parti
            concordano sulla competenza esclusiva del Foro di Roma, salvo diversa disposizione di legge applicabile
            al consumatore.
          </p>
        </Section>

        <Section title="13. Contatti">
          <p>
            Per domande relative ai presenti Termini di Servizio, contattaci all&apos;indirizzo:{' '}
            <a href="mailto:support@infolders.app" className="text-[#a855f7] hover:underline">
              support@infolders.app
            </a>
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
