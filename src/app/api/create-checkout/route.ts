import { NextResponse } from 'next/server';

const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { plan, userId, email } = await req.json();

    if (!plan || !userId || !email) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const plans: Record<string, { name: string; amount: number }> = {
      pro: { name: 'InFolders Pro', amount: 999 },
      team: { name: 'InFolders Team', amount: 2999 },
    };
    const selected = plans[plan];
    if (!selected) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          recurring: { interval: 'month' },
          product_data: { name: selected.name, description: `Piano ${plan === 'pro' ? 'Pro' : 'Team'} — abbonamento mensile` },
          unit_amount: selected.amount,
        },
        quantity: 1,
      }],
      metadata: { userId, plan },
      client_reference_id: userId,
      customer_email: email,
      success_url: `${siteUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/premium/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
