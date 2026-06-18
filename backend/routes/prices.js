const express = require('express');
const router = express.Router();
const supabase = require('../models/supabase');

// 1. GET PRICE HISTORY for a specific product
router.get('/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const { data, error } = await supabase
            .from('price_history')
            .select('*')
            .eq('product_id', productId)
            .order('checked_at', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ADD PRICE ENTRY (Usually called by Cron/Scraper)
router.post('/', async (req, res) => {
    const { product_id, price, discount_percent } = req.body;
    try {
        const { data, error } = await supabase
            .from('price_history')
            .insert([{ product_id, price, discount_percent, checked_at: new Date() }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;