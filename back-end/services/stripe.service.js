/**
 * Stripe Service
 *
 * Encapsulates all Stripe payment API interactions.
 * Never called directly from frontend.
 */
const Stripe = require('stripe');
require('dotenv').config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = Stripe(stripeSecretKey || 'sk_test_placeholder');

const stripeService = {
  /**
   * Create a Stripe Checkout Session for a booking
   * @param {Object} params
   * @param {string} params.bookingId
   * @param {number} params.amount - Total amount in standard currency unit (e.g. CAD 150.00)
   * @param {string} params.currency - e.g. 'CAD'
   * @param {string} params.customerEmail
   * @param {string} params.successUrl
   * @param {string} params.cancelUrl
   * @param {Array} params.items - Description line items
   */
  async createCheckoutSession({
    bookingId,
    amount,
    currency = 'CAD',
    customerEmail,
    successUrl,
    cancelUrl,
    itemsDescription = 'Khaleeji Tour Event Ticket Reservation'
  }) {
    // Convert to cents / smallest currency unit
    const unitAmountCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: itemsDescription,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: bookingId,
      metadata: {
        booking_id: bookingId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes session timeout
    });

    return session;
  },

  /**
   * Construct and verify Stripe Webhook event signature
   * @param {Buffer|string} payload - Raw request body
   * @param {string} signature - stripe-signature header
   * @returns {Stripe.Event}
   */
  constructWebhookEvent(payload, signature) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is missing from environment variables');
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
};

module.exports = stripeService;
