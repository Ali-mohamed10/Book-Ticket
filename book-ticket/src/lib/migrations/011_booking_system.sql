-- ============================================================
-- Khaleeji Tour — Booking System Schema & Atomic RPC Functions
-- ============================================================

-- 1. Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED')),
  reserved_until TIMESTAMPTZ,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'CAD',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Booking Items Table
CREATE TABLE IF NOT EXISTS public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE RESTRICT,
  seats_count INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  status TEXT NOT NULL DEFAULT 'succeeded',
  stripe_event_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  ticket_code TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  qr_code_url TEXT,
  qr_code_data TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add columns to Tables table for reservation tracking
ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON public.bookings(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_tables_booking_id ON public.tables(booking_id);

-- Trigger for updated_at on bookings
CREATE TRIGGER handle_updated_at_bookings
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Public can view own bookings or bookings by session (or admins view all)
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_editor_or_admin()
  );

CREATE POLICY "Users can view own booking items" ON public.booking_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_items.booking_id AND (b.user_id = auth.uid() OR public.is_editor_or_admin())
    )
  );

CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = tickets.booking_id AND (b.user_id = auth.uid() OR public.is_editor_or_admin())
    )
  );

-- ============================================================
-- 7. ATOMIC RPC: reserve_tables_for_booking
-- Handles Double-Booking protection with PostgreSQL row locking (FOR UPDATE)
-- ============================================================
CREATE OR REPLACE FUNCTION public.reserve_tables_for_booking(
  p_event_id UUID,
  p_user_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_table_selections JSONB, -- Array of objects: [{"table_id": "...", "seats_count": 2}]
  p_reservation_minutes INT DEFAULT 15
)
RETURNS JSONB AS $$
DECLARE
  v_table_item JSONB;
  v_table_id UUID;
  v_seats_count INT;
  v_current_status TEXT;
  v_table_price NUMERIC(10,2);
  v_subtotal NUMERIC(10,2);
  v_ticket_total NUMERIC(10,2) := 0;
  v_service_fee NUMERIC(10,2) := 0;
  v_grand_total NUMERIC(10,2) := 0;
  v_booking_id UUID;
  v_reserved_until TIMESTAMPTZ;
  v_currency TEXT := 'CAD';
