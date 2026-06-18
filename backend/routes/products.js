const express = require('express');
const router = express.Router();
const supabase = require('../models/supabase');
const { scrapePrice } = require('../services/scraper');

// 1. GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 1b. GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Product not found" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ADD PRODUCT
router.post('/', async (req, res) => {
    const { url, name, platform, current_price, original_price, image_url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        let productName = name;
        let productPrice = current_price;
        let productImage = image_url;

        if (!productName || !productPrice) {
            try {
                const scrapedData = await scrapePrice(url);
                if (scrapedData && scrapedData.name) {
                    productName = productName || scrapedData.name;
                    productPrice = productPrice || parseFloat(scrapedData.price) || 0;
                    productImage = productImage || scrapedData.image_url;
                }
            } catch (scrapeErr) {
                console.log('[Products] Scraping failed:', scrapeErr.message);
            }
        }

        if (!productName || !productPrice) {
            return res.status(400).json({
                error: "Could not auto-detect product details. Please enter name and price manually.",
                needs_manual_entry: true
            });
        }

        const detectedPlatform = platform || (
            url.includes('amazon') ? 'amazon' :
            url.includes('flipkart') ? 'flipkart' :
            url.includes('meesho') ? 'meesho' : 'other'
        );

        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    name: productName,
                    url: url,
                    current_price: parseFloat(productPrice) || 0,
                    original_price: parseFloat(original_price) || parseFloat(productPrice) || 0,
                    image_url: productImage || 'https://via.placeholder.com/150',
                    platform: detectedPlatform
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET AI DEAL ANALYSIS for a specific product
// IMPORTANT: Place this BEFORE /:id delete route
router.get('/:id/analysis', async (req, res) => {
    const { id } = req.params;
    try {
        const { analyzeDeal } = require('../services/aiService');

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (productError) throw productError;
        if (!product) return res.status(404).json({ error: "Product not found" });

        const { data: priceHistory, error: historyError } = await supabase
            .from('price_history')
            .select('*')
            .eq('product_id', id)
            .order('checked_at', { ascending: true });

        if (historyError) throw historyError;

        const analysis = analyzeDeal(product, priceHistory || []);
        res.status(200).json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE PRODUCT
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. UPDATE PRODUCT PRICE (manual update, simulates a price check)
router.put('/:id/price', async (req, res) => {
    const { id } = req.params;
    const { new_price } = req.body;

    if (new_price === undefined || new_price === null) {
        return res.status(400).json({ error: "new_price is required" });
    }

    try {
        const { sendPriceDropEmail } = require('../services/emailService');

        // Get current product
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (productError) throw productError;
        if (!product) return res.status(404).json({ error: "Product not found" });

        const oldPrice = parseFloat(product.current_price);
        const newPrice = parseFloat(new_price);
        const discountPercent = product.original_price > 0
            ? Math.round(((product.original_price - newPrice) / product.original_price) * 100)
            : 0;

        // Insert into price_history
        await supabase.from('price_history').insert([{
            product_id: id,
            price: newPrice,
            discount_percent: discountPercent,
            checked_at: new Date()
        }]);

        // Update the product's current_price
        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update({ current_price: newPrice })
            .eq('id', id)
            .select();

        if (updateError) throw updateError;

        let emailsSent = 0;

        // If price dropped, check alerts and send emails
        if (newPrice < oldPrice) {
            const { data: alerts } = await supabase
                .from('alerts')
                .select('*')
                .eq('product_id', id)
                .eq('is_triggered', false)
                .gte('target_price', newPrice);

            if (alerts && alerts.length > 0) {
                for (const alertItem of alerts) {
                    await sendPriceDropEmail(
                        alertItem.user_email,
                        product.name,
                        alertItem.target_price,
                        newPrice,
                        product.url
                    );
                    await supabase.from('alerts').update({ is_triggered: true }).eq('id', alertItem.id);
                    emailsSent++;
                }
            }
        }

        res.status(200).json({
            product: updatedProduct[0],
            old_price: oldPrice,
            new_price: newPrice,
            emails_sent: emailsSent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;