/**
 * Vercel Serverless Function: GET/POST /api/cron/expire-reservations
 *
 * Triggered by Vercel Cron Jobs (or external cron) to clean up expired reservations.
 */
const bookingService = require('../../back-end/services/booking.service');

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
