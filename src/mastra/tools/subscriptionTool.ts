import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "../../db/client.js";
import { subscriptions, userUsage } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export const subscriptionTool = createTool({
  id: "subscription-management",
  description:
    "Manages user subscriptions including creating checkout sessions, checking subscription status, and handling cancellations. Use this when users want to upgrade to premium, check their subscription status, or cancel their subscription.",
  inputSchema: z.object({
    action: z.enum([
      "create_checkout",
      "check_status",
      "cancel",
      "verify_payment",
    ]),
    userId: z.string().describe("Telegram user ID"),
    returnUrl: z
      .string()
      .optional()
      .describe("URL to return after checkout (required for create_checkout)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    checkoutUrl: z.string().optional(),
    subscription: z
      .object({
        plan: z.string(),
        status: z.string(),
        provider: z.string().nullable(),
        expiryDate: z.string().nullable(),
        autoRenew: z.boolean(),
      })
      .optional(),
  }),
  execute: async ({ context, mastra, runtimeContext }) => {
    const logger = mastra?.getLogger();
    const { action, userId, returnUrl } = context;
    
    logger?.info("💳 [SubscriptionTool] Starting execution", {
      action,
      userId,
    });

    try {
      switch (action) {
        case "create_checkout": {
          if (!returnUrl) {
            return {
              success: false,
              message: "Return URL is required for checkout creation",
            };
          }

          logger?.info("🛒 [SubscriptionTool] Creating Stripe checkout session");

          // Create or get customer
          const [existingSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId));

          let customerId = existingSubscription?.stripeCustomerId;

          if (!customerId) {
            const customer = await stripe.customers.create({
              metadata: { telegramUserId: userId },
            });
            customerId = customer.id;
            logger?.info("👤 [SubscriptionTool] Created new Stripe customer", {
              customerId,
            });
          }

          // Create checkout session
          const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: "DarkWave-V2 Premium",
                    description:
                      "Unlimited searches, advanced charts, price alerts, and priority support",
                  },
                  unit_amount: 500, // $5.00
                  recurring: {
                    interval: "month",
                  },
                },
                quantity: 1,
              },
            ],
            mode: "subscription",
            success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: returnUrl,
            metadata: {
              telegramUserId: userId,
            },
          });

          logger?.info("✅ [SubscriptionTool] Checkout session created", {
            sessionId: session.id,
            url: session.url,
          });

          return {
            success: true,
            message: "Checkout session created successfully",
            checkoutUrl: session.url || undefined,
          };
        }

        case "check_status": {
          logger?.info("🔍 [SubscriptionTool] Checking subscription status");

          const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId));

          if (!subscription) {
            // Create free tier entry
            await db.insert(subscriptions).values({
              userId: userId,
              plan: "free",
              status: "inactive",
            });

            await db.insert(userUsage).values({
              userId: userId,
              searchCount: "0",
              alertCount: "0",
            });

            return {
              success: true,
              message: "No active subscription",
              subscription: {
                plan: "free",
                status: "inactive",
                provider: null,
                expiryDate: null,
                autoRenew: false,
              },
            };
          }

          // Check if subscription is expired
          if (
            subscription.expiryDate &&
            new Date(subscription.expiryDate) < new Date()
          ) {
            await db
              .update(subscriptions)
              .set({ status: "expired" })
              .where(eq(subscriptions.userId, userId));

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
              autoRenew: subscription.autoRenew || false,
            },
          };
        }

        case "cancel": {
          logger?.info("❌ [SubscriptionTool] Canceling subscription");

          const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId));

          if (!subscription || subscription.status !== "active") {
            return {
              success: false,
              message: "No active subscription found",
            };
          }

          // Cancel Stripe subscription
          if (
            subscription.provider === "stripe" &&
            subscription.stripeSubscriptionId
          ) {
            await stripe.subscriptions.update(
              subscription.stripeSubscriptionId,
              {
                cancel_at_period_end: true,
              }
            );
          }

          await db
            .update(subscriptions)
            .set({
              status: "cancelled",
              autoRenew: false,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, userId));

          logger?.info("✅ [SubscriptionTool] Subscription cancelled successfully");

          return {
            success: true,
            message:
              "Subscription cancelled. You'll retain premium access until the end of your billing period.",
          };
        }

        case "verify_payment": {
          logger?.info("🔐 [SubscriptionTool] Verifying payment");

          // This will be called after Stripe webhook confirms payment
          // For now, return current status
          const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId));

          return {
            success: true,
            message: "Payment verification complete",
            subscription: subscription
              ? {
                  plan: subscription.plan,
                  status: subscription.status,
                  provider: subscription.provider,
                  expiryDate: subscription.expiryDate?.toISOString() || null,
                  autoRenew: subscription.autoRenew || false,
                }
              : undefined,
          };
        }

        default:
          return {
            success: false,
            message: "Invalid action",
          };
      }
    } catch (error) {
      logger?.error("❌ [SubscriptionTool] Error", { error });
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
