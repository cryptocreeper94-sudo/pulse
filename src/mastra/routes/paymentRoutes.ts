import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

const PRICE_IDS = {
  founder: process.env.LEGACY_FOUNDER_6MONTH_PRICE_ID || process.env.STRIPE_LEGACY_FOUNDER_PRICE,
  pulseProMonthly: process.env.PULSE_PRO_MONTHLY_PRICE_ID,
  pulseProAnnual: process.env.PULSE_PRO_ANNUAL_PRICE_ID,
  strikeAgentMonthly: process.env.STRIKE_AGENT_MONTHLY_PRICE_ID,
  strikeAgentAnnual: process.env.STRIKE_AGENT_ANNUAL_PRICE_ID,
  completeBundleMonthly: process.env.COMPLETE_BUNDLE_MONTHLY_PRICE_ID,
  completeBundleAnnual: process.env.COMPLETE_BUNDLE_ANNUAL_PRICE_ID
};

const getBaseUrl = () => process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000';

export const paymentRoutes = [
  {
    path: "/api/payments/stripe/create-pulse-monthly",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.pulseProMonthly;
        if (!priceId) {
          logger?.error('❌ [Stripe] PULSE_PRO_MONTHLY_PRICE_ID not configured');
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
            trial_period_days: 2
          },
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=pulse_pro`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'pulse_pro_monthly'
          }
        });

        logger?.info('✅ [Stripe] Created Pulse Pro monthly checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-pulse-annual",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.pulseProAnnual;
        if (!priceId) {
          logger?.error('❌ [Stripe] PULSE_PRO_ANNUAL_PRICE_ID not configured');
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
            trial_period_days: 2
          },
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=pulse_pro_annual`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'pulse_pro_annual'
          }
        });

        logger?.info('✅ [Stripe] Created Pulse Pro annual checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-strike-monthly",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.strikeAgentMonthly;
        if (!priceId) {
          logger?.error('❌ [Stripe] STRIKE_AGENT_MONTHLY_PRICE_ID not configured');
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
            trial_period_days: 2
          },
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=strike_agent`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'strike_agent_monthly'
          }
        });

        logger?.info('✅ [Stripe] Created StrikeAgent monthly checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-strike-annual",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.strikeAgentAnnual;
        if (!priceId) {
          logger?.error('❌ [Stripe] STRIKE_AGENT_ANNUAL_PRICE_ID not configured');
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
            trial_period_days: 2
          },
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=strike_agent_annual`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'strike_agent_annual'
          }
        });

        logger?.info('✅ [Stripe] Created StrikeAgent annual checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-bundle-monthly",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.completeBundleMonthly;
        if (!priceId) {
          logger?.error('❌ [Stripe] COMPLETE_BUNDLE_MONTHLY_PRICE_ID not configured');
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
            trial_period_days: 2
          },
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=complete_bundle`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'complete_bundle_monthly'
          }
        });

        logger?.info('✅ [Stripe] Created Complete Bundle monthly checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-bundle-annual",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = PRICE_IDS.completeBundleAnnual;
        if (!priceId) {
          logger?.error('❌ [Stripe] COMPLETE_BUNDLE_ANNUAL_PRICE_ID not configured');
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
            trial_period_days: 2
          },
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=complete_bundle_annual`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
          client_reference_id: userId,
          metadata: {
            userId,
            planType: 'complete_bundle_annual'
          }
        });

        logger?.info('✅ [Stripe] Created Complete Bundle annual checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [Stripe] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/payments/stripe/create-founder",
    method: "POST" as const,
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
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=founder`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
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
    path: "/api/payments/stripe/create-legacy-founder",
    method: "POST" as const,
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
          success_url: `${getBaseUrl()}/app?tab=settings&payment=success&plan=founder`,
          cancel_url: `${getBaseUrl()}/app?tab=pricing&payment=cancelled`,
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
    method: "POST" as const,
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
    method: "POST" as const,
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
