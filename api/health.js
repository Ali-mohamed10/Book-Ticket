/**
 * Vercel Serverless Function: GET /api/health
 *
 * Health check endpoint triggered by Vercel Cron Jobs (or HTTP requests)
 * to verify database availability and keep Supabase project active.
 */
const healthService = require('../back-end/services/health.service');

module.exports = async function handleHealthCheck(req, res) {
  try {
    const healthResult = await healthService.checkHealth();

    if (!healthResult.connected) {
      return res.status(500).json({
        status: 'error',
        message: 'Database unavailable',
      });
    }

    return res.status(200).json({
      status: 'ok',
      timestamp: healthResult.timestamp,
      database: 'connected',
    });
  } catch (error) {
    console.error('[Health Endpoint Exception]:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Database unavailable',
    });
  }
};
