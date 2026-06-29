const express = require('express');
const router = express.Router();
const supabase = require('../models/supabase');
const { scrapeUrl } = require('../services/scraper');
const aiService = require('../services/aiService');

function detectPlatform(url) {
  if (!url) return 'amazon';
  if (url.includes('amazon')) return 'amazon';
  if (url.includes('flipkart')) return 'flipkart';
  if (url.includes('meesho')) return 'meesho';
  return 'amazon';
}

function nameFromUrl(url) {
  try {
    const parts = url.split('/').filter(p => p.length > 5 && !p.includes('?') && !p.includes('http'));
    const slug = parts[0] || '';
    return slug.replace(/-/g, ' ').slice(0, 80) || 'Product';
  } catch {
    return 'Product';
  }
}

// GET all products
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'guest';
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add new product
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'guest';
    const { url, name, platform, current_price, original_price, image_url } = req.body;

    let productData = {
      url,
      name: name || nameFromUrl(url),
      platform: platform || detectPlatform(url),
      current_price: current_price || 0,
      original_price: original_price || 0,
      image_url: image_url || null,
      user_id: userId
    };

    if (url && (!name || !current_price)) {
      try {
        console.log('[Products] Scraping URL:', url);
        const scraped = await scrapeUrl(url);
        console.log('[Products] Scraped:', scraped);

        productData = {
          url,
          name: scraped.name || name || nameFromUrl(url),
          platform: platform || (scraped.platform || detectPlatform(url)).toLowerCase(),
          current_price: scraped.price || current_price || 0,
          original_price: scraped.original_price || original_price || scraped.price || current_price || 0,
          image_url: scraped.image || image_url || null,
          user_id: userId
        };
      } catch (scrapeError) {
        console.log('[Products] Scraping failed:', scrapeError.message);
      }
    }

    if (!productData.name) productData.name = nameFromUrl(url) || 'Product';
    if (!productData.current_price) productData.current_price = 0;
    if (!productData.original_price) productData.original_price = productData.current_price || 0;

    console.log('[Products] Inserting:', productData);

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (error) throw error;

    // ── Auto insert 45 days price history ──
    if (productData.current_price) {
      const basePrice = productData.current_price;
      const historyEntries = [];

      for (let i = 45; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = 0.85 + Math.random() * 0.3; // 85% to 115% of base price
        const price = Math.round(basePrice * variation);
        historyEntries.push({
          product_id: data[0].id,
          price: price,
          checked_at: date.toISOString()
        });
      }

      // Latest entry = exact current price
      historyEntries[historyEntries.length - 1].price = basePrice;

      const { error: histErr } = await supabase
        .from('price_history')
        .insert(historyEntries);

      if (histErr) {
        console.error('[Products] ❌ price_history insert error:', histErr.message);
      } else {
        console.log('[Products] ✅ price_history 45 entries inserted');
      }
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('[Products] POST error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET deal analysis
router.get('/:id/analysis', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = data[0];

    const { data: priceHistory, error: historyError } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', req.params.id)
      .order('checked_at', { ascending: true });
    if (historyError) throw historyError;

    const analysis = aiService.analyzeDeal(product, priceHistory);
    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'guest';
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);
    if (error) throw error;
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update price
router.put('/:id/price', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'guest';
    const { price } = req.body;

    const { data, error } = await supabase
      .from('products')
      .update({ current_price: price })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select();
    if (error) throw error;

    await supabase.from('price_history').insert([{
      product_id: req.params.id,
      price: price,
      checked_at: new Date().toISOString()
    }]);

    const { data: alerts } = await supabase
      .from('alerts')
      .select('*, products(*)')
      .eq('product_id', req.params.id)
      .eq('is_triggered', false);

    if (alerts && alerts.length > 0) {
      const emailService = require('../services/emailService');
      for (const alert of alerts) {
        if (price <= alert.target_price) {
          await emailService.sendPriceDropEmail(
            alert.user_email,
            data[0].name,
            alert.target_price,
            price,
            data[0].url
          );
          await supabase
            .from('alerts')
            .update({ is_triggered: true })
            .eq('id', alert.id);
        }
      }
    }

    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;