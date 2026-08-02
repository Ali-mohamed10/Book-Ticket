export type BookingStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface TableSelection {
  table_id: string;
  seats_count: number;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  table_id: string;
  seats_count: number;
  unit_price: number;
  subtotal: number;
  tables?: {
    id: string;
    table_code: string;
    category: string;
    capacity: number;
  };
}

export interface Ticket {
  id: string;
  booking_id: string;
  ticket_code: string;
  customer_name: string;
  qr_code_url: string;
  qr_code_data: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string | null;
  event_id: string;
  status: BookingStatus;
  reserved_until: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  total_amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
  booking_items?: BookingItem[];
  tickets?: Ticket[];
  events?: {
    id: string;
    title_en: string;
    title_ar: string;
    slug: string;
    venue_en: string;
    start_date: string;
    cover_image_url: string;
  };
}

export interface CheckoutParams {
  eventId: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  tableSelections: TableSelection[];
  originUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  bookingId: string;
  checkoutUrl: string;
  sessionId: string;
}
