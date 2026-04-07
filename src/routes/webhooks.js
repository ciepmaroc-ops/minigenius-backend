app.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const sub = event.data.object;
      await supabase.from('users').update({
        subscription_status: sub.status,        // 'active', 'trialing', 'past_due'
        subscription_plan: sub.items.data[0].price.id,
        subscription_end: new Date(sub.current_period_end * 1000).toISOString()
      }).eq('stripe_customer_id', sub.customer);
      break;
      
    case 'customer.subscription.deleted':
      await supabase.from('users').update({
        subscription_status: 'canceled'
      }).eq('stripe_customer_id', event.data.object.customer);
      break;
      
    case 'invoice.payment_failed':
      // Envoyer email d'alerte au parent
      break;
  }
  
  res.json({received: true});
});