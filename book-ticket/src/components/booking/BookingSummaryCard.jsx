/**
 * BookingSummaryCard
 *
 * Purpose: Enhanced booking summary for the public Event Details page.
 *          Displays selected tables, seat selection counters (- / +),
 *          pricing breakdown, service fee, and grand total.
 * Input: selectedTables (array), currency (string), onSeatsCountChange (function)
 * Output: Rendered booking summary card
 * Dependencies: react-i18next, lucide-react
 */
import { useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Minus, Plus } from 'lucide-react';

// Service fee percentage
const SERVICE_FEE_RATE = 0.05;

const BookingSummaryCard = memo(({ selectedTables = [], currency = 'CAD', onSeatsCountChange }) => {
  const { t } = useTranslation();

  // Memoize price calculations
  const pricing = useMemo(() => {
    const totalSeats = selectedTables.reduce((sum, tbl) => sum + (tbl.selectedSeatsCount || 1), 0);
    const ticketTotal = selectedTables.reduce((sum, tbl) => sum + parseFloat(tbl.price || 0) * (tbl.selectedSeatsCount || 1), 0);
    const serviceFee = ticketTotal * SERVICE_FEE_RATE;
    const grandTotal = ticketTotal + serviceFee;

    return { totalSeats, ticketTotal, serviceFee, grandTotal };
  }, [selectedTables]);

  return (
    <div
      className="bg-card border border-border rounded-lg shadow-sm overflow-hidden"
      aria-label={t('seatMap.summary', 'Booking Summary')}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-bold text-primary font-sans text-lg uppercase tracking-wider">
          {t('seatMap.summary', 'Booking Summary')}
        </h3>
      </div>

      {/* Selected tables list */}
      <div className="px-5 py-4 min-h-32">
        {selectedTables.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t('seatMap.selectTable', 'Click on a table to select it for booking.')}
          </p>
        ) : (
          <div className="space-y-3">
            {selectedTables.map((table) => {
              const maxAvailable = table.availableSeats ?? (table.capacity - (table.bookedSeats || 0));
              const currentSeats = table.selectedSeatsCount || 1;

              return (
                <div
                  key={table.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/10 rounded-lg border border-border/50"
                >
                  {/* Table details */}
                  <div className="flex items-center gap-4">
                    {/* Table number badge */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-secondary/20 border border-border shrink-0">
                      <span className="text-xl font-bold font-serif text-foreground leading-none">
                        {table.table_code}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-primary-foreground"
                          style={{ backgroundColor: `var(--seat-${table.category})` }}
                        >
                          {t(`seatMap.${table.category}`, table.category)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {t('seatMap.availableSeats', '{{count}} seats available', { count: maxAvailable })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seat counter and Price wrapper */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                    {/* Seats selector controls */}
                    <div className="flex items-center bg-background border border-border rounded-lg p-0.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => onSeatsCountChange?.(table.id, Math.max(1, currentSeats - 1))}
                        disabled={currentSeats <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary/40 text-foreground disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                        aria-label="Decrease seats"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-foreground">
                        {currentSeats}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSeatsCountChange?.(table.id, Math.min(maxAvailable, currentSeats + 1))}
                        disabled={currentSeats >= maxAvailable}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary/40 text-foreground disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                        aria-label="Increase seats"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price display */}
                    <div className="text-right">
                      <span className="font-bold text-foreground block">
                        ${(Number(table.price) * currentSeats).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        ${Number(table.price).toFixed(2)} {t('checkout.each', 'each')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing breakdown — only show when tables are selected */}
      {selectedTables.length > 0 && (
        <div className="px-5 py-4 border-t border-border space-y-3">
          {/* Total seats count summary line */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('checkout.totalSeats', 'Total Seats Booked')}
            </span>
            <span className="text-foreground font-semibold">
              {pricing.totalSeats} {t('checkout.seats', 'seats')}
            </span>
          </div>

          {/* Ticket price */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('checkout.ticketPrice', 'Ticket Price')}
            </span>
            <span className="text-foreground font-medium">
              ${pricing.ticketTotal.toFixed(2)}
            </span>
          </div>

          {/* Service fee */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('checkout.serviceFee', 'Service Fee (5%)')}
            </span>
            <span className="text-foreground font-medium">
              ${pricing.serviceFee.toFixed(2)}
            </span>
          </div>

          {/* Grand total */}
          <div className="flex justify-between items-end pt-3 border-t border-border">
            <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
              {t('seatMap.total', 'Total')}
            </span>
            <span className="font-bold font-sans text-2xl text-primary">
              ${pricing.grandTotal.toFixed(2)}
              <span className="text-xs font-normal text-muted-foreground ms-1">{currency}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

BookingSummaryCard.displayName = 'BookingSummaryCard';
export { BookingSummaryCard };