BEGIN
  -- Set expiration time
  v_reserved_until := now() + (p_reservation_minutes || ' minutes')::interval;

  -- 1. Auto-cleanup any expired bookings & table holds first
  PERFORM public.expire_stale_reservations();

  -- 2. Lock & Validate all requested tables (Prevent Race Conditions)
  FOR v_table_item IN SELECT * FROM jsonb_array_elements(p_table_selections)
  LOOP
    v_table_id := (v_table_item->>'table_id')::UUID;
    v_seats_count := (v_table_item->>'seats_count')::INT;

    -- Row level lock
    SELECT status, price INTO v_current_status, v_table_price
    FROM public.tables
    WHERE id = v_table_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Table with ID % not found', v_table_id;
    END IF;

    IF v_current_status != 'available' THEN
      RAISE EXCEPTION 'Table already reserved or sold (ID: %)', v_table_id;
    END IF;

    v_subtotal := v_table_price * v_seats_count;
    v_ticket_total := v_ticket_total + v_subtotal;
  END LOOP;

  -- Calculate 5% service fee and grand total
  v_service_fee := v_ticket_total * 0.05;
  v_grand_total := v_ticket_total + v_service_fee;

  -- Get event currency if available
  SELECT currency INTO v_currency FROM public.events WHERE id = p_event_id;
  IF v_currency IS NULL THEN
    v_currency := 'CAD';
  END IF;

  -- 3. Create Booking Record
  INSERT INTO public.bookings (
    user_id,
    event_id,
    status,
    reserved_until,
    total_amount,
    currency,
    customer_name,
    customer_email,
    customer_phone
  ) VALUES (
    p_user_id,
    p_event_id,
    'PENDING',
    v_reserved_until,
    v_grand_total,
    v_currency,
    p_customer_name,
    p_customer_email,
    p_customer_phone
  ) RETURNING id INTO v_booking_id;

  -- 4. Create Booking Items & Update Tables to Reserved
  FOR v_table_item IN SELECT * FROM jsonb_array_elements(p_table_selections)
  LOOP
    v_table_id := (v_table_item->>'table_id')::UUID;
    v_seats_count := (v_table_item->>'seats_count')::INT;

    SELECT price INTO v_table_price FROM public.tables WHERE id = v_table_id;
    v_subtotal := v_table_price * v_seats_count;

    INSERT INTO public.booking_items (
      booking_id,
      table_id,
      seats_count,
      unit_price,
      subtotal
    ) VALUES (
      v_booking_id,
      v_table_id,
      v_seats_count,
      v_table_price,
      v_subtotal
    );

    UPDATE public.tables
    SET status = 'reserved',
        booking_id = v_booking_id,
        reserved_until = v_reserved_until,
        reserved_by = p_user_id
    WHERE id = v_table_id;
  END LOOP;

  -- 5. Return success result
  RETURN jsonb_build_object(
    'booking_id', v_booking_id,
    'total_amount', v_grand_total,
    'currency', v_currency,
    'reserved_until', v_reserved_until
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. ATOMIC RPC: confirm_booking_payment
-- Called by Webhook on checkout.session.completed or payment_intent.succeeded
-- ============================================================
CREATE OR REPLACE FUNCTION public.confirm_booking_payment(
  p_booking_id UUID,
  p_stripe_payment_intent_id TEXT,
  p_stripe_event_id TEXT,
  p_amount NUMERIC,
  p_currency TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_booking_record RECORD;
BEGIN
  -- Lock booking row
  SELECT * INTO v_booking_record FROM public.bookings WHERE id = p_booking_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  IF v_booking_record.status = 'PAID' THEN
    -- Already paid (idempotent response)
    RETURN jsonb_build_object('success', true, 'message', 'Booking already paid', 'booking_id', p_booking_id);
  END IF;

  -- 1. Update Booking status -> PAID
  UPDATE public.bookings
  SET status = 'PAID',
      stripe_payment_intent_id = p_stripe_payment_intent_id,
      updated_at = now()
  WHERE id = p_booking_id;

  -- 2. Update Tables status -> sold
  UPDATE public.tables
  SET status = 'sold',
      reserved_until = NULL
  WHERE booking_id = p_booking_id;

  -- 3. Log Payment Record
  INSERT INTO public.payments (
    booking_id,
    stripe_payment_intent_id,
    amount,
    currency,
    status,
    stripe_event_id
  ) VALUES (
    p_booking_id,
    p_stripe_payment_intent_id,
    p_amount,
    COALESCE(p_currency, 'CAD'),
    'succeeded',
    p_stripe_event_id
  ) ON CONFLICT (stripe_event_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', p_booking_id,
    'customer_name', v_booking_record.customer_name,
    'customer_email', v_booking_record.customer_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. ATOMIC RPC: fail_booking_payment
-- Called when payment fails or user cancels
-- ============================================================
CREATE OR REPLACE FUNCTION public.fail_booking_payment(
  p_booking_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update booking
  UPDATE public.bookings
  SET status = 'FAILED',
      updated_at = now()
  WHERE id = p_booking_id AND status = 'PENDING';

  -- Release tables
  UPDATE public.tables
  SET status = 'available',
      booking_id = NULL,
      reserved_until = NULL,
      reserved_by = NULL
  WHERE booking_id = p_booking_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. ATOMIC RPC: expire_stale_reservations
-- Automatic timeout cleanup for pending bookings older than reserved_until
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_stale_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_expired_count INT := 0;
BEGIN
  -- 1. Release tables linked to expired pending bookings
  UPDATE public.tables
  SET status = 'available',
      booking_id = NULL,
      reserved_until = NULL,
      reserved_by = NULL
  WHERE booking_id IN (
    SELECT id FROM public.bookings
    WHERE status = 'PENDING' AND reserved_until < now()
  );

  -- 2. Mark pending bookings as EXPIRED
  WITH expired_rows AS (
    UPDATE public.bookings
    SET status = 'EXPIRED',
        updated_at = now()
    WHERE status = 'PENDING' AND reserved_until < now()
    RETURNING id
  )
  SELECT count(*) INTO v_expired_count FROM expired_rows;

  RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
