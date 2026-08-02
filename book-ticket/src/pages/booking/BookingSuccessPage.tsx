import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, AlertCircle, Download, Calendar, MapPin, User, Ticket as TicketIcon } from 'lucide-react';
import { useBookingStatus } from '../../hooks/useBooking';

export const BookingSuccessPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || undefined;
  const bookingId = searchParams.get('booking_id') || undefined;

  const ticketCardRef = useRef<HTMLDivElement>(null);

  const { data: booking, isLoading, isError, error } = useBookingStatus({
    sessionId,
    id: bookingId,
  });

  const status = booking?.status;
  const ticket = booking?.tickets?.[0];

  // Print/Download handler for the ticket
  const handleDownloadTicket = () => {
    window.print();
  };

  if (isLoading || (booking && status === 'PENDING')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center container mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-primary/20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-sans text-foreground mb-3 uppercase tracking-wider">
          {t('booking.verifyingTitle', 'Payment is being verified...')}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mb-6 leading-relaxed">
          {t('booking.verifyingDesc', 'Please wait a moment while Stripe confirms your payment. Do not close or refresh this window.')}
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>{t('booking.pollingBadge', 'Polling payment status every 2 seconds')}</span>
        </div>
      </div>
    );
  }

  if (isError || status === 'FAILED' || status === 'EXPIRED') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center container mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6 border border-destructive/30">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-sans text-foreground mb-3 uppercase tracking-wider">
          {status === 'EXPIRED'
            ? t('booking.expiredTitle', 'Reservation Expired')
            : t('booking.failedTitle', 'Payment Unverified or Failed')}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mb-8 leading-relaxed">
          {status === 'EXPIRED'
            ? t('booking.expiredDesc', 'Your 15-minute reservation window timed out before payment was completed.')
            : (error?.message || t('booking.failedDesc', 'We could not confirm payment for this reservation.'))}
        </p>
        <Link
          to="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          {t('booking.returnHome', 'Return to Home')}
        </Link>
      </div>
    );
  }

  if (!booking || status !== 'PAID') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl animate-fade-in-up">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold font-sans text-foreground uppercase tracking-wider mb-2">
          {t('booking.confirmedTitle', 'Booking Confirmed!')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('booking.confirmedDesc', 'Your payment was successfully verified by Stripe Webhook. Here is your official ticket.')}
        </p>
      </div>

      {/* Ticket Card Component (Printable) */}
      <div
        ref={ticketCardRef}
        className="bg-card border-2 border-primary/40 rounded-xl overflow-hidden shadow-premium mb-8 relative"
      >
        {/* Ticket Header */}
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TicketIcon className="w-6 h-6 text-primary" />
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-primary block">
                {t('booking.officialTicket', 'Official Event Ticket')}
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                #{ticket?.ticket_code || booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            {t('booking.statusPaid', 'PAID')}
          </span>
        </div>

        {/* Ticket Content Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8 items-center">
          {/* Details Column */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground font-sans">
                {booking.events?.title_en || t('booking.eventTicket', 'Khaleeji Tour Event')}
              </h3>
              {booking.events?.venue_en && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{booking.events.venue_en}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {t('booking.guestName', 'Guest Name')}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {booking.customer_name}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    {t('booking.bookingDate', 'Booked On')}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Tables list */}
            <div className="pt-2 border-t border-border/50">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                {t('booking.reservedTables', 'Reserved Tables')}
              </span>
              <div className="flex flex-wrap gap-2">
                {booking.booking_items?.map((item) => (
                  <span
                    key={item.id}
                    className="px-3 py-1 bg-secondary/20 border border-border rounded-md text-xs font-bold text-foreground"
                  >
                    Table #{item.tables?.table_code || 'T-ID'} ({item.seats_count} {t('booking.seats', 'seats')})
                  </span>
                ))}
              </div>
            </div>

            {/* Total Paid */}
            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{t('booking.totalPaid', 'Total Amount Paid')}</span>
              <span className="text-lg font-bold font-serif text-primary">
                ${Number(booking.total_amount).toFixed(2)} {booking.currency}
              </span>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="flex flex-col items-center justify-center p-4 bg-white/95 rounded-xl border border-border text-center shadow-inner">
            {ticket?.qr_code_url ? (
              <img
                src={ticket.qr_code_url}
                alt="Ticket QR Code"
                className="w-40 h-40 object-contain rounded"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded">
                QR Code
              </div>
            )}
            <span className="text-[10px] font-mono text-black font-bold mt-2 uppercase tracking-widest">
              {ticket?.ticket_code}
            </span>
            <span className="text-[9px] text-gray-500 mt-0.5">
              {t('booking.scanAtEntrance', 'Scan at venue entrance')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 print:hidden">
        <button
          onClick={handleDownloadTicket}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>{t('booking.downloadTicket', 'Print / Save Ticket')}</span>
        </button>

        <Link
          to="/"
          className="bg-secondary/20 hover:bg-secondary/30 border border-border text-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors"
        >
          {t('booking.browseMoreEvents', 'Browse More Events')}
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
