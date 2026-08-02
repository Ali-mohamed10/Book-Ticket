/**
 * POST /api/cron/expire-reservations
 *
 * Cron worker / API endpoint for releasing expired pending reservations.
 */
const bookingService = require('../services/booking.service');

module.exports = async function handleExpireReservations(req, res) {
  try {
    const expiredCount = await bookingService.expireStaleReservations();
    return res.status(200).json({
      success: true,
      expiredCount: expiredCount || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error expiring reservations:', error);
    return res.status(500).json({ error: error.message });
  }
};
