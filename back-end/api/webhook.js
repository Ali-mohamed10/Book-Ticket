/**
 * POST /api/stripe/webhook
 *
 * ONLY source of truth for confirming payments and generating tickets.
 * Handles checkout.session.completed & payment_intent.succeeded.
 */
const stripeService = require('../services/stripe.service');
const bookingService = require('../services/booking.service');

module.exports = async function handleWebhook(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.rawBody or req.body Buffer is required for signature verification
    const payload = req.rawBody || req.body;
    event = stripeService.constructWebhookEvent(payload, sig);
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id || session.client_reference_id;
        const paymentIntentId = session.payment_intent;
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
        const currency = session.currency ? session.currency.toUpperCase() : 'CAD';

        if (bookingId) {
          console.log(`Webhook: Payment completed for booking ${bookingId}`);
          await bookingService.confirmPayment({
            bookingId,
            paymentIntentId,
            eventId: event.id,
            amount: amountTotal,
            currency,
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.booking_id;
        const amount = paymentIntent.amount_received ? paymentIntent.amount_received / 100 : 0;
        const currency = paymentIntent.currency ? paymentIntent.currency.toUpperCase() : 'CAD';

        if (bookingId) {
          console.log(`Webhook: PaymentIntent succeeded for booking ${bookingId}`);
          await bookingService.confirmPayment({
            bookingId,
            paymentIntentId: paymentIntent.id,
            eventId: event.id,
            amount,
            currency,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.booking_id;
        if (bookingId) {
          console.log(`Webhook: Payment failed for booking ${bookingId}`);
          await bookingService.failPayment(bookingId);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Webhook processing error: ${err.message}`, err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
