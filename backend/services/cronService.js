const cron = require('node-cron');
const supabase = require('../models/supabase');
const { scrapeProduct } = require('./scraper');
const { sendPriceDropEmail } = require('./emailService');

/**
 * Automatically checks all product prices
 */
async function startPriceCheckJob() {
    // Runs every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('[Cron] Starting Price Check Job...');
        
        try {
            // 1. Fetch all products
            const { data: products, error } = await supabase.from('products').select('*');
            if (error) throw error;

            for (const product of products) {
                // 2. Scrape new price
                const scraped = await scrapeProduct(product.url);
                if (!scraped || !scraped.price) continue;

                const newPrice = parseFloat(scraped.price);
                const oldPrice = parseFloat(product.current_price);

                // 3. Update price history if changed
                if (newPrice !== oldPrice) {
                    await supabase.from('price_history').insert([{
                        product_id: product.id,
                        price: newPrice,
                        checked_at: new Date()
                    }]);

                    // 4. Update current price in products table
                    await supabase.from('products').update({ current_price: newPrice }).eq('id', product.id);

                    // 5. Check for alerts
                    if (newPrice < oldPrice) {
                        const { data: alerts } = await supabase
                            .from('alerts')
                            .select('*')
                            .eq('product_id', product.id)
                            .eq('is_triggered', false)
                            .lte('target_price', newPrice);

                        if (alerts && alerts.length > 0) {
                            for (const alert of alerts) {
                                await sendPriceDropEmail(alert.user_email, product.name, oldPrice, newPrice, product.url);
                                // Mark alert as triggered
                                await supabase.from('alerts').update({ is_triggered: true }).eq('id', alert.id);
                            }
                        }
                    }
                }
            }
            console.log('[Cron] Price Check Job Finished.');
        } catch (err) {
            console.error('[Cron] Job Error:', err.message);
        }
    });
}

module.exports = { startPriceCheckJob };