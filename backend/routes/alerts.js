const express = require('express');
const router = express.Router();
const supabase = require('../models/supabase');

// 1. GET ALL ALERTS for a user (or specific product)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*, products(name, current_price)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. CREATE A NEW ALERT
router.post('/', async (req, res) => {
    const { product_id, user_email, target_price } = req.body;
    try {
        const { data, error } = await supabase
            .from('alerts')
            .insert([{ product_id, user_email, target_price, is_triggered: false }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. DELETE AN ALERT
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('alerts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: "Alert removed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;