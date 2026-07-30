import { NextResponse } from 'next/server';
import { sendFeedbackEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { type, rating, message, email } = await req.json();

    if (!message || !type || !rating) {
      return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valutazione non valida' }, { status: 400 });
    }

    await sendFeedbackEmail({ type, rating, message, email });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Errore invio feedback';
    console.error('Feedback error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
