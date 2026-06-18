const express = require('express');
const router = express.Router();
const supabase = require('../models/supabase');

// GET all community deals (joined with products)
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('community_deals')
            .select('*, products(name, platform, current_price, url)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create a new community deal
router.post('/', async (req, res) => {
    try {
        const { product_id, posted_by, deal_description } = req.body;
        const { data, error } = await supabase
            .from('community_deals')
            .insert([{ product_id, posted_by, deal_description, upvotes: 0 }])
            .select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT upvote a deal
router.put('/:id/upvote', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existing, error: fetchError } = await supabase
            .from('community_deals')
            .select('upvotes')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;
        const { data, error } = await supabase
            .from('community_deals')
            .update({ upvotes: existing.upvotes + 1 })
            .eq('id', id)
            .select();
        if (error) throw error;
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a deal
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('community_deals')
            .delete()
            .eq('id', req.params.id);
        if (error) throw error;
        res.status(200).json({ message: 'Deal deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
