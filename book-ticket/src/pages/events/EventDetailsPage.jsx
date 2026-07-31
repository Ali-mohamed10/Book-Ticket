/**
 * EventDetailsPage
 *
 * Purpose: Public event details page at /events/:slug.
 *          Three-column layout: Event Info | Seat Map | Booking + Checkout.
 * Input: slug from URL params
 * Output: Full event page with interactive seat map and booking flow
 * Dependencies: useEventBySlug, InteractiveSeatMap, BookingSummaryCard, CheckoutCard
 */
import { useState, useCallback, useMemo } from 'react';
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

  // Toggle table selection (memoized, enforces single table selection)
  const handleTableSelect = useCallback((table) => {
    // Only allow selecting available tables
    if (table.status !== 'available') return;

    setSelectedTables((prev) => {
      const exists = prev.find((t) => t.id === table.id);
      if (exists) {
        // Deselect if clicked again
        return [];
      }
      // Select ONLY the new table
      return [table];
    });
  }, []);

  // Calculate grand total for checkout card
  const grandTotal = useMemo(() => {
    const ticketTotal = selectedTables.reduce(
      (sum, tbl) => sum + parseFloat(tbl.price || 0),
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
    <div className="animate-fade-in-up">
      {/* Desktop: Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_340px] gap-6">
        {/* Left — Event Info */}
        <div className="order-1 lg:order-1">
          <EventInfoPanel event={event} />
        </div>

        {/* Center — Seat Map */}
        <div className="order-3 lg:order-2 flex flex-col gap-4">
          {seatMapData ? (
            <>
              <InteractiveSeatMap
                seatMap={seatMapData}
                onTableSelect={handleTableSelect}
                selectedTables={selectedTables}
              />
              <SeatMapLegend />
            </>
          ) : (
            <div className="flex items-center justify-center h-96 bg-secondary/10 rounded-lg border border-border text-muted-foreground">
              {t('eventDetails.noSeatMap', 'No seat map available for this event.')}
            </div>
          )}
        </div>

        {/* Right — Booking Summary + Checkout */}
        <div className="order-2 lg:order-3 flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <BookingSummaryCard
            selectedTables={selectedTables}
            currency={event.currency || 'CAD'}
          />
          <CheckoutCard
            grandTotal={grandTotal}
            currency={event.currency || 'CAD'}
            disabled={selectedTables.length === 0}
          />
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      {selectedTables.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 lg:hidden bg-card border-t border-border p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-40">
          <div className="flex items-center justify-between container mx-auto">
            <div>
              <span className="text-xs text-muted-foreground block">
                {t('seatMap.total', 'Total')}
              </span>
              <span className="text-xl font-bold font-serif text-primary">
                ${grandTotal.toFixed(2)} {event.currency || 'CAD'}
              </span>
            </div>
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity">
              {t('seatMap.proceedToCheckout', 'Proceed to Checkout')} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
