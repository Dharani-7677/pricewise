require('dotenv').config();
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { scrapeUrl } = require('./scraper');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runPriceCheckNow() {
  console.log('[Cron] Starting price check...');
  console.log('[Cron] Supabase URL:', process.env.SUPABASE_URL);
  console.log('[Cron] Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('[Cron] Failed to fetch products:', error.message);
    return;
  }

  console.log(`[Cron] Found ${products.length} products to check`);

  for (const product of products) {
    try {
      const scraped = await scrapeUrl(product.url);
      const newPrice = scraped.price;

      if (!newPrice) {
        console.log(`[Cron] No price found for: ${product.name}`);
        continue;
      }

      // 1. Update current_price in products table
      const { error: updateError } = await supabase
        .from('products')
        .update({ current_price: newPrice })
        .eq('id', product.id);

      if (updateError) {
        console.error(`[Cron] Update failed:`, updateError.message);
      }

      // 2. Insert into price_history table
      const { data: insertData, error: historyError } = await supabase
        .from('price_history')
        .insert({
          product_id: product.id,
          price: newPrice,
          checked_at: new Date().toISOString()
        })
        .select();

      if (historyError) {
        console.error(`[Cron] ❌ Insert FAILED for "${product.name}":`, JSON.stringify(historyError));
      } else {
        console.log(`[Cron] ✅ "${product.name}" → ₹${newPrice} | DB:`, JSON.stringify(insertData));
      }

    } catch (err) {
      console.error(`[Cron] Error scraping ${product.url}:`, err.message);
    }
  }

  console.log('[Cron] Price check complete!');
}

// Run every 6 hours
cron.schedule('0 */6 * * *', runPriceCheckNow);

module.exports = { runPriceCheckNow };