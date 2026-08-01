import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Calendar,
  MapPin,
  MoreVertical,
  Globe,
} from 'lucide-react';
import {
  useEvents,
  useDeleteEvent,
  useDuplicateEvent,
  useUpdateEvent,
} from '../../hooks/useEvents';
import { StatusBadge } from '../../components/ui/StatusBadge';
import AppImage from '../../components/common/AppImage';

export const EventsListPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const { data: events, isLoading, error } = useEvents();
  const deleteMutation = useDeleteEvent();
  const duplicateMutation = useDuplicateEvent();
  const updateMutation = useUpdateEvent();

  const filteredEvents = events?.filter((event) => {
    const title = isArabic ? event.title_ar || event.title_en : event.title_en || event.title_ar;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (
      window.confirm(t('admin.events.confirmDelete', 'Are you sure you want to delete this event?'))
    ) {
      try {
        setDeletingId(id);
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Failed to delete event:', err);
        alert(t('admin.events.deleteError', 'Failed to delete event'));
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to duplicate event:', err);
      alert(t('admin.events.duplicateError', 'Failed to duplicate event'));
    }
  };

  const toggleStatus = async (event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await updateMutation.mutateAsync({
        id: event.id,
        data: { status: newStatus },
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(isArabic ? 'ar-EG' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        {t('admin.events.fetchError', 'Failed to load events.')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-primary">
            {t('admin.events.title', 'Events')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin.events.subtitle', 'Manage your upcoming events')}
          </p>
        </div>
        <Link
          to="/admin/events/create"
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin.events.createNew', 'Create Event')}
        </Link>
      </div>

      {/* Filters section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-secondary/10 p-4 rounded-lg border border-border">
        <div className="relative grow">
          <Search
            className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`}
          />
          <input
            type="text"
            placeholder={t('admin.events.search', 'Search events...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-background border border-border rounded-md py-2 ${isArabic ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-background border border-border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:w-48"
        >
          <option value="all">{t('admin.events.statusAll', 'All Statuses')}</option>
          <option value="draft">{t('admin.events.statusDraft', 'Draft')}</option>
          <option value="published">{t('admin.events.statusPublished', 'Published')}</option>
          <option value="cancelled">{t('admin.events.statusCancelled', 'Cancelled')}</option>
          <option value="completed">{t('admin.events.statusCompleted', 'Completed')}</option>
        </select>
      </div>

      {/* Events Grid */}
      {filteredEvents?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-secondary/10 border border-border rounded-lg border-dashed">
          <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            {t('admin.events.noEvents', 'No events found')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all'
              ? t('admin.events.adjustFilters', 'Try adjusting your filters')
              : t('admin.events.createFirst', 'Get started by creating your first event')}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link
              to="/admin/events/create"
              className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('admin.events.createNew', 'Create Event')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents?.map((event) => {
            const title = isArabic
              ? event.title_ar || event.title_en
              : event.title_en || event.title_ar;
            const venueName = isArabic
              ? event.venue_ar || event.venue_en
              : event.venue_en || event.venue_ar;
            const isDeleting = deletingId === event.id;

            return (
              <div
                key={event.id}
                onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                className={`bg-secondary/5 border border-primary/50 rounded-lg overflow-hidden transition-all hover:border-primary/30 flex flex-col cursor-pointer group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="relative aspect-video bg-muted border-b border-border">
                  {event.cover_image_url ? (
                    <AppImage
                      src={event.cover_image_url}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      containerClassName="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-xs">{t('admin.events.noImage', 'No Image')}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={event.status} />
                  </div>
                </div>

                <div className="p-4 grow flex flex-col">
                  <h3 className="font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors" title={title}>
                    {title}
                  </h3>

                  <div className="space-y-2 mt-auto mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 shrink-0 text-primary/70" />
                      <span className="line-clamp-1">
                        {formatDate(event.start_date)} - {formatDate(event.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
                      <span className="line-clamp-1">
                        {venueName || t('admin.events.noVenue', 'No Venue')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(event);
                      }}
                      className={`text-xs px-2 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                        event.status === 'published'
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                          : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                      }`}
                      disabled={updateMutation.isPending}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      {event.status === 'published'
                        ? t('admin.events.actionUnpublish', 'Unpublish')
                        : t('admin.events.actionPublish', 'Publish')}
                    </button>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(event.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                        title={t('admin.events.duplicate', 'Duplicate')}
                        disabled={duplicateMutation.isPending}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(event.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title={t('admin.events.edit', 'Edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(event.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title={t('admin.events.delete', 'Delete')}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Internal icon component used as fallback
function ImageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export default EventsListPage;
