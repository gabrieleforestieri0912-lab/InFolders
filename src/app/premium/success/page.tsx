'use client';

import { useEffect, useState } from 'react';

export default function PremiumSuccessPage() {
  const [status] = useState<'verifying' | 'success'>('success');

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
          background: '#a855f7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '36px',
        }}>
          &#10003;
        </div>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px' }}>Pagamento riuscito!</h1>
        <p style={{ color: '#a1a1aa', fontSize: '16px', margin: '0 0 32px', maxWidth: '400px' }}>
          Grazie per aver scelto InFolders Premium! Il tuo accesso è ora attivo.
        </p>
        <p style={{ color: '#636363', fontSize: '14px' }}>
          Puoi chiudere questa pagina e tornare all&apos;estensione.
        </p>
      </div>
    </div>
  );
}
