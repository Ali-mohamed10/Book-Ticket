/**
 * Vercel Serverless Function: POST /api/checkout
 */
const stripeService = require('../back-end/services/stripe.service');
const bookingService = require('../back-end/services/booking.service');

module.exports = async function handleCheckout(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      eventId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      tableSelections,
      originUrl
    } = req.body || {};

    if (!eventId || !customerName || !customerEmail || !tableSelections || !tableSelections.length) {
      return res.status(400).json({ error: 'Missing required booking parameters' });
    }

    // Reserve tables atomically using Postgres row locks
    const reservationResult = await bookingService.createReservation({
      eventId,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      tableSelections,
      reservationMinutes: 15,
    });

    const bookingId = reservationResult.booking_id;
    const totalAmount = reservationResult.total_amount;
    const currency = reservationResult.currency || 'CAD';

    const baseUrl = originUrl || `https://${req.headers.host}` || 'http://localhost:5173';
    const successUrl = `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/booking/cancel?booking_id=${bookingId}`;

    // Create Stripe Checkout Session
    const checkoutSession = await stripeService.createCheckoutSession({
      bookingId,
      amount: totalAmount,
      currency,
      customerEmail,
      successUrl,
      cancelUrl,
      itemsDescription: `Khaleeji Tour - Event Reservation (Booking ID: ${bookingId.slice(0, 8)})`
    });

    // Save checkout_session_id to booking record
    await bookingService.updateStripeSessionId(bookingId, checkoutSession.id);

    return res.status(200).json({
      success: true,
      bookingId,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error during checkout'
    });
  }
};
