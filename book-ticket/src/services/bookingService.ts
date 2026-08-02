import axios from 'axios';
import { CheckoutParams, CheckoutResponse, Booking } from '../types/booking';

// Use VITE_API_BASE_URL if explicitly defined, otherwise fallback to local 3001 in dev or relative URL on Vercel
const envApiUrl = (import.meta as any).env?.VITE_API_BASE_URL;
const API_BASE_URL = envApiUrl !== undefined && envApiUrl !== '' 
  ? envApiUrl 
  : ((import.meta as any).env?.DEV ? 'http://localhost:3001' : '');

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
