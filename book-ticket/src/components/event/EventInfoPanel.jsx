/**
 * EventInfoPanel
 *
 * Purpose: Left sidebar displaying event information on the Event Details page.
 * Input: event object from Supabase
 * Output: Rendered event info panel (image, title, date, venue, description)
 * Dependencies: react-i18next, lucide-react, react-router-dom
 */
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import AppImage from '../common/AppImage';

const EventInfoPanel = memo(({ event }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Bilingual field helpers
  const title = isArabic && event.title_ar ? event.title_ar : event.title_en;
  const venue = isArabic && event.venue_ar ? event.venue_ar : event.venue_en;
  const city = isArabic && event.city_ar ? event.city_ar : event.city_en;
  const description = isArabic && event.description_ar
    ? event.description_ar
    : event.description_en;

  // Date formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  };

  // Time formatting
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <aside className="flex flex-col gap-5" aria-label={t('eventDetails.eventInfo', 'Event Information')}>
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group w-fit"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="uppercase tracking-wider font-medium">
          {t('eventDetails.backToEvents', 'Back to Events')}
        </span>
      </Link>

      {/* Cover image */}
      {event.cover_image_url && (
        <div className="rounded-lg overflow-hidden border border-border aspect-video">
          <AppImage
            src={event.cover_image_url}
            alt={title}
            priority={true}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground uppercase tracking-wide leading-tight">
        {title}
      </h1>

      {/* Meta info */}
      <div className="flex flex-col gap-3">
        {/* Date */}
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <span>{formatDate(event.start_date)}</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>
            {formatTime(event.start_date)}
            {event.end_date && ` – ${formatTime(event.end_date)}`}
          </span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span>
            {venue}
            {city && `, ${city}`}
          </span>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          {description}
        </p>
      )}

      {/* Starting price */}
      {event.starting_price > 0 && (
        <div className="border-t border-border pt-4">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">
            {t('eventDetails.startingFrom', 'Starting from')}
          </span>
          <span className="text-2xl font-serif font-bold text-primary">
            ${Number(event.starting_price).toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground ms-1">
              {event.currency || 'CAD'}
            </span>
          </span>
        </div>
      )}
    </aside>
  );
});

EventInfoPanel.displayName = 'EventInfoPanel';
export { EventInfoPanel };
