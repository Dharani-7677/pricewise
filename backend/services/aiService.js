// backend/services/aiService.js
// Rule-based Smart Buy Score calculator (no external API needed)

function calculateDiscount(currentPrice, originalPrice) {
    if (!originalPrice || originalPrice === 0) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

function analyzeDeal(product, priceHistory) {
    const currentPrice = parseFloat(product.current_price) || 0;
    const originalPrice = parseFloat(product.original_price) || currentPrice;
    const discount = calculateDiscount(currentPrice, originalPrice);

    let score = 5;
    let reasons = [];
    let badges = [];

    // Rule 1: Discount percentage
    if (discount >= 60) {
        score += 3;
        reasons.push(`Massive discount of ${discount}% off the original price.`);
        badges.push({ label: `🔥 ${discount}% OFF`, type: "success" });
    } else if (discount >= 40) {
        score += 2;
        reasons.push(`Strong discount of ${discount}% off.`);
        badges.push({ label: `📉 ${discount}% OFF`, type: "indigo" });
    } else if (discount >= 20) {
        score += 1;
        reasons.push(`Moderate discount of ${discount}%.`);
        badges.push({ label: `${discount}% OFF`, type: "warning" });
    } else if (discount > 0) {
        reasons.push(`Small discount of only ${discount}%.`);
    } else {
        score -= 1;
        reasons.push("No discount detected — this is at or above the listed price.");
    }

    // Rule 2: Price history analysis (if available)
    if (priceHistory && priceHistory.length > 1) {
        const prices = priceHistory.map(function (h) { return parseFloat(h.price); });
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce(function (a, b) { return a + b; }, 0) / prices.length;

        if (currentPrice <= minPrice) {
            score += 2;
            reasons.push("This is the lowest price ever recorded for this product.");
            badges.push({ label: "✓ All-Time Low", type: "success" });
        } else if (currentPrice <= avgPrice) {
            score += 1;
            reasons.push("Current price is below the historical average — a good time to consider buying.");
        } else if (currentPrice >= maxPrice) {
            score -= 2;
            reasons.push("This is close to the highest price ever recorded. Consider waiting.");
            badges.push({ label: "⚠️ Near All-Time High", type: "danger" });
        }
    } else {
        reasons.push("Limited price history available — score is based on current discount only.");
    }

    // Clamp score between 1 and 10
    score = Math.max(1, Math.min(10, score));

    // Recommendation text based on final score
    let recommendation;
    let verdict;
    if (score >= 8) {
        verdict = "Excellent Deal — Buy Now!";
        recommendation = "This is a great time to buy. The discount is strong and the price is at or near historic lows.";
    } else if (score >= 6) {
        verdict = "Good Deal";
        recommendation = "This is a solid deal worth considering, though it may not be the absolute lowest price.";
    } else if (score >= 4) {
        verdict = "Average Deal";
        recommendation = "This is an okay deal, but you may want to wait for a bigger discount.";
    } else {
        verdict = "Wait for a Better Price";
        recommendation = "This isn't the best time to buy. Consider waiting for a bigger drop or checking other platforms.";
    }

    return {
        score: score,
        verdict: verdict,
        recommendation: recommendation,
        reasons: reasons,
        badges: badges,
        discount_percent: discount,
    };
}

module.exports = { analyzeDeal };