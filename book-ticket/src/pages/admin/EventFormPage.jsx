import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { eventSchema } from '../../utils/eventSchema';
import { 
  useEvent, 
  useCreateEvent, 
  useUpdateEvent, 
  useUploadEventCover 
} from '../../hooks/useEvents';
import { 
  useCategories 
} from '../../hooks/useLookups';
import { useSeatMaps } from '../../hooks/useSeatMaps';

import { FormInput } from '../../components/ui/FormInput';
import { FormSelect } from '../../components/ui/FormSelect';
import { FormTextarea } from '../../components/ui/FormTextarea';
import { ImageUpload } from '../../components/ui/ImageUpload';

export const EventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const isEditing = !!id;

  // Data Fetching
  const { data: event, isLoading: isLoadingEvent } = useEvent(id);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: seatMaps, isLoading: isLoadingSeatMaps } = useSeatMaps();

  // Mutations
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const uploadMutation = useUploadEventCover();

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: 'draft',
      currency: 'CAD',
      starting_price: 0,
    }
  });

  const watchTitleEn = watch('title_en');
  const watchCoverImage = watch('cover_image_url');

  // Debounce ref for localStorage saves
  const saveTimerRef = useRef(null);

  // Load draft from localStorage on mount (only for creating new events)
  useEffect(() => {
    if (!isEditing) {
      const savedDraft = localStorage.getItem('event_form_draft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === 'object') {
            // Sanitize UUID fields to prevent legacy or corrupt drafts from breaking form validation
            const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            if (parsed.seat_map_id && !uuidRegex.test(parsed.seat_map_id)) {
              delete parsed.seat_map_id;
            }
            if (parsed.category_id && !uuidRegex.test(parsed.category_id)) {
              delete parsed.category_id;
            }
            reset(parsed);
          }
        } catch (e) {
          console.error('Failed to parse draft from localStorage', e);
        }
      }
    }
  }, [isEditing, reset]);

  // Save form draft to localStorage via subscription (debounced)
  useEffect(() => {
    if (isEditing) return;

    const subscription = watch((values) => {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        localStorage.setItem('event_form_draft', JSON.stringify(values));
      }, 500);
    });

    return () => {
      clearTimeout(saveTimerRef.current);
      subscription.unsubscribe();
    };
  }, [watch, isEditing]);

  // Auto-generate slug from title if it's empty and we're not editing
  useEffect(() => {
    if (!isEditing && watchTitleEn) {
      const generatedSlug = watchTitleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [watchTitleEn, isEditing, setValue]);

  // Load existing event data
  useEffect(() => {
    if (event && isEditing) {
      // Set simple fields
      Object.keys(event).forEach(key => {
        if (key !== 'categories' && key !== 'seat_maps') {
          // Format dates for local datetime-local input
          if (['start_date', 'end_date'].includes(key) && event[key]) {
            const d = new Date(event[key]);
            const tzOffset = d.getTimezoneOffset() * 60000;
            const dateStr = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
            setValue(key, dateStr);
          } else {
            setValue(key, event[key]);
          }
        }
      });
    }
  }, [event, isEditing, setValue]);

  const handleImageUpload = async (file) => {
    try {
      const url = await uploadMutation.mutateAsync(file);
      setValue('cover_image_url', url, { shouldValidate: true });
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(t('admin.events.uploadError', 'Failed to upload image. Please try again.'));
    }
  };

  const onSubmit = async (data) => {
    try {
      // Format dates back to ISO strings
      const formattedData = { ...data };
      ['start_date', 'end_date'].forEach(key => {
        if (formattedData[key]) {
          formattedData[key] = new Date(formattedData[key]).toISOString();
        } else {
          formattedData[key] = null;
        }
      });

      if (isEditing) {
        await updateMutation.mutateAsync({ id, data: formattedData });
      } else {
        await createMutation.mutateAsync(formattedData);
        // Clear draft after successful creation
        localStorage.removeItem('event_form_draft');
      }
      
      navigate('/admin/events');
    } catch (err) {
      console.error('Failed to save event:', err);
      alert(err.message || t('admin.events.saveError', 'Failed to save event.'));
    }
  };

  if (isEditing && isLoadingEvent) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLoadingData = isLoadingCategories || isLoadingSeatMaps;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <button 
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
          title={t('admin.events.backToList', 'Back to List')}
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-sans text-primary">
            {isEditing 
              ? t('admin.events.editTitle', 'Edit Event') 
              : t('admin.events.createTitle', 'Create New Event')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? event?.title_en : t('admin.events.createSubtitle', 'Fill in the details for the new event')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="grow space-y-8">
          
          {/* Basic Info Section */}
          <section className="bg-secondary/5 border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4">
              {t('admin.events.sectionBasic', 'Basic Information')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t('admin.events.titleEn', 'Title (English)') + ' *'}
                {...register('title_en')}
                error={errors.title_en?.message}
                placeholder="e.g. The Titan Edition"
              />
              <FormInput
                label={t('admin.events.titleAr', 'Title (Arabic)')}
                {...register('title_ar')}
                error={errors.title_ar?.message}
                placeholder="مثال: نسخة التايتان"
                dir="rtl"
              />
            </div>
            <input type="hidden" {...register('slug')} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea
                label={t('admin.events.descEn', 'Description (English)')}
                {...register('description_en')}
                error={errors.description_en?.message}
                placeholder="Event description in English..."
              />
              <FormTextarea
                label={t('admin.events.descAr', 'Description (Arabic)')}
                {...register('description_ar')}
                error={errors.description_ar?.message}
                placeholder="وصف الفعالية بالعربية..."
                dir="rtl"
              />
            </div>
          </section>

          {/* Location Section */}
          <section className="bg-secondary/5 border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4">
              {t('admin.events.sectionLocation', 'Location & Category')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t('admin.events.countryEn', 'Country (English)') + ' *'}
                {...register('country_en')}
                error={errors.country_en?.message}
                placeholder="e.g. Canada"
              />
              <FormInput
                label={t('admin.events.countryAr', 'Country (Arabic)')}
                {...register('country_ar')}
                error={errors.country_ar?.message}
                placeholder="مثال: كندا"
                dir="rtl"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t('admin.events.cityEn', 'City (English)') + ' *'}
                {...register('city_en')}
                error={errors.city_en?.message}
                placeholder="e.g. Windsor"
              />
              <FormInput
                label={t('admin.events.cityAr', 'City (Arabic)')}
                {...register('city_ar')}
                error={errors.city_ar?.message}
                placeholder="مثال: ويندزر"
                dir="rtl"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label={t('admin.events.venueEn', 'Venue (English)') + ' *'}
                {...register('venue_en')}
                error={errors.venue_en?.message}
                placeholder="e.g. NAI Restaurant Windsor"
              />
              <FormInput
                label={t('admin.events.venueAr', 'Venue (Arabic)')}
                {...register('venue_ar')}
                error={errors.venue_ar?.message}
                placeholder="مثال: مطعم ناي ويندزر"
                dir="rtl"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label={t('admin.events.category', 'Category') + ' *'}
                {...register('category_id')}
                error={errors.category_id?.message}
              >
                <option value="">{t('admin.events.selectCategory', 'Select Category')}</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{isArabic ? c.name_ar : c.name_en}</option>
                ))}
              </FormSelect>
            </div>
          </section>
          
          {/* Schedule Section */}
          <section className="bg-secondary/5 border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4">
              {t('admin.events.sectionSchedule', 'Schedule')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                type="datetime-local"
                label={t('admin.events.startDate', 'Start Date & Time') + ' *'}
                {...register('start_date')}
                error={errors.start_date?.message}
              />
              <FormInput
                type="datetime-local"
                label={t('admin.events.endDate', 'End Date & Time') + ' *'}
                {...register('end_date')}
                error={errors.end_date?.message}
              />
            </div>
          </section>

          {/* Ticketing Section */}
          <section className="bg-secondary/5 border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4">
              {t('admin.events.sectionTicketing', 'Ticketing & Seating')}
            </h2>
            
            <FormSelect
              label={t('admin.events.seatMap', 'Seat Map') + ' *'}
              {...register('seat_map_id')}
              error={errors.seat_map_id?.message}
            >
              <option value="">{t('admin.events.selectSeatMap', 'Select Seat Map')}</option>
              {seatMaps?.map(map => (
                <option key={map.id} value={map.id}>{map.name}</option>
              ))}
            </FormSelect>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                type="number"
                min="0"
                step="0.01"
                label={t('admin.events.startingPrice', 'Starting Price')}
                {...register('starting_price')}
                error={errors.starting_price?.message}
              />
              <FormInput
                label={t('admin.events.currency', 'Currency')}
                {...register('currency')}
                error={errors.currency?.message}
                placeholder="CAD"
              />
            </div>
          </section>

        </div>

        {/* Sidebar Area */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* Status Panel */}
          <div className="bg-background border border-border p-6 rounded-lg space-y-4 sticky top-15 z-10">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4">
              {t('admin.events.sectionPublishing', 'Publishing')}
            </h2>
            
            <FormSelect
              label={t('admin.events.status', 'Event Status')}
              {...register('status')}
              error={errors.status?.message}
            >
              <option value="draft">{t('admin.events.statusDraft', 'Draft')}</option>
              <option value="published">{t('admin.events.statusPublished', 'Published')}</option>
              <option value="cancelled">{t('admin.events.statusCancelled', 'Cancelled')}</option>
              <option value="completed">{t('admin.events.statusCompleted', 'Completed')}</option>
            </FormSelect>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 py-3 rounded-md font-bold transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEditing 
                ? t('admin.events.saveChanges', 'Save Changes') 
                : t('admin.events.createEvent', 'Create Event')}
            </button>
          </div>
          
          {/* Cover Image Panel */}
          <div className="bg-secondary/5 border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              {t('admin.events.sectionMedia', 'Media')}
            </h2>
            
            <ImageUpload
              label={t('admin.events.coverImage', 'Cover Image')}
              value={watchCoverImage}
              onChange={(val) => setValue('cover_image_url', val, { shouldValidate: true })}
              onUpload={handleImageUpload}
              isUploading={uploadMutation.isPending}
              error={errors.cover_image_url?.message}
            />
          </div>

          {/* SEO Panel */}
          <div className="bg-secondary/5 border border-border p-6 rounded-lg space-y-4">
            <h2 className="text-lg font-bold font-sans text-foreground border-b border-border/50 pb-2 mb-4">
              {t('admin.events.sectionSeo', 'SEO')}
            </h2>
            
            <FormInput
              label={t('admin.events.seoTitle', 'SEO Title')}
              {...register('seo_title')}
              error={errors.seo_title?.message}
            />
            
            <FormTextarea
              label={t('admin.events.seoDesc', 'SEO Description')}
              {...register('seo_description')}
              error={errors.seo_description?.message}
              className="min-h-20"
            />
          </div>

        </div>
      </form>
    </div>
  );
};

export default EventFormPage;
