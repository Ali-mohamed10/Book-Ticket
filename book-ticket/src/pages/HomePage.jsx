import { useTranslation } from 'react-i18next';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/events/EventCard';
import { Loader2 } from 'lucide-react';

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const { data: events, isLoading, error } = useEvents();
  const isArabic = i18n.language === 'ar';

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
    <div className="space-y-12 pb-16">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-[#12100B] border border-primary/20 p-8 md:p-12 lg:p-16 shadow-premium text-center">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto space-y-6">
          <span className="inline-block text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full animate-fade-in-up">
            {t('welcome', 'Welcome to Khaleeji Tour')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#F7F1E8] tracking-wide font-extrabold leading-tight animate-fade-in-up">
            {t('home.title', 'Exclusive Ticketing, Redefined')}
          </h1>
          <p className="text-base md:text-lg text-[#BDAF9D] leading-relaxed max-w-2xl mx-auto font-sans animate-fade-in-up">
            {t('home.subtitle', 'Discover premium shows, grand concerts, and elite corporate experiences with the ultimate seat selection experience.')}
          </p>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h2 className="text-2xl md:text-3xl font-serif text-primary font-bold">
            {t('home.featuredEvents', 'Featured Events')}
          </h2>
          <span className="text-sm text-muted-foreground font-sans">
            {publishedEvents.length} {publishedEvents.length === 1 ? t('events.oneEvent', 'Event') : t('events.multipleEvents', 'Events')}
          </span>
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
      </section>
    </div>
  );
};

export default HomePage;
