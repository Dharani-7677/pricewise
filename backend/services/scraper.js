const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes price details from a given URL using ScraperAPI.
 * Supports Amazon, Flipkart, and Meesho.
 */
async function scrapePrice(url) {
    try {
        if (!process.env.SCRAPERAPI_KEY) {
            throw new Error("SCRAPERAPI_KEY is missing in .env");
        }

        console.log('Fetching URL:', url);
        
        // Use ScraperAPI: fetch with render=true for dynamic content
        let scraperApiUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPERAPI_KEY}&url=${encodeURIComponent(url)}&render=true`;
        
        // Use premium proxies and India IP for Meesho to avoid 500 errors
        if (url.includes('meesho')) {
            scraperApiUrl += '&premium=true&country_code=in';
        }
        
        const response = await axios.get(scraperApiUrl, { timeout: 60000 });
        const html = response.data;
        
        console.log('HTML length:', html.length);
        console.log('HTML snippet:', html.substring(0, 500));

        const $ = cheerio.load(html);

        let name = "";
        let price = 0;
        let original_price = 0;
        let image_url = "";
        let platform = "other";

        if (url.includes('amazon')) platform = "amazon";
        else if (url.includes('flipkart')) platform = "flipkart";
        else if (url.includes('meesho')) platform = "meesho";

        console.log('[Scraper] Platform detected:', platform);

        // 1. Amazon Logic
        if (platform === "amazon") {
            name = $('#productTitle').text().trim() || $('#title').text().trim() || "Amazon Product";
            
            const amazonSelectors = [
                { name: '.priceToPay span.a-price-whole', selector: '.priceToPay span.a-price-whole' },
                { name: '#corePriceDisplay_desktop_feature_div .a-price-whole', selector: '#corePriceDisplay_desktop_feature_div .a-price-whole' },
                { name: '.reinventPricePriceToPayMargin .a-price-whole', selector: '.reinventPricePriceToPayMargin .a-price-whole' },
                { name: '#price_inside_buybox', selector: '#price_inside_buybox' },
                { name: '#newBuyBoxPrice', selector: '#newBuyBoxPrice' },
                { name: '.a-price.priceToPay .a-price-whole', selector: '.a-price.priceToPay .a-price-whole' }
            ];

            for (const item of amazonSelectors) {
                const el = $(item.selector).first();
                const rawText = el.text().trim();
                console.log('[Scraper] Trying selector:', item.name, 'Raw:', rawText);
                
                if (rawText) {
                    const parsedPrice = parseFloat(rawText.replace(/[₹, \n\s]/g, ""));
                    console.log('[Scraper] Parsed price:', parsedPrice);
                    
                    if (!isNaN(parsedPrice) && parsedPrice > 0) {
                        price = parsedPrice;
                        break;
                    }
                }
            }
            
            const strikePrice = $('.a-text-strike').first().text().trim() || 
                               $('#priceblock_listprice').text().trim() ||
                               $('.basisPrice .a-offscreen').first().text().trim();
            original_price = parseFloat(strikePrice.replace(/[₹, \n\s]/g, "")) || price;
            
            image_url = $('#landingImage').attr('src') || $('.a-dynamic-image').first().attr('src');

        // 2. Flipkart Logic
        } else if (platform === "flipkart") {
            name = $('.B_NuCI').text().trim() || $('h1').first().text().trim() || "Flipkart Product";
            
            const flipkartSelectors = [
                { name: 'div._30jeq3', selector: 'div._30jeq3' },
                { name: 'div._16Jk6d', selector: 'div._16Jk6d' },
                { name: 'div.Nx9bqj', selector: 'div.Nx9bqj' },
                { name: 'div.CEmiEU div._30jeq3', selector: 'div.CEmiEU div._30jeq3' },
                { name: 'div._25b18 ._30jeq3', selector: 'div._25b18 ._30jeq3' }
            ];

            for (const item of flipkartSelectors) {
                const el = $(item.selector).first();
                const rawText = el.text().trim();
                console.log('[Scraper] Trying selector:', item.name, 'Raw:', rawText);
                
                if (rawText) {
                    const parsedPrice = parseFloat(rawText.replace(/[₹, \n\s]/g, ""));
                    console.log('[Scraper] Parsed price:', parsedPrice);
                    
                    if (!isNaN(parsedPrice) && parsedPrice > 0) {
                        price = parsedPrice;
                        break;
                    }
                }
            }

            // Fallback for Flipkart: look for ₹ symbol
            if (!price) {
                console.log('[Scraper] Trying Flipkart fallback (search for ₹ symbol)');
                $('div').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.startsWith('₹') && text.length < 15) {
                        const parsed = parseFloat(text.replace(/[₹, \n\s]/g, ""));
                        if (!isNaN(parsed) && parsed > 0 && !price) {
                            console.log('[Scraper] Fallback matched:', text, 'Parsed:', parsed);
                            price = parsed;
                        }
                    }
                });
            }
            
            const strikePrice = $('._3I9_wc').first().text().trim();
            original_price = parseFloat(strikePrice.replace(/[₹, \n\s]/g, "")) || price;
            
            image_url = $('img._396cs4').first().attr('src') || $('img.DByuf4').first().attr('src') || $('img').first().attr('src');

        // 3. Meesho Logic
        } else if (platform === "meesho") {
            name = $('.sc-dkzDju').text().trim() || $('h4').first().text().trim() || "Meesho Product";
            
            const meeshoSelectors = [
                { name: 'h4.pdp-price', selector: 'h4.pdp-price' },
                { name: 'span.pdp-price', selector: 'span.pdp-price' },
                { name: 'div[class*="price"] h4', selector: 'div[class*="price"] h4' },
                { name: 'div[class*="Price"] span', selector: 'div[class*="Price"] span' }
            ];

            for (const item of meeshoSelectors) {
                const el = $(item.selector).first();
                const rawText = el.text().trim();
                console.log('[Scraper] Trying selector:', item.name, 'Raw:', rawText);
                
                if (rawText) {
                    const parsedPrice = parseFloat(rawText.replace(/[₹, \n\s]/g, ""));
                    console.log('[Scraper] Parsed price:', parsedPrice);
                    
                    if (!isNaN(parsedPrice) && parsedPrice > 0) {
                        price = parsedPrice;
                        break;
                    }
                }
            }

            // Fallback for Meesho: look for ₹ symbol in product detail section
            if (!price) {
                console.log('[Scraper] Trying Meesho fallback (search for ₹ symbol)');
                $('h4, span, div').each((i, el) => {
                    const text = $(el).text().trim();
                    if (text.includes('₹') && text.length < 15) {
                        const parsed = parseFloat(text.replace(/[₹, \n\s]/g, ""));
                        if (!isNaN(parsed) && parsed > 0 && !price) {
                            console.log('[Scraper] Fallback matched:', text, 'Parsed:', parsed);
                            price = parsed;
                        }
                    }
                });
            }
            
            original_price = price; 
            
            image_url = $('img[class*="ProductImage"]').first().attr('src') || $('img[class*="product"]').first().attr('src') || $('img').first().attr('src');
            
        } else {
            // Generic fallback for other sites
            name = $('h1').first().text().trim() || "Product";
            const priceString = $('div:contains("₹")').first().text().trim() || "0";
            console.log('[Scraper] Generic fallback Raw:', priceString);
            price = parseFloat(priceString.replace(/[₹, \n\s]/g, "")) || 0;
            console.log('[Scraper] Parsed price:', price);
            original_price = price;
            image_url = $('img').first().attr('src') || "";
        }

        if (!price) {
            console.log('[Scraper] Price detection FAILED. HTML sample:', $.html().substring(0, 1000));
            throw new Error(`Could not extract price from ${url}. Page structure might have changed.`);
        }

        console.log(`[Scraper] Successfully scraped: ${name.substring(0, 30)}...`);
        console.log(`[Scraper] Price: ₹${price} | Original: ₹${original_price}`);

        return {
            name,
            price,
            original_price,
            image_url
        };

    } catch (error) {
        console.error(`[Scraper] Error scraping ${url}:`, error.message);
        throw new Error(`Scraping failed: ${error.message}`);
    }
}

module.exports = { scrapePrice };
