require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runPriceCheckNow } = require('./services/cronService');

const app = express();
const aiRouter = require('./routes/ai');


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/community', require('./routes/community'));
app.use('/api/community-deals', require('./routes/community'));
app.use('/api/smart-compare', require('./routes/smartCompare'));
app.use('/api/ai', aiRouter);

// Manual price check trigger
app.get('/api/run-price-check', async (req, res) => {
  try {
    await runPriceCheckNow();
    res.json({ success: true, message: 'Price check complete!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});