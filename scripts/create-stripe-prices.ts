import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

async function createStripePrices() {
  console.log('🔧 Creating Stripe products and prices for StrikeAgent...\n');

  try {
    // Check if products already exist
    const existingProducts = await stripe.products.list({ limit: 100 });
    const rmMonthlyProduct = existingProducts.data.find(p => p.name === 'RM+ Monthly');
    const rmAnnualProduct = existingProducts.data.find(p => p.name === 'RM+ Annual');
    const legacyFounderProduct = existingProducts.data.find(p => p.name === 'Legacy Founder Access');

    let monthlyPriceId: string;
    let annualPriceId: string;
    let legacyFounderPriceId: string;

    // Create RM+ Monthly Product
    if (rmMonthlyProduct) {
      console.log('✅ RM+ Monthly product already exists:', rmMonthlyProduct.id);
      // Get existing price
      const prices = await stripe.prices.list({ product: rmMonthlyProduct.id, active: true });
      const monthlyPrice = prices.data.find(p => p.unit_amount === 800 && p.recurring?.interval === 'month');
      if (monthlyPrice) {
        monthlyPriceId = monthlyPrice.id;
        console.log('   Price ID:', monthlyPriceId);
      } else {
        const newPrice = await stripe.prices.create({
          product: rmMonthlyProduct.id,
          unit_amount: 800, // $8.00
          currency: 'usd',
          recurring: { interval: 'month' },
        });
        monthlyPriceId = newPrice.id;
        console.log('   Created new price:', monthlyPriceId);
      }
    } else {
      const product = await stripe.products.create({
        name: 'RM+ Monthly',
        description: 'Full access to Pulse + StrikeAgent Live trading. Includes 3-day free trial.',
        metadata: { tier: 'rm_plus', billing: 'monthly' },
      });
      console.log('✅ Created RM+ Monthly product:', product.id);

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 800, // $8.00
        currency: 'usd',
        recurring: { interval: 'month' },
      });
      monthlyPriceId = price.id;
      console.log('   Price ID:', monthlyPriceId);
    }

    // Create RM+ Annual Product
    if (rmAnnualProduct) {
      console.log('✅ RM+ Annual product already exists:', rmAnnualProduct.id);
      const prices = await stripe.prices.list({ product: rmAnnualProduct.id, active: true });
      const annualPrice = prices.data.find(p => p.unit_amount === 8000 && p.recurring?.interval === 'year');
      if (annualPrice) {
        annualPriceId = annualPrice.id;
        console.log('   Price ID:', annualPriceId);
      } else {
        const newPrice = await stripe.prices.create({
          product: rmAnnualProduct.id,
          unit_amount: 8000, // $80.00
          currency: 'usd',
          recurring: { interval: 'year' },
        });
        annualPriceId = newPrice.id;
        console.log('   Created new price:', annualPriceId);
      }
    } else {
      const product = await stripe.products.create({
        name: 'RM+ Annual',
        description: 'Full access to Pulse + StrikeAgent Live trading. Save $16/year! Includes 3-day free trial.',
        metadata: { tier: 'rm_plus', billing: 'annual' },
      });
      console.log('✅ Created RM+ Annual product:', product.id);

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 8000, // $80.00
        currency: 'usd',
        recurring: { interval: 'year' },
      });
      annualPriceId = price.id;
      console.log('   Price ID:', annualPriceId);
    }

    // Create Legacy Founder Product (one-time)
    if (legacyFounderProduct) {
      console.log('✅ Legacy Founder product already exists:', legacyFounderProduct.id);
      const prices = await stripe.prices.list({ product: legacyFounderProduct.id, active: true });
      const founderPrice = prices.data.find(p => p.unit_amount === 2400 && !p.recurring);
      if (founderPrice) {
        legacyFounderPriceId = founderPrice.id;
        console.log('   Price ID:', legacyFounderPriceId);
      } else {
        const newPrice = await stripe.prices.create({
          product: legacyFounderProduct.id,
          unit_amount: 2400, // $24.00
          currency: 'usd',
        });
        legacyFounderPriceId = newPrice.id;
        console.log('   Created new price:', legacyFounderPriceId);
      }
    } else {
      const product = await stripe.products.create({
        name: 'Legacy Founder Access',
        description: '6-month access + 35,000 DWAV tokens. One-time payment.',
        metadata: { tier: 'legacy_founder', billing: 'one_time' },
      });
      console.log('✅ Created Legacy Founder product:', product.id);

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 2400, // $24.00
        currency: 'usd',
      });
      legacyFounderPriceId = price.id;
      console.log('   Price ID:', legacyFounderPriceId);
    }

    console.log('\n📋 ENVIRONMENT VARIABLES TO SET:\n');
    console.log(`BASE_PRICE_ID=${monthlyPriceId}`);
    console.log(`STRIPE_BASE_MONTHLY_PRICE=${monthlyPriceId}`);
    console.log(`ANNUAL_SUBSCRIPTION_PRICE_ID=${annualPriceId}`);
    console.log(`STRIPE_ANNUAL_PRICE=${annualPriceId}`);
    console.log(`LEGACY_FOUNDER_6MONTH_PRICE_ID=${legacyFounderPriceId}`);
    console.log(`STRIPE_LEGACY_FOUNDER_PRICE=${legacyFounderPriceId}`);

    console.log('\n✅ Stripe products and prices created successfully!');
    
    return {
      monthlyPriceId,
      annualPriceId,
      legacyFounderPriceId,
    };
  } catch (error: any) {
    console.error('❌ Error creating Stripe prices:', error.message);
    throw error;
  }
}

createStripePrices();
