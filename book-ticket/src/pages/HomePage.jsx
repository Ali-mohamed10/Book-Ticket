import { useTranslation } from 'react-i18next';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const { data: events, isLoading, error } = useEvents();

  // Filter only published events for public visitors
  const publishedEvents = events?.filter(event => event.status === 'published') || [];

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-lg max-w-md">
          <h2 className="font-bold text-lg mb-2">{t('common.error', 'Error')}</h2>
          <p className="text-sm">{error.message || t('common.errorLoading', 'Failed to load events. Please try again.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Centered Upcoming Events Header */}
      <div className="flex items-center justify-center gap-4 py-4 select-none">
        <div className="h-px w-12 md:w-20 bg-primary/40" />
        <h2 className="text-xl md:text-2xl lg:text-3xl font-serif text-[#F7F1E8] tracking-widest font-extrabold uppercase text-center flex items-center gap-2">
          {t('home.upcomingEvents', 'Upcoming Events')}
        </h2>
        <div className="h-px w-12 md:w-20 bg-primary/40" />
      </div>

      {isLoading ? (
        /* Premium Skeleton Loader */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl border border-border bg-secondary/10 overflow-hidden flex flex-col h-100 animate-pulse">
              <div className="aspect-4/3 bg-secondary/30 w-full" />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-6 bg-secondary/30 rounded w-3/4" />
                  <div className="h-4 bg-secondary/30 rounded w-1/2" />
                </div>
                <div className="h-10 bg-secondary/30 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : publishedEvents.length === 0 ? (
        /* Empty State */
        <div className="min-h-[30vh] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-secondary/5">
          <div className="max-w-md space-y-4">
            <h3 className="text-xl font-bold text-foreground font-sans">
              {t('home.noEvents', 'No events found')}
            </h3>
            <p className="text-sm text-muted-foreground font-sans">
              {t('home.tryLater', 'Check back later for upcoming premium events.')}
            </p>
          </div>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedEvents.map((event) => (
            <div key={event.id} className="animate-fade-in-up">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
