const express = require("express");
const router = express.Router();

router.post("/analyse", async (req, res) => {
  try {
    const { productName, currentPrice, highPrice, lowPrice, avgPrice, priceHistory } = req.body;

    console.log("AI Request received:", { productName, currentPrice, highPrice, lowPrice, avgPrice });

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ success: false, error: "GROQ_API_KEY not set" });
    }

    const prompt = `You are a price analysis AI for Indian e-commerce. Analyze this product and give recommendation.

Product Name: ${productName || "Unknown Product"}
Current Price: Rs.${currentPrice || 0}
Highest Price Ever: Rs.${highPrice || 0}
Lowest Price Ever: Rs.${lowPrice || 0}
Average Price: Rs.${avgPrice || 0}
Total Price Records: ${priceHistory ? priceHistory.length : 0}

Based on the price data above, give a clear BUY or WAIT recommendation.

Rules:
- If current price is close to lowest price (within 10%), recommend BUY
- If current price is much higher than average, recommend WAIT
- Always give a recommendation even with limited data

You MUST reply ONLY with this exact JSON (no markdown, no extra text):
{"recommendation":"BUY","confidence":"High","reason":"Your 2 sentence reason here","savings_tip":"Your tip here"}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a price analysis AI. Always respond with valid JSON only. No markdown. No explanation outside JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    console.log("Groq status:", response.status);

    if (!response.ok) {
      console.error("Groq error:", JSON.stringify(data));
      return res.status(500).json({ success: false, error: "AI service error: " + data?.error?.message });
    }

    const text = data.choices[0].message.content;
    console.log("Groq text:", text);

    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      parsed = {
        recommendation: (currentPrice <= avgPrice) ? "BUY" : "WAIT",
        confidence: "Medium",
        reason: `Current price is Rs.${currentPrice}. ${currentPrice <= avgPrice ? "This is at or below average price." : "Price is above average, consider waiting."}`,
        savings_tip: `Lowest price was Rs.${lowPrice}. Set an alert for price drops.`
      };
    }

    if (!parsed.recommendation) parsed.recommendation = "WAIT";
    if (!parsed.confidence) parsed.confidence = "Medium";
    if (!parsed.reason) parsed.reason = "Price analysis complete.";
    if (!parsed.savings_tip) parsed.savings_tip = "Monitor price regularly.";

    console.log("Sending analysis:", parsed);
    res.json({ success: true, analysis: parsed });

  } catch (err) {
    console.error("AI analysis error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;