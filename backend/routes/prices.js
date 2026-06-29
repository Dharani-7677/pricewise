const express = require('express');
const router = express.Router();

// Use shared supabase from server.js via app.locals OR create fresh
const { createClient } = require('@supabase/supabase-js');

let supabase;
try {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials');
  supabase = createClient(url, key);
} catch (e) {
  console.error('Supabase init error in prices.js:', e.message);
}

// GET /api/prices/:productId
router.get('/:productId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { productId } = req.params;
    const { limit = 200 } = req.query;

    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', productId)
      .order('checked_at', { ascending: true })
      .limit(parseInt(limit));

    if (error) {
      console.error('Price history error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/prices/:productId
router.post('/:productId', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { productId } = req.params;
    const { price } = req.body;

    if (!price) return res.status(400).json({ error: 'Price is required' });

    const { data, error } = await supabase
      .from('price_history')
      .insert([{
        product_id: productId,
        price: parseFloat(price),
        checked_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert price error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;