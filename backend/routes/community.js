const express = require('express');
const router = express.Router();
const supabase = require('../models/supabase');
const { analyzeDeal } = require('../services/aiService');

// GET TOP DEALS (Community Feed)
router.get('/', async (req, res) => {
    try {
        // Fetch all products
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch price history for all products to calculate better scores
        // For simplicity in this step, we'll calculate scores based on current vs original price
        // but we can try to fetch history if needed.
        
        const deals = products.map(product => {
            const analysis = analyzeDeal(product, []); // Passing empty history for now
            return {
                ...product,
                analysis
            };
        });

        // Sort by discount percentage or score
        const sortedDeals = deals.sort((a, b) => b.analysis.discount_percent - a.analysis.discount_percent);

        res.status(200).json(sortedDeals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;