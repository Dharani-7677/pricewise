const express = require('express');
const router = express.Router();
const { scrapeUrl } = require('../services/scraper');

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let sourcePlatform = 'Amazon';
    if (url.includes('flipkart')) sourcePlatform = 'Flipkart';
    else if (url.includes('meesho')) sourcePlatform = 'Meesho';

    const scraped = await scrapeUrl(url);

    const results = [
      {
        platform: sourcePlatform,
        price: scraped.price || null,
        name: scraped.name || 'Product',
        image_url: scraped.image || null,
        url: url,
        isSource: true,
        original_price: scraped.original_price || null
      }
    ];

    const allPlatforms = ['Amazon', 'Flipkart', 'Meesho'];
    for (const platform of allPlatforms) {
      if (platform !== sourcePlatform) {
        results.push({
          platform,
          price: null,
          name: scraped.name || 'Search on ' + platform,
          image_url: null,
          url: null,
          isSource: false,
          original_price: null
        });
      }
    }

    return res.status(200).json({ results });

  } catch (err) {
    console.error('[SmartCompare] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;