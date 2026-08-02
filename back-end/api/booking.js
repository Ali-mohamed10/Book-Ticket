/**
 * GET /api/booking
 *
 * Fetch booking status and generated ticket.
 * Query params: ?id=UUID or ?session_id=checkout_session_id
 */
const bookingService = require('../services/booking.service');

module.exports = async function handleGetBooking(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, session_id } = req.query;

    let booking;
    if (id) {
      booking = await bookingService.getBookingById(id);
    } else if (session_id) {
      booking = await bookingService.getBookingBySessionId(session_id);
    } else {
      return res.status(400).json({ error: 'Please specify booking id or session_id' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get Booking API error:', error);
    return res.status(500).json({ error: error.message || 'Error retrieving booking' });
  }
};
