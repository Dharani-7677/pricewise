const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes product details from a given URL.
 * Supports Amazon out of the box with generic fallbacks.
 */
async function scrapeProduct(url) {
    try {
        console.log(`[Scraper] Fetching URL: ${url}`);
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Device-Memory": "8",
                "Service-Worker-Navigation-Preload": "true",
                "Viewport-Width": "1920",
                "Referer": "https://www.google.com/",
            },
            timeout: 15000
        });

        const data = response.data;
        console.log(`[Scraper] Response status: ${response.status}`);
        
        const $ = cheerio.load(data);

        // Debug: Check for bot detection
        if (data.includes("api-services@amazon.com") || data.includes("captcha")) {
            console.error("[Scraper] Amazon BOT/CAPTCHA detection triggered!");
            return { name: "Bot Detection", price: "0", image_url: "", platform: "Amazon" };
        }

        const name = $('#productTitle').text().trim() || 
                     $('#title').text().trim() ||
                     $('h1').first().text().trim() || 
                     "Unknown Product";

        let priceString = $('.a-price .a-offscreen').first().text().trim() || 
                          $('.a-price-whole').first().text().trim() ||
                          $('#priceblock_ourprice').text().trim() ||
                          $('#priceblock_dealprice').text().trim() ||
                          $('.priceToPay').first().text().trim() ||
                          $('#price_inside_buybox').text().trim();

        const cleanPrice = priceString.replace(/[^0-9.]/g, "");

        const image_url = $('#landingImage').attr('src') || 
                          $('#imgBlkFront').attr('src') || 
                          $('.a-dynamic-image').first().attr('src') ||
                          $('#main-image').attr('src');

        console.log(`[Scraper] Scraped Name: ${name}`);
        console.log(`[Scraper] Scraped Price String: ${priceString}`);
        console.log(`[Scraper] Cleaned Price: ${cleanPrice}`);

        return {
            name,
            price: cleanPrice || "0",
            image_url: image_url || "",
            platform: url.includes('amazon') ? 'Amazon' : 'Other'
        };

    } catch (error) {
        console.error(`[Scraper] Error for ${url}:`, error.message);
        if (error.response) {
            console.error(`[Scraper] Response status: ${error.response.status}`);
            // If 404, maybe it's actually a block page?
            if (error.response.status === 404) {
                console.log("[Scraper] 404 received. Amazon might be blocking us.");
            }
        }
        return null;
    }
}

module.exports = { scrapeProduct };