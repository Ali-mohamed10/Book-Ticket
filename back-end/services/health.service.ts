/**
 * Health Service Types & Module
 *
 * Purpose: Provide TypeScript definitions and export for health service.
 */

export interface HealthCheckResult {
  connected: boolean;
  durationMs: number;
  timestamp: string;
  error?: string;
}

export interface HealthResponseOk {
  status: 'ok';
  timestamp: string;
  database: 'connected';
}

export interface HealthResponseError {
  status: 'error';
  message: string;
}

// Re-export JS module implementation for TypeScript consumers
const healthService = require('./health.service');
export default healthService;
