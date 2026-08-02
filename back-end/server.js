/**
 * Express Server for Local Development & Node hosting
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const handleCheckout = require('./api/checkout');
const handleWebhook = require('./api/webhook');
const handleGetBooking = require('./api/booking');
const handleExpireReservations = require('./api/expire-reservations');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors());

// Raw body parser for Stripe webhook (MUST be before express.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

// JSON body parser for normal endpoints
app.use(express.json());

// Routes
app.post('/api/checkout', handleCheckout);
app.post('/api/stripe/webhook', handleWebhook);
app.get('/api/booking', handleGetBooking);
app.post('/api/cron/expire-reservations', handleExpireReservations);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start automatic 1-minute interval to expire stale reservations
setInterval(async () => {
  try {
    const bookingService = require('./services/booking.service');
    const expiredCount = await bookingService.expireStaleReservations();
    if (expiredCount > 0) {
      console.log(`[Cron] Expired ${expiredCount} stale reservation(s).`);
    }
  } catch (err) {
    console.error('[Cron] Error in reservation expiration interval:', err);
  }
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Booking Backend Server running on http://localhost:${PORT}`);
  console.log(`  - Checkout: POST http://localhost:${PORT}/api/checkout`);
  console.log(`  - Webhook:  POST http://localhost:${PORT}/api/stripe/webhook`);
  console.log(`  - Booking:  GET  http://localhost:${PORT}/api/booking`);
});

module.exports = app;
