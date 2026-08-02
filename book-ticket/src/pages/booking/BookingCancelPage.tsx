import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, RefreshCw, ArrowLeft, XCircle } from 'lucide-react';
import { useBookingStatus } from '../../hooks/useBooking';

export const BookingCancelPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id') || undefined;

  const { data: booking, isLoading } = useBookingStatus({ id: bookingId });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Expiration countdown
  useEffect(() => {
    if (!booking?.reserved_until) return;

    const calculateTimeLeft = () => {
      const diff = new Date(booking.reserved_until!).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking?.reserved_until]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = timeLeft !== null && timeLeft <= 0;

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl text-center animate-fade-in-up">
      {/* Icon */}
      <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-md">
        <XCircle className="w-10 h-10" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold font-sans text-foreground uppercase tracking-wider mb-3">
        {t('booking.cancelledTitle', 'Payment Cancelled')}
      </h1>

      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8 leading-relaxed">
        {t(
          'booking.cancelledDesc',
          'You cancelled the checkout process. Don\'t worry, your table reservation is still temporarily held.'
        )}
      </p>

      {/* Reservation Hold Status Box */}
      {!isLoading && booking && !isExpired && (
        <div className="bg-card border border-amber-500/30 rounded-xl p-6 mb-8 text-left space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              {t('booking.reservationHold', 'Active Reservation Hold')}
            </span>
            <div className="flex items-center gap-1.5 text-amber-500 font-mono font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <Clock className="w-4 h-4 animate-spin" />
              <span>{timeLeft !== null ? formatCountdown(timeLeft) : '--:--'}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {booking.customer_name}
            </span>
            , your table seats will be automatically released back to the public when the timer reaches 00:00.
          </div>
        </div>
      )}

      {isExpired && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-8 text-xs text-destructive">
          {t('booking.holdExpired', 'Your reservation hold has expired. Please select your seats again.')}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {booking?.events?.slug && (
          <Link
            to={`/events/${booking.events.slug}`}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('booking.tryCheckoutAgain', 'Return to Event & Try Again')}</span>
          </Link>
        )}

        <Link
          to="/"
          className="bg-secondary/20 hover:bg-secondary/30 border border-border text-foreground px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('booking.backToEvents', 'Back to Events')}</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingCancelPage;
