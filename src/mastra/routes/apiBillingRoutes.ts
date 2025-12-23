import Stripe from 'stripe';
import { apiBillingService } from '../../services/apiBillingService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

const API_PRICE_IDS = {
  proMonthly: process.env.API_PRO_MONTHLY_PRICE_ID,
  proAnnual: process.env.API_PRO_ANNUAL_PRICE_ID,
  enterpriseMonthly: process.env.API_ENTERPRISE_MONTHLY_PRICE_ID,
  enterpriseAnnual: process.env.API_ENTERPRISE_ANNUAL_PRICE_ID,
};

const getBaseUrl = () => process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'http://localhost:5000';

export const apiBillingRoutes = [
  {
    path: "/api/developer/billing/create-pro-monthly",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, email } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = API_PRICE_IDS.proMonthly;
        if (!priceId) {
          logger?.error('❌ [ApiBilling] API_PRO_MONTHLY_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const customerId = await apiBillingService.getOrCreateStripeCustomer(userId, email);

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${getBaseUrl()}/app?tab=developers&payment=success&plan=api_pro`,
          cancel_url: `${getBaseUrl()}/app?tab=developers&payment=cancelled`,
          client_reference_id: userId,
          subscription_data: {
            metadata: {
              userId,
              planType: 'api_pro',
              billingPeriod: 'monthly'
            }
          },
          metadata: {
            userId,
            planType: 'api_pro',
            billingPeriod: 'monthly'
          }
        });

        logger?.info('✅ [ApiBilling] Created API Pro monthly checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/developer/billing/create-pro-annual",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, email } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = API_PRICE_IDS.proAnnual;
        if (!priceId) {
          logger?.error('❌ [ApiBilling] API_PRO_ANNUAL_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const customerId = await apiBillingService.getOrCreateStripeCustomer(userId, email);

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${getBaseUrl()}/app?tab=developers&payment=success&plan=api_pro_annual`,
          cancel_url: `${getBaseUrl()}/app?tab=developers&payment=cancelled`,
          client_reference_id: userId,
          subscription_data: {
            metadata: {
              userId,
              planType: 'api_pro',
              billingPeriod: 'annual'
            }
          },
          metadata: {
            userId,
            planType: 'api_pro',
            billingPeriod: 'annual'
          }
        });

        logger?.info('✅ [ApiBilling] Created API Pro annual checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/developer/billing/create-enterprise-monthly",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, email } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = API_PRICE_IDS.enterpriseMonthly;
        if (!priceId) {
          logger?.error('❌ [ApiBilling] API_ENTERPRISE_MONTHLY_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const customerId = await apiBillingService.getOrCreateStripeCustomer(userId, email);

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${getBaseUrl()}/app?tab=developers&payment=success&plan=api_enterprise`,
          cancel_url: `${getBaseUrl()}/app?tab=developers&payment=cancelled`,
          client_reference_id: userId,
          subscription_data: {
            metadata: {
              userId,
              planType: 'api_enterprise',
              billingPeriod: 'monthly'
            }
          },
          metadata: {
            userId,
            planType: 'api_enterprise',
            billingPeriod: 'monthly'
          }
        });

        logger?.info('✅ [ApiBilling] Created API Enterprise monthly checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/developer/billing/create-enterprise-annual",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId, email } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const priceId = API_PRICE_IDS.enterpriseAnnual;
        if (!priceId) {
          logger?.error('❌ [ApiBilling] API_ENTERPRISE_ANNUAL_PRICE_ID not configured');
          return c.json({ error: 'Payment configuration missing' }, 500);
        }

        const customerId = await apiBillingService.getOrCreateStripeCustomer(userId, email);

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: priceId,
            quantity: 1
          }],
          success_url: `${getBaseUrl()}/app?tab=developers&payment=success&plan=api_enterprise_annual`,
          cancel_url: `${getBaseUrl()}/app?tab=developers&payment=cancelled`,
          client_reference_id: userId,
          subscription_data: {
            metadata: {
              userId,
              planType: 'api_enterprise',
              billingPeriod: 'annual'
            }
          },
          metadata: {
            userId,
            planType: 'api_enterprise',
            billingPeriod: 'annual'
          }
        });

        logger?.info('✅ [ApiBilling] Created API Enterprise annual checkout session', { sessionId: session.id, userId });
        return c.json({ success: true, url: session.url });
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Create session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/developer/billing/status",
    method: "GET" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const userId = c.req.query('userId');
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const subscription = await apiBillingService.getUserApiSubscription(userId);
        
        if (!subscription) {
          return c.json({
            tier: 'free',
            status: 'active',
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          });
        }

        logger?.info('✅ [ApiBilling] Retrieved subscription status', { userId, tier: subscription.tier });
        return c.json(subscription);
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Get status error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/developer/billing/portal",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const { userId } = await c.req.json();
        
        if (!userId) {
          return c.json({ error: 'User ID required' }, 400);
        }

        const customerId = await apiBillingService.getOrCreateStripeCustomer(userId);

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${getBaseUrl()}/app?tab=developers`,
        });

        logger?.info('✅ [ApiBilling] Created billing portal session', { userId });
        return c.json({ success: true, url: portalSession.url });
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Create portal session error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  },

  {
    path: "/api/developer/billing/webhook",
    method: "POST" as const,
    createHandler: async ({ mastra }: any) => async (c: any) => {
      const logger = mastra.getLogger();
      try {
        const body = await c.req.text();
        const sig = c.req.header('stripe-signature');
        const webhookSecret = process.env.API_BILLING_WEBHOOK_SECRET;

        if (!webhookSecret) {
          logger?.error('❌ [ApiBilling] API_BILLING_WEBHOOK_SECRET not configured - rejecting webhook');
          return c.json({ error: 'Webhook configuration missing' }, 500);
        }

        if (!sig) {
          logger?.error('❌ [ApiBilling] Missing Stripe-Signature header');
          return c.json({ error: 'Missing signature header' }, 400);
        }

        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } catch (err: any) {
          logger?.error('❌ [ApiBilling] Webhook signature verification failed', { error: err.message });
          return c.json({ error: 'Webhook signature verification failed' }, 400);
        }

        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata || {};
            
            if (metadata.planType?.startsWith('api_')) {
              if (session.subscription) {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                await apiBillingService.handleSubscriptionCreated(subscription);
              }
              logger?.info('✅ [ApiBilling] Checkout completed', { 
                sessionId: session.id, 
                userId: metadata.userId,
                planType: metadata.planType
              });
            }
            break;
          }
          case 'customer.subscription.created': {
            const subscription = event.data.object as Stripe.Subscription;
            const metadata = subscription.metadata || {};
            
            if (metadata.planType?.startsWith('api_')) {
              await apiBillingService.handleSubscriptionCreated(subscription);
              logger?.info('✅ [ApiBilling] Subscription created', { subscriptionId: subscription.id });
            }
            break;
          }
          case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            const metadata = subscription.metadata || {};
            
            if (metadata.planType?.startsWith('api_')) {
              await apiBillingService.handleSubscriptionUpdated(subscription);
              logger?.info('📝 [ApiBilling] Subscription updated', { subscriptionId: subscription.id });
            }
            break;
          }
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const metadata = subscription.metadata || {};
            
            if (metadata.planType?.startsWith('api_')) {
              await apiBillingService.handleSubscriptionDeleted(subscription);
              logger?.info('❌ [ApiBilling] Subscription deleted', { subscriptionId: subscription.id });
            }
            break;
          }
          default:
            logger?.debug(`[ApiBilling] Unhandled event type: ${event.type}`);
        }

        return c.json({ received: true });
      } catch (error: any) {
        logger?.error('❌ [ApiBilling] Webhook error', { error: error.message });
        return c.json({ error: error.message }, 500);
      }
    }
  }
];
