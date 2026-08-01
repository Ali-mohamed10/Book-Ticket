import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const EventCard = ({ event }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const title = isArabic && event.title_ar ? event.title_ar : event.title_en;
  const venueName = isArabic && event.venue_ar ? event.venue_ar : event.venue_en;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date
      .toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase();
  };

  return (
    <div className="group relative rounded-xl border border-border bg-secondary/20 overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full shadow-premium hover:shadow-[0_0_20px_rgba(201,169,107,0.2)]">
      {/* Image container with gradient overlay */}
      <div className="relative aspect-4/3 overflow-hidden w-full">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">No Cover Image</span>
          </div>
        )}
        {/* Gradient overlay similar to design */}
        <div className="absolute inset-0 bg-linear-to-t from-[#12100B] via-[#12100B]/50 to-transparent opacity-90" />

        {/* Title placed at the bottom of the image area */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-3">
          <h3 className="text-xl md:text-2xl font-serif text-primary mb-1 uppercase tracking-wider font-bold drop-shadow-md">
            {title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col grow p-5 pt-3">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
            <span>{formatDate(event.start_date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="line-clamp-1">{venueName}</span>
          </div>
        </div>

        {/* Footer with Price and Button */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              {t('events.from', 'FROM')}
            </span>
            <span className="text-lg font-serif text-primary font-bold">
              ${event.starting_price}
            </span>
          </div>

          <Link
            to={`/events/${event.slug}`}
            className="bg-[#D4AF37] hover:bg-[#B8860B] text-black font-medium py-2 px-6 rounded-sm text-sm uppercase tracking-wider transition-colors duration-300"
          >
            {t('events.bookNow', 'BOOK NOW')}
          </Link>
        </div>
      </div>
    </div>
  );
};
