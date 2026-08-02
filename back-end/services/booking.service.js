/**
 * Booking Service (Backend)
 *
 * Provides server-side booking business logic using atomic Supabase RPCs.
 */
const { supabaseAdmin } = require('./supabaseAdmin');
const ticketService = require('./ticket.service');

const bookingService = {
  /**
   * Reserve tables and create pending booking using atomic RPC with row-level locking
   */
  async createReservation({
    eventId,
    userId = null,
    customerName,
    customerEmail,
    customerPhone,
    tableSelections,
    reservationMinutes = 15,
  }) {
    const { data, error } = await supabaseAdmin.rpc('reserve_tables_for_booking', {
      p_event_id: eventId,
      p_user_id: userId,
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone,
      p_table_selections: tableSelections,
      p_reservation_minutes: reservationMinutes,
    });

    if (error) {
      console.error('Reservation error from RPC:', error);
      throw new Error(error.message || 'Failed to reserve table. Table may already be reserved.');
    }

    return data;
  },

  /**
   * Save Stripe checkout session ID on booking record
   */
  async updateStripeSessionId(bookingId, checkoutSessionId) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ stripe_checkout_session_id: checkoutSessionId })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Confirm booking payment from Stripe Webhook in ONE atomic transaction
   */
  async confirmPayment({ bookingId, paymentIntentId, eventId, amount, currency }) {
    const { data, error } = await supabaseAdmin.rpc('confirm_booking_payment', {
      p_booking_id: bookingId,
      p_stripe_payment_intent_id: paymentIntentId,
      p_stripe_event_id: eventId,
      p_amount: amount,
      p_currency: currency,
    });

    if (error) {
      console.error('Error in confirm_booking_payment RPC:', error);
      throw error;
    }

    // Issue Ticket & QR code upon confirmation
    const ticket = await ticketService.issueTicketForBooking({
      bookingId,
      customerName: data.customer_name,
    });

    return { bookingResult: data, ticket };
  },

  /**
   * Mark booking as failed and release tables
   */
  async failPayment(bookingId) {
    const { data, error } = await supabaseAdmin.rpc('fail_booking_payment', {
      p_booking_id: bookingId,
    });

    if (error) console.error('Error failing booking payment:', error);
    return data;
  },

  /**
   * Run automatic expiration cleanup for stale reservations
   */
  async expireStaleReservations() {
    const { data, error } = await supabaseAdmin.rpc('expire_stale_reservations');
    if (error) console.error('Error expiring stale reservations:', error);
    return data;
  },

  /**
   * Get booking details by booking ID with items, event, tables and tickets
   */
  async getBookingById(bookingId) {
    // Run auto-expiration check on read
    await this.expireStaleReservations();

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, booking_items(*, tables(*)), tickets(*), events(*)')
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return booking;
  },

  /**
   * Get booking details by Stripe Checkout Session ID
   */
  async getBookingBySessionId(sessionId) {
    await this.expireStaleReservations();

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select('*, booking_items(*, tables(*)), tickets(*), events(*)')
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    if (error) throw error;
    return booking;
  }
};

module.exports = bookingService;
