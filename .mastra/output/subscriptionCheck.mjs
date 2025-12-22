async function checkSubscriptionLimit(userId, feature, sessionToken) {
  try {
    console.log(`\u{1F513} [SubscriptionCheck] LIMITS DISABLED FOR TESTING - User ${userId} granted unlimited access`);
    return { allowed: true, isPremium: true, isWhitelisted: true };
  } catch (error) {
    console.error("Subscription check error:", error);
    return {
      allowed: false,
      isPremium: false,
      message: "Unable to verify subscription status. Please try again."
    };
  }
}

export { checkSubscriptionLimit };
//# sourceMappingURL=subscriptionCheck.mjs.map
