/**
 * BookingSummaryCard
 *
 * Purpose: Enhanced booking summary for the public Event Details page.
 *          Displays selected tables, pricing breakdown, service fee, and total.
 * Input: selectedTables (array), currency (string)
 * Output: Rendered booking summary card
 * Dependencies: react-i18next
 */
import { useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

// Service fee percentage
const SERVICE_FEE_RATE = 0.05;

const BookingSummaryCard = memo(({ selectedTables = [], currency = 'CAD' }) => {
  const { t } = useTranslation();

  // Memoize price calculations
  const pricing = useMemo(() => {
    const totalSeats = selectedTables.reduce((sum, tbl) => sum + (tbl.capacity || 0), 0);
    const ticketTotal = selectedTables.reduce((sum, tbl) => sum + parseFloat(tbl.price || 0), 0);
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
        <h3 className="font-bold font-sans text-lg text-foreground uppercase tracking-wider">
          <span className="text-primary">{t('seatMap.summary', 'Booking')}</span>{' '}
          {t('checkout.summaryLabel', 'Summary')}
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
            {selectedTables.map((table) => (
              <div
                key={table.id}
                className="flex items-center gap-4 p-3 bg-secondary/10 rounded-lg border border-border/50"
              >
                {/* Table number badge */}
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-secondary/20 border border-border">
                  <span className="text-xl font-bold font-serif text-foreground leading-none">
                    {table.table_code}
                  </span>
                </div>

                {/* Table details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold uppercase px-2 py-0.5 rounded-full text-primary-foreground"
                      style={{ backgroundColor: `var(--seat-${table.category})` }}
                    >
                      {t(`seatMap.${table.category}`, table.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{t('seatMap.persons', '{{count}} persons', { count: table.capacity })}</span>
                  </div>
                </div>

                {/* Price */}
                <span className="font-bold text-foreground whitespace-nowrap">
                  ${Number(table.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing breakdown — only show when tables are selected */}
      {selectedTables.length > 0 && (
        <div className="px-5 py-4 border-t border-border space-y-3">
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
              <span className="text-xs font-normal text-muted-foreground ms-1">
                {currency}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

BookingSummaryCard.displayName = 'BookingSummaryCard';
export { BookingSummaryCard };
