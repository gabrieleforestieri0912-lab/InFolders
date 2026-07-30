import { NextResponse } from 'next/server';
import { sendPremiumWelcomeEmail } from '@/lib/resend';

const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const { createClient } = await import('@supabase/supabase-js');

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing Supabase env vars for webhook');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const session = event.data.object;
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || 'pro';
      const customerEmail = session.customer_details?.email || '';
      const amountPaid = session.amount_total ? `${(session.amount_total / 100).toFixed(2)}€` : '';

      const premiumData = {
        premium: true,
        plan,
        price: plan === 'pro' ? '2,99€' : '9,99€',
        active: true,
        startDate: new Date().toISOString(),
        trialEnds: null,
        currentPeriodEnd: null,
        paymentIntent: session.payment_intent,
        stripeCustomerId: session.customer,
        customerEmail,
        amountPaid,
      };

      await supabase.from('user_data').upsert(
        {
          user_id: userId,
          premium_data: premiumData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      try {
        await sendPremiumWelcomeEmail({
          email: customerEmail,
          name: session.customer_details?.name || customerEmail,
          plan,
        });
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
