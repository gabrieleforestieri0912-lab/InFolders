import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pagamento | InFolders',
  robots: { index: false, follow: false },
};

export default async function PremiumSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paid = false;
  let error: string | null = null;
  if (session_id) {
    try {
      const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY!);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      paid = session.payment_status === 'paid';
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Errore nella verifica del pagamento';
      console.error('Checkout verification error:', err);
    }
  } else {
    error = 'Nessun pagamento da verificare.';
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#09000d',
      color: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        {paid ? (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#a855f7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: '36px',
            }}>
              &#10003;
            </div>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>Pagamento riuscito!</h1>
            <p style={{ color: '#a1a1aa', fontSize: '16px', margin: '0 0 32px', maxWidth: '400px' }}>
              Grazie per aver scelto InFolders Premium! L&apos;attivazione può richiedere qualche istante:
              se non vedi ancora il badge Premium nella sidebar, ricarica la pagina del chatbot.
            </p>
            <p style={{ color: '#636363', fontSize: '14px' }}>
              Puoi chiudere questa pagina e tornare all&apos;estensione.
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: '36px',
            }}>
              &#x2715;
            </div>
            <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>Pagamento non completato</h1>
            <p style={{ color: '#a1a1aa', fontSize: '16px', margin: '0 0 32px', maxWidth: '400px' }}>
              {error || 'Non è stato trovato un pagamento riuscito. Nessun addebito effettuato: il tuo piano Free resta attivo.'}
            </p>
            <Link
              href="/#pricing"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Torna ai piani
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
