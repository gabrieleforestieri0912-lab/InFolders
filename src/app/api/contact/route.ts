import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { name, email, message, plan } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    await sendContactEmail({ name, email, message, plan: plan || 'Team' });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Contact error:', err);
    return NextResponse.json({ error: err.message || 'Errore invio email' }, { status: 500 });
  }
}
