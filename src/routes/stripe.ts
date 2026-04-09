import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// ── POST /stripe/create-checkout ──────────────────────────
// Parse JSON normalement pour cette route
router.post('/create-checkout', express.json(), async (req, res) => {
  const { priceId, userId, email } = req.body;

  if (!priceId || !email) {
    return res.status(400).json({ error: 'priceId et email requis' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    let customerId: string;

    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (user?.stripe_customer_id) {
      customerId = user.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: { trial_period_days: 7 },
      success_url: 'http://localhost:55074/checkout.html?success=true',
      cancel_url:  'http://localhost:55074/pricing.html?canceled=true',
    });

    res.json({ url: session.url });

  } catch (err: any) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /stripe/webhook ───────────────────────────────────
// Raw body pour vérifier la signature Stripe
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const obj = event.data.object as any;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await supabase.from('users').update({
          subscription_status: obj.status,
          subscription_plan:   obj.items.data[0].price.id,
          subscription_end:    new Date(obj.current_period_end * 1000).toISOString(),
        }).eq('stripe_customer_id', obj.customer);
        break;

      case 'customer.subscription.deleted':
        await supabase.from('users').update({
          subscription_status: 'canceled',
          subscription_end:    new Date().toISOString(),
        }).eq('stripe_customer_id', obj.customer);
        break;

      case 'invoice.payment_failed':
        console.log('❌ Paiement échoué pour:', obj.customer);
        break;

      case 'invoice.paid':
        console.log('✅ Paiement reçu pour:', obj.customer);
        break;
    }

    res.json({ received: true });
  }
);

export default router;
