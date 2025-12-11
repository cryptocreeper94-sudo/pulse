import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

const PRICE_IDS = {
  base: process.env.BASE_PRICE_ID || process.env.STRIPE_BASE_MONTHLY_PRICE,
  founder: process.env.LEGACY_FOUNDER_6MONTH_PRICE_ID || process.env.STRIPE_LEGACY_FOUNDER_PRICE,
  annual: process.env.ANNUAL_SUBSCRIPTION_PRICE_ID || process.env.STRIPE_ANNUAL_PRICE,
  premium: process.env.PREMIUM_PRICE_ID
};

export const paymentRoutes = [
  {
    path: "/api/payments/stripe/create-base",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.base;
        if (!priceId) {
          logger?.error('❌ [Stripe] BASE_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          subscription_data: {
            trial_period_days: 3
          },
          success_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=settings&payment=success`,
          cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'base'
          }
        });

        logger?.info('✅ [Stripe] Created base checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-founder",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.founder;
        if (!priceId) {
          logger?.error('❌ [Stripe] LEGACY_FOUNDER_6MONTH_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=settings&payment=success&plan=founder`,
          cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'founder',
            dwavTokens: '35000'
          }
        });

        logger?.info('✅ [Stripe] Created founder checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-annual",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.annual;
        if (!priceId) {
          logger?.error('❌ [Stripe] ANNUAL_SUBSCRIPTION_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          subscription_data: {
            trial_period_days: 3
          },
          success_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=settings&payment=success&plan=annual`,
          cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'annual'
          }
        });

        logger?.info('✅ [Stripe] Created annual checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-legacy-founder",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.founder;
        if (!priceId) {
          logger?.error('❌ [Stripe] LEGACY_FOUNDER_6MONTH_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=settings&payment=success&plan=founder`,
          cancel_url: `${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000'}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'legacy_founder',
            dwavTokens: '35000'
          }
        });

        logger?.info('✅ [Stripe] Created legacy founder checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/cancel-subscription",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { subscriptionId, userId } = await c.req.json();
        
        if (!subscriptionId) {
          return c.json({ error: 'Subscription ID required' }, 400);
        }

        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });

        logger?.info('✅ [Stripe] Subscription cancelled at period end', { subscriptionId, userId });
        return c.json({ 
          success: true, 
          message: 'Subscription will be cancelled at the end of the billing period',
          cancelAt: subscription.cancel_at
        });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Cancel subscription error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/webhook",
    method: "POST",
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.text();
        const sig = c.req.header('stripe-signature');
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
          logger?.warn('⚠️ [Stripe] Webhook secret not configured');
          return c.json({ received: true });
        }

        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } catch (err: any) {
          logger?.error('❌ [Stripe] Webhook signature verification failed', { error: err.message });
          return c.json({ error: 'Webhook signature verification failed' }, 400);
        }

        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            logger?.info('✅ [Stripe] Checkout completed', { 
              sessionId: session.id, 
              userId: session.client_reference_id,
              planType: session.metadata?.planType
            });
            break;
          }
          case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            logger?.info('📝 [Stripe] Subscription updated', { subscriptionId: subscription.id });
            break;
          }
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            logger?.info('❌ [Stripe] Subscription deleted', { subscriptionId: subscription.id });
            break;
          }
          default:
            logger?.info(`[Stripe] Unhandled event type: ${event.type}`);
        }

        return c.json({ received: true });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Webhook error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  }
];
