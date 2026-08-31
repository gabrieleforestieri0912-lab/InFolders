import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'InFolders <onboarding@resend.dev>';

export async function sendContactEmail(data: {
  name: string;
  email: string;
  message: string;
  plan?: string;
}) {
  return resend.emails.send({
    from: RESEND_FROM,
    to: process.env.CONTACT_EMAIL!,
    subject: `Richiesta contatto Team - ${data.name}`,
    html: `
      <h2>Nuova richiesta contatto InFolders</h2>
      <p><strong>Nome:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Piano:</strong> ${data.plan || 'Team'}</p>
      <p><strong>Messaggio:</strong></p>
      <p>${data.message}</p>
    `,
  });
}

export async function sendPremiumWelcomeEmail(data: {
  email: string;
  name: string;
  plan: string;
}) {
  return resend.emails.send({
    from: RESEND_FROM,
    to: data.email,
    subject: `Benvenuto su InFolders ${data.plan === 'pro' ? 'Pro' : 'Team'}!`,
    html: `
      <h2>Grazie per aver scelto InFolders ${data.plan === 'pro' ? 'Pro' : 'Team'}!</h2>
      <p>Ciao ${data.name},</p>
      <p>Il tuo piano è stato attivato con successo. Goditi tutte le funzionalità premium!</p>
      <p>Se hai domande, rispondi a questa email.</p>
      <p>Il team InFolders</p>
    `,
  });
}

export async function sendFeedbackEmail(data: {
  type: string;
  rating: number;
  message: string;
  email?: string;
}) {
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  return resend.emails.send({
    from: RESEND_FROM,
    to: process.env.CONTACT_EMAIL!,
    subject: `[Feedback] ${data.type} — ${stars}`,
    html: `
      <h2>Nuovo feedback InFolders</h2>
      <p><strong>Tipo:</strong> ${data.type}</p>
      <p><strong>Valutazione:</strong> ${stars} (${data.rating}/5)</p>
      <p><strong>Email:</strong> ${data.email || 'Anonimo'}</p>
      <p><strong>Messaggio:</strong></p>
      <p style="background:#f5f5f5;padding:12px;border-radius:6px;">${data.message}</p>
    `,
  });
}

