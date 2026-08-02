import axios from 'axios';
import { CheckoutParams, CheckoutResponse, Booking } from '../types/booking';

// Use environment variable or fallback to local backend server
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

export const bookingService = {
  /**
   * Initiate Stripe Checkout session & Table reservation
   */
  async createCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
    const response = await axios.post<CheckoutResponse>(
      `${API_BASE_URL}/api/checkout`,
      {
        ...params,
        originUrl: window.location.origin,
      }
    );
    return response.data;
  },

  /**
   * Fetch booking status and ticket by ID or Session ID
   */
  async getBooking(query: { id?: string; sessionId?: string }): Promise<Booking> {
    const params = new URLSearchParams();
    if (query.id) params.append('id', query.id);
    if (query.sessionId) params.append('session_id', query.sessionId);

    const response = await axios.get<{ success: boolean; booking: Booking }>(
      `${API_BASE_URL}/api/booking?${params.toString()}`
    );

    return response.data.booking;
  },
};
