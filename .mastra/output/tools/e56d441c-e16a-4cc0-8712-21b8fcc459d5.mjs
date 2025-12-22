import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import Stripe from 'stripe';
import { d as db, s as subscriptions, u as userUsage } from '../client.mjs';
import { eq } from 'drizzle-orm';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const subscriptionTool = createTool({
  id: "subscription-management",
  description: "Manages user subscriptions including creating checkout sessions, checking subscription status, and handling cancellations. Use this when users want to upgrade to premium, check their subscription status, or cancel their subscription.",
  inputSchema: z.object({
    action: z.enum([
      "create_checkout",
      "check_status",
      "cancel",
      "verify_payment"
    ]),
    userId: z.string().describe("Telegram user ID"),
    plan: z.enum(["basic", "premium"]).optional().describe("Subscription plan: basic ($2/mo, 20 searches/day) or premium ($5/mo, unlimited). Defaults to premium"),
    returnUrl: z.string().optional().describe("URL to return after checkout (required for create_checkout)")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    checkoutUrl: z.string().optional(),
    subscription: z.object({
      plan: z.string(),
      status: z.string(),
      provider: z.string().nullable(),
      expiryDate: z.string().nullable(),
      autoRenew: z.boolean()
    }).optional()
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, userId, plan = "premium", returnUrl } = context;
    logger?.info("\u{1F4B3} [SubscriptionTool] Starting execution", {
      action,
      userId
    });
    try {
      switch (action) {
        case "create_checkout": {
          if (!returnUrl) {
            return {
              success: false,
              message: "Return URL is required for checkout creation"
            };
          }
          logger?.info("\u{1F6D2} [SubscriptionTool] Creating Stripe checkout session");
          const [existingSubscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
          let customerId = existingSubscription?.stripeCustomerId;
          if (!customerId) {
            const customer = await stripe.customers.create({
              metadata: { telegramUserId: userId }
            });
            customerId = customer.id;
            logger?.info("\u{1F464} [SubscriptionTool] Created new Stripe customer", {
              customerId
            });
          }
          const planConfig = {
            basic: {
              name: "DarkWave-V2 Basic",
              description: "20 searches/day, advanced charts, price alerts",
              amount: 200
              // $2.00
            },
            premium: {
              name: "DarkWave-V2 Premium",
              description: "Unlimited searches, advanced charts, price alerts, and priority support",
              amount: 500
              // $5.00
            }
          };
          const selectedPlan = planConfig[plan];
          const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: selectedPlan.name,
                    description: selectedPlan.description
                  },
                  unit_amount: selectedPlan.amount,
                  recurring: {
                    interval: "month"
                  }
                },
                quantity: 1
              }
            ],
            mode: "subscription",
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: returnUrl,
            metadata: {
              telegramUserId: userId,
              plan
              // Store which plan they selected
            }
          });
          logger?.info("\u2705 [SubscriptionTool] Checkout session created", {
            sessionId: session.id,
            url: session.url
          });
          return {
            success: true,
            message: "Checkout session created successfully",
            checkoutUrl: session.url || void 0
          };
        }
        case "check_status": {
          logger?.info("\u{1F50D} [SubscriptionTool] Checking subscription status");
          const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
          if (!subscription) {
            await db.insert(subscriptions).values({
              userId,
              plan: "free",
              status: "inactive"
            });
            await db.insert(userUsage).values({
              userId,
              searchCount: 0,
              alertCount: 0
            });
            return {
              success: true,
              message: "No active subscription",
              subscription: {
                plan: "free",
                status: "inactive",
                provider: null,
                expiryDate: null,
                autoRenew: false
              }
            };
          }
          if (subscription.expiryDate && new Date(subscription.expiryDate) < /* @__PURE__ */ new Date()) {
            await db.update(subscriptions).set({ status: "expired" }).where(eq(subscriptions.userId, userId));
            subscription.status = "expired";
          }
          return {
            success: true,
            message: "Subscription status retrieved",
            subscription: {
              plan: subscription.plan,
              status: subscription.status,
              provider: subscription.provider,
              expiryDate: subscription.expiryDate?.toISOString() || null,
              autoRenew: subscription.autoRenew || false
            }
          };
        }
        case "cancel": {
          logger?.info("\u274C [SubscriptionTool] Canceling subscription");
          const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
          if (!subscription || subscription.status !== "active") {
            return {
              success: false,
              message: "No active subscription found"
            };
          }
          if (subscription.provider === "stripe" && subscription.stripeSubscriptionId) {
            await stripe.subscriptions.update(
              subscription.stripeSubscriptionId,
              {
                cancel_at_period_end: true
              }
            );
          }
          await db.update(subscriptions).set({
            status: "cancelled",
            autoRenew: false,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(subscriptions.userId, userId));
          logger?.info("\u2705 [SubscriptionTool] Subscription cancelled successfully");
          return {
            success: true,
            message: "Subscription cancelled. You'll retain premium access until the end of your billing period."
          };
        }
        case "verify_payment": {
          logger?.info("\u{1F510} [SubscriptionTool] Verifying payment");
          const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
          return {
            success: true,
            message: "Payment verification complete",
            subscription: subscription ? {
              plan: subscription.plan,
              status: subscription.status,
              provider: subscription.provider,
              expiryDate: subscription.expiryDate?.toISOString() || null,
              autoRenew: subscription.autoRenew || false
            } : void 0
          };
        }
        default:
          return {
            success: false,
            message: "Invalid action"
          };
      }
    } catch (error) {
      logger?.error("\u274C [SubscriptionTool] Error", { error });
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      };
    }
  }
});

export { subscriptionTool };
//# sourceMappingURL=e56d441c-e16a-4cc0-8712-21b8fcc459d5.mjs.map
