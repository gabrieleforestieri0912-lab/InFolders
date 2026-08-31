import { NextResponse } from 'next/server';
import { sendPremiumWelcomeEmail } from '@/lib/resend';

const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY!);

async function getSupabaseAdmin() {
  const { createClient } = await import('@supabase/supabase-js');
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase env vars for webhook');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function findUserDataByStripeCustomer(supabase: any, customer: string) {
  const { data, error } = await supabase
    .from('user_data')
    .select('user_id, premium_data')
    .eq('premium_data->>stripeCustomerId', customer)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function handleCheckoutCompleted(event: any) {
  const supabase = await getSupabaseAdmin();
  const session = event.data.object;
  const userId = session.client_reference_id;
  if (!userId) {
    console.warn('Webhook: checkout.session.completed senza client_reference_id');
    return;
  }
  const plan = session.metadata?.plan || 'pro';
  const customerEmail = session.customer_details?.email || '';
  const amountPaid = session.amount_total ? `${(session.amount_total / 100).toFixed(2)}€` : '';

  const premiumData = {
    premium: true,
    plan,
    price: plan === 'pro' ? '9,99€' : '29,99€',
    active: true,
    startDate: new Date().toISOString(),
    trialEnds: null,
    currentPeriodEnd: null,
    paymentIntent: session.payment_intent,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription || null,
    customerEmail,
    amountPaid,
  };

  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      premium_data: premiumData,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;

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

async function handleSubscriptionDeleted(event: any) {
  const supabase = await getSupabaseAdmin();
  const subscription = event.data.object;
  const customer = subscription.customer;
  if (!customer) return;
  const row = await findUserDataByStripeCustomer(supabase, customer);
  if (!row) {
    console.warn(`Webhook: subscription.deleted senza riga user_data per customer ${customer}`);
    return;
  }
  const prev = row.premium_data && typeof row.premium_data === 'object' ? row.premium_data : {};
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : prev.currentPeriodEnd || null;

  const { error } = await supabase
    .from('user_data')
    .update({
      premium_data: {
        ...prev,
        premium: false,
        active: false,
        cancelledAt: new Date().toISOString(),
        currentPeriodEnd,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', row.user_id);
  if (error) throw error;
  console.log(`Webhook: premium disattivato per ${row.user_id} (subscription.deleted)`);
}

async function handleInvoicePaymentFailed(event: any) {
  const supabase = await getSupabaseAdmin();
  const invoice = event.data.object;
  const customer = invoice.customer;
  if (!customer) return;
  const row = await findUserDataByStripeCustomer(supabase, customer);
  if (!row) return;
  const prev = row.premium_data && typeof row.premium_data === 'object' ? row.premium_data : {};

  const { error } = await supabase
    .from('user_data')
    .update({
      premium_data: {
        ...prev,
        paymentFailed: true,
        paymentFailedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', row.user_id);
  if (error) throw error;
  console.log(`Webhook: pagamento fallito per ${row.user_id} (invoice.payment_failed)`);
}

async function handleInvoicePaymentSucceeded(event: any) {
  const supabase = await getSupabaseAdmin();
  const invoice = event.data.object;
  const customer = invoice.customer;
  if (!customer) return;
  const row = await findUserDataByStripeCustomer(supabase, customer);
  if (!row) return;
  const prev = row.premium_data && typeof row.premium_data === 'object' ? row.premium_data : {};
  const periodEnd = invoice.lines?.data?.[0]?.period?.end;

  const { error } = await supabase
    .from('user_data')
    .update({
      premium_data: {
        ...prev,
        premium: true,
        active: true,
        paymentFailed: false,
        paymentFailedAt: null,
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : prev.currentPeriodEnd || null,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', row.user_id);
  if (error) throw error;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
