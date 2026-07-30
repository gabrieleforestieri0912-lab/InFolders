'use client';

export default function PremiumCancelPage() {
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
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid rgba(239, 68, 68, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '36px',
        }}>
          &#x2715;
        </div>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>Pagamento annullato</h1>
        <p style={{ color: '#a1a1aa', fontSize: '16px', margin: '0 0 32px', maxWidth: '400px' }}>
          Nessun addebito effettuato. Il tuo piano Free resta attivo.
        </p>
        <p style={{ color: '#636363', fontSize: '14px', margin: 0 }}>
          Puoi riprovare quando vuoi dalla sidebar.
        </p>
      </div>
    </div>
  );
}
