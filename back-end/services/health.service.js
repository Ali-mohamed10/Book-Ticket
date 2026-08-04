/**
 * Health Service
 *
 * Purpose: Connect to Supabase, execute a lightweight query, and check database availability.
 * Input: None
 * Output: Object containing connection status, timestamp, duration in ms, and optional error.
 * Dependencies: ./supabaseAdmin
 */
const { supabaseAdmin } = require('./supabaseAdmin');

const healthService = {
  /**
   * Execute a lightweight query to Supabase to verify connectivity and keep database active
   * @returns {Promise<{connected: boolean, durationMs: number, timestamp: string, error?: string}>}
   */
  async checkHealth() {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // Execute lightweight query on events table to verify active Supabase connection
      const { data, error } = await supabaseAdmin
        .from('events')
        .select('id')
        .limit(1);

      const durationMs = Date.now() - startTime;

      if (error) {
        console.error(
          `[Health Check Error] Timestamp: ${timestamp} | Duration: ${durationMs}ms | Database: disconnected | Error:`,
          error.message || error
        );
        return {
          connected: false,
          durationMs,
          timestamp,
          error: error.message || 'Database query error',
        };
      }

      console.log(
        `[Health Check Success] Timestamp: ${timestamp} | Duration: ${durationMs}ms | Database: connected`
      );

      return {
        connected: true,
        durationMs,
        timestamp,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      console.error(
        `[Health Check Exception] Timestamp: ${timestamp} | Duration: ${durationMs}ms | Database: disconnected | Error:`,
        errorMessage
      );

      return {
        connected: false,
        durationMs,
        timestamp,
        error: errorMessage,
      };
    }
  },
};

module.exports = healthService;
