const axios = require('axios');
const cheerio = require('cheerio');

const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY;

function buildScraperUrl(targetUrl, options = {}) {
  const params = new URLSearchParams({
    api_key: SCRAPER_API_KEY,
    url: targetUrl,
    ...options
  });
  return `http://api.scraperapi.com?${params.toString()}`;
}

async function scrapeAmazon(url) {
  try {
    const scraperUrl = buildScraperUrl(url, {
      country_code: 'in',
      device_type: 'desktop'
    });

    const response = await axios.get(scraperUrl, { timeout: 30000 });
    const $ = cheerio.load(response.data);

    // Current price selectors
    const priceSelectors = [
      '#corePriceDisplay_desktop_feature_div .a-price-whole',
      '.a-price-whole',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#price_inside_buybox',
      '.priceToPay .a-price-whole'
    ];

    let priceText = null;
    for (const selector of priceSelectors) {
      const el = $(selector).first();
      if (el.length && el.text().trim()) {
        priceText = el.text().trim();
        break;
      }
    }

    const price = priceText
      ? parseFloat(priceText.replace(/[^0-9.]/g, ''))
      : null;

    // Original/MRP price selectors
    const mrpSelectors = [
      '.a-price.a-text-price .a-offscreen',
      'span.a-price.a-text-price span.a-offscreen',
      '#listPrice',
      '.basisPrice .a-offscreen',
      'span[data-a-strike="true"] .a-offscreen',
      '#priceblock_saleprice',
      '.a-text-strike'
    ];

    let originalPriceText = null;
    for (const selector of mrpSelectors) {
      const el = $(selector).first();
      if (el.length && el.text().trim()) {
        originalPriceText = el.text().trim();
        break;
      }
    }

    const original_price = originalPriceText
      ? parseFloat(originalPriceText.replace(/[^0-9.]/g, ''))
      : price; // fallback to current price if no MRP found

    const name = $('#productTitle').text().trim() ||
                 $('h1.product-title-word-break').text().trim() ||
                 null;

    const image = $('#landingImage').attr('src') ||
                  $('#imgBlkFront').attr('src') ||
                  $('img#main-image').attr('src') ||
                  null;

    console.log('Amazon scrape result:', { price, original_price, name: name?.slice(0, 50) });
    return { platform: 'Amazon', price, original_price, name, image, url };
  } catch (err) {
    console.error('Amazon scrape error:', err.message);
    return { platform: 'Amazon', price: null, original_price: null, name: null, image: null, url };
  }
}

async function scrapeFlipkart(url) {
  try {
    const scraperUrl = buildScraperUrl(url, {
      country_code: 'in',
      render: 'false',
      keep_headers: 'true'
    });

    const response = await axios.get(scraperUrl, {
      timeout: 40000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);

    const priceSelectors = [
      'div.Nx9bqj',
      'div._30jeq3._16Jk6d',
      'div._30jeq3',
      'div._25b18c ._30jeq3',
      '._16Jk6d',
      'div[class*="_30jeq3"]',
      'div[class*="Nx9bqj"]'
    ];

    let priceText = null;
    for (const selector of priceSelectors) {
      const el = $(selector).first();
      if (el.length) {
        const text = el.text().trim();
        if (text.includes('₹') || /^\d/.test(text)) {
          priceText = text;
          break;
        }
      }
    }

    const price = priceText
      ? parseFloat(priceText.replace(/[^0-9.]/g, ''))
      : null;

    // Flipkart original price (strikethrough)
    const originalPriceSelectors = [
      'div._3I9_wc',
      'div._3ouqZc',
      'div[class*="_3I9_wc"]',
      'div.yRaY8j'
    ];

    let originalPriceText = null;
    for (const selector of originalPriceSelectors) {
      const el = $(selector).first();
      if (el.length && el.text().trim()) {
        originalPriceText = el.text().trim();
        break;
      }
    }

    const original_price = originalPriceText
      ? parseFloat(originalPriceText.replace(/[^0-9.]/g, ''))
      : price;

    const nameSelectors = [
      'span.B_NuCI',
      'h1._9E25nV span',
      'h1.yhB1nd span',
      'div._35KyD6',
      'h1[class*="yhB1nd"]'
    ];

    let name = null;
    for (const selector of nameSelectors) {
      const el = $(selector).first();
      if (el.length && el.text().trim()) {
        name = el.text().trim();
        break;
      }
    }

    const image = $('img._396cs4').attr('src') ||
                  $('img._2r_T1I').attr('src') ||
                  $('img.q6DClP').attr('src') ||
                  null;

    console.log('Flipkart scrape result:', { price, original_price, name: name?.slice(0, 50), priceText });
    return { platform: 'Flipkart', price, original_price, name, image, url };
  } catch (err) {
    console.error('Flipkart scrape error:', err.message);
    return { platform: 'Flipkart', price: null, original_price: null, name: null, image: null, url };
  }
}

async function scrapeMeesho(url) {
  try {
    const scraperUrl = buildScraperUrl(url, {
      country_code: 'in',
      render: 'false'
    });

    const response = await axios.get(scraperUrl, { timeout: 30000 });
    const $ = cheerio.load(response.data);

    const priceText = $('h4[class*="Text"]').first().text().trim() ||
                      $('span[class*="price"]').first().text().trim();

    const price = priceText
      ? parseFloat(priceText.replace(/[^0-9.]/g, ''))
      : null;

    const name = $('p[class*="ProductName"]').first().text().trim() ||
                 $('h1').first().text().trim() || null;

    return { platform: 'Meesho', price, original_price: price, name, image: null, url };
  } catch (err) {
    console.error('Meesho scrape error:', err.message);
    return { platform: 'Meesho', price: null, original_price: null, name: null, image: null, url };
  }
}

async function scrapeUrl(url) {
  if (url.includes('amazon')) return await scrapeAmazon(url);
  if (url.includes('flipkart')) return await scrapeFlipkart(url);
  if (url.includes('meesho')) return await scrapeMeesho(url);
  return { platform: 'Unknown', price: null, original_price: null, name: null, image: null, url };
}

module.exports = { scrapeUrl, scrapeAmazon, scrapeFlipkart, scrapeMeesho };