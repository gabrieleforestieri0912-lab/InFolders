'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../Header';
import Footer from '../Footer';

const FEEDBACK_TYPES = [
  { id: 'bug', label: '🐛 Segnala un bug', desc: 'Qualcosa non funziona come previsto' },
  { id: 'feature', label: '💡 Suggerimento', desc: 'Hai un\'idea per migliorare InFolders' },
  { id: 'ux', label: '🎨 Design / UX', desc: 'Feedback su usabilità o interfaccia' },
  { id: 'general', label: '💬 Feedback generale', desc: 'Altre impressioni o commenti' },
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function FeedbackPage() {
  const [type, setType] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !rating || !message.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rating, message: message.trim(), email: email.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore sconosciuto');
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore nell\'invio');
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">
      <Header />

      {/* Hero */}
      <section className="border-b border-white/5 py-14">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#a855f7]">Feedback</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Aiutaci a migliorare</h1>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Il tuo feedback è fondamentale per noi. Segnalaci bug, proponi nuove funzionalità o dicci
            semplicemente cosa ne pensi di InFolders.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-2xl px-6 py-16">
        {status === 'success' ? (
          /* ─── Success state ─── */
          <div className="rounded-2xl border border-[#a855f7]/20 bg-[#a855f7]/5 p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#a855f7]/15">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Grazie mille! 🙏</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Il tuo feedback è stato ricevuto. Lo leggeremo con attenzione e lo useremo per rendere
              InFolders ancora migliore.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => {
                  setStatus('idle');
                  setType('');
                  setRating(0);
                  setMessage('');
                  setEmail('');
                }}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium transition-all hover:bg-white/10"
              >
                Invia un altro feedback
              </button>
              <Link
                href="/"
                className="rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              >
                Torna alla home
              </Link>
            </div>
          </div>
        ) : (
          /* ─── Form ─── */
          <form onSubmit={handleSubmit} noValidate className="space-y-10">

            {/* Step 1 — Tipo */}
            <fieldset>
              <legend className="mb-4 text-sm font-semibold text-zinc-300">
                1. Che tipo di feedback vuoi inviare?
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEEDBACK_TYPES.map((ft) => (
                  <button
                    key={ft.id}
                    type="button"
                    onClick={() => setType(ft.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      type === ft.id
                        ? 'border-[#a855f7]/50 bg-[#a855f7]/10'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    <p className="text-sm font-semibold">{ft.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{ft.desc}</p>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Step 2 — Rating */}
            <fieldset>
              <legend className="mb-4 text-sm font-semibold text-zinc-300">
                2. Come valuti InFolders complessivamente?
              </legend>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    aria-label={`${star} stelle`}
                  >
                    <span style={{ color: star <= displayRating ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>
                      ★
                    </span>
                  </button>
                ))}
                {displayRating > 0 && (
                  <span className="ml-2 text-sm text-zinc-400">
                    {['', 'Pessimo', 'Scarso', 'Nella media', 'Buono', 'Eccellente'][displayRating]}
                  </span>
                )}
              </div>
            </fieldset>

            {/* Step 3 — Messaggio */}
            <div>
              <label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold text-zinc-300">
                3. Descrivi il tuo feedback <span className="text-[#a855f7]">*</span>
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder={
                  type === 'bug'
                    ? 'Descrivi il bug: cosa hai fatto, cosa ti aspettavi, cosa è successo...'
                    : type === 'feature'
                    ? 'Descrivi la funzionalità che vorresti vedere in InFolders...'
                    : 'Scrivi qui il tuo feedback...'
                }
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-[#a855f7]/40 focus:bg-[#a855f7]/5"
              />
              <p className="mt-1.5 text-right text-xs text-zinc-600">{message.length} / 1000</p>
            </div>

            {/* Step 4 — Email (opzionale) */}
            <div>
              <label htmlFor="feedback-email" className="mb-2 block text-sm font-semibold text-zinc-300">
                4. La tua email <span className="text-zinc-600 font-normal">(opzionale — per ricevere una risposta)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@esempio.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-[#a855f7]/40 focus:bg-[#a855f7]/5"
              />
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {errorMsg || 'Si è verificato un errore. Riprova più tardi.'}
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <p className="text-xs text-zinc-600">
                I campi con <span className="text-[#a855f7]">*</span> sono obbligatori
              </p>
              <button
                type="submit"
                disabled={!type || !rating || !message.trim() || status === 'loading'}
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-7 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Invio in corso...
                  </>
                ) : (
                  <>
                    Invia feedback
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
