/**
 * EventDetailsPage
 *
 * Purpose: Public event details page at /events/:slug.
 *          Three-column layout: Event Info | Seat Map | Booking + Checkout.
 * Input: slug from URL params
 * Output: Full event page with interactive seat map and booking flow
 * Dependencies: useEventBySlug, InteractiveSeatMap, BookingSummaryCard, CheckoutCard
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEventBySlug } from '../../hooks/useEvents';

import { EventInfoPanel } from '../../components/event/EventInfoPanel';
import { EventDetailsSkeleton } from '../../components/event/EventDetailsSkeleton';
import { InteractiveSeatMap } from '../../components/seatmap/InteractiveSeatMap';
import { SeatMapLegend } from '../../components/seatmap/SeatMapLegend';
import { BookingSummaryCard } from '../../components/booking/BookingSummaryCard';
import { CheckoutCard } from '../../components/booking/CheckoutCard';

// Service fee rate constant
const SERVICE_FEE_RATE = 0.05;

export const EventDetailsPage = () => {
  const { slug } = useParams();
  const { t } = useTranslation();

  // Fetch event with seat map and tables
  const { data: event, isLoading, error } = useEventBySlug(slug);

  // Selected tables state
  const [selectedTables, setSelectedTables] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Auto-reset checkout mode when no tables selected
  useEffect(() => {
    if (selectedTables.length === 0) {
      setIsCheckingOut(false);
    }
  }, [selectedTables.length]);

  // Toggle table selection (Multi-Select)
  const handleTableSelect = useCallback((table) => {
    setSelectedTables((prev) => {
      const exists = prev.find((t) => t.id === table.id);
      if (exists) {
        // Deselect table
        return prev.filter((t) => t.id !== table.id);
      }
      // Multi-select: append newly selected table
      return [
        ...prev,
        {
          ...table,
          selectedSeatsCount: 1
        }
      ];
    });
  }, []);

  // Update selected seats count for a specific table
  const handleSeatsCountChange = useCallback((tableId, newCount) => {
    setSelectedTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, selectedSeatsCount: newCount } : t))
    );
  }, []);

  // Calculate grand total for checkout card
  const grandTotal = useMemo(() => {
    const ticketTotal = selectedTables.reduce(
      (sum, tbl) => sum + parseFloat(tbl.price || 0) * (tbl.selectedSeatsCount || 1),
      0
    );
    return ticketTotal + ticketTotal * SERVICE_FEE_RATE;
  }, [selectedTables]);

  // Build seat map data structure for InteractiveSeatMap
  const seatMapData = useMemo(() => {
    if (!event?.seat_maps) return null;
    return {
      ...event.seat_maps,
      tables: event.seat_maps.tables || [],
    };
  }, [event?.seat_maps]);

  // Loading state
  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t('errors.eventNotFound', 'Event Not Found')}
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          {t('errors.eventNotFoundDesc', "We can't seem to find the event you're looking for.")}
        </p>
      </div>
    );
  }

  // No event found
  if (!event) return null;

  return (
    <div className={`animate-fade-in-up ${selectedTables.length > 0 && !isCheckingOut ? 'pb-28 md:pb-0' : ''}`}>
      {/* Desktop: Two-column layout (Left: Event Info, Right: Seat Map + Booking/Checkout subgrid) */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left — Event Info */}
        <div className={isCheckingOut ? 'hidden lg:block' : ''}>
          <EventInfoPanel event={event} />
        </div>

        {/* Right — Seat Map & Bottom Billing/Checkout Cards */}
        <div className="flex flex-col gap-6">
          {/* Seat Map */}
          {seatMapData ? (
            <div className={`flex-col gap-4 ${isCheckingOut ? 'hidden lg:flex' : 'flex'}`}>
              <InteractiveSeatMap
                seatMap={seatMapData}
                onTableSelect={handleTableSelect}
                selectedTables={selectedTables}
                onSeatsCountChange={handleSeatsCountChange}
              />
              <SeatMapLegend />
            </div>
          ) : (
            <div className={`flex items-center justify-center h-96 bg-secondary/10 rounded-lg border border-border text-muted-foreground ${isCheckingOut ? 'hidden lg:flex' : 'flex'}`}>
              {t('eventDetails.noSeatMap', 'No seat map available for this event.')}
            </div>
          )}

          {/* Booking Summary & Checkout Cards side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={isCheckingOut ? 'hidden md:block' : ''}>
              <BookingSummaryCard
                selectedTables={selectedTables}
                currency={event.currency || 'CAD'}
                onSeatsCountChange={handleSeatsCountChange}
                onTableSelect={handleTableSelect}
              />
            </div>
            <div className={!isCheckingOut ? 'hidden md:block' : ''}>
              {isCheckingOut && (
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="md:hidden mb-4 flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                >
                  ← {t('eventDetails.backToSeats', 'Back to Seat Selection')}
                </button>
              )}
              <CheckoutCard
                grandTotal={grandTotal}
                currency={event.currency || 'CAD'}
                disabled={selectedTables.length === 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      {selectedTables.length > 0 && !isCheckingOut && (
        <div className="fixed bottom-0 inset-x-0 md:hidden bg-card border-t border-border p-4 shadow-premium-top z-40">
          <div className="flex items-center flex-wrap justify-center container mx-auto">
            
            <button 
              onClick={() => setIsCheckingOut(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
            >
              {t('seatMap.proceedToCheckout', 'Proceed to Checkout')} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
