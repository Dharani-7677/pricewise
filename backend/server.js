// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { startPriceCheckJob } = require('./services/cronService');

const app = express();

// Start Automation: Cron Job (Price Checker every 6 hours)
startPriceCheckJob();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/prices', require('./routes/prices'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/community', require('./routes/community'));
app.use('/api/community-deals', require('./routes/communityDeals'));

app.get('/', (req, res) => {
    res.send("PriceWise Backend is Active!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:5000`);
});