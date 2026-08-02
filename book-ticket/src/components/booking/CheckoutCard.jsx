/**
 * CheckoutCard
 *
 * Purpose: Checkout form UI for the Event Details page.
 *          Collects user info and creates a Stripe Checkout session.
 * Inputs: eventId, selectedTables, grandTotal, currency, disabled
 * Output: Rendered checkout form with Stripe redirect
 * Dependencies: react-hook-form, zod, react-i18next, useAuth, useCreateCheckout
 */
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCreateCheckout } from '../../hooks/useBooking';
import { isValidPhoneNumber } from 'libphonenumber-js';
import PhoneInput from '../common/PhoneInput';

// Checkout form validation schema
const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().refine((val) => {
    try {
      return isValidPhoneNumber(val);
    } catch {
      return false;
    }
  }, 'Invalid phone number'),
});

const CheckoutCard = memo(({ eventId, selectedTables = [], grandTotal = 0, currency = 'CAD', disabled = false }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const createCheckoutMutation = useCreateCheckout();

  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
    },
  });

  // Handle form submission & Stripe redirect
  const onSubmit = async (data) => {
    setServerError(null);

    if (!selectedTables || selectedTables.length === 0) {
      setServerError(t('checkout.noTablesSelected', 'Please select at least one table.'));
      return;
    }

    const tableSelections = selectedTables.map((tbl) => ({
      table_id: tbl.id || tbl.db_id,
      seats_count: tbl.selectedSeatsCount || 1,
    }));

    try {
      const response = await createCheckoutMutation.mutateAsync({
        eventId,
        userId: user?.id || null,
        customerName: data.fullName,
        customerEmail: data.email,
        customerPhone: data.phone,
        tableSelections,
      });

      if (response?.checkoutUrl) {
        // Redirect user to Stripe Checkout
        window.location.href = response.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err?.response?.data?.error || err?.message || 'Failed to initiate checkout. Table might already be reserved.';
      setServerError(msg);
    }
  };

  const isSubmitting = createCheckoutMutation.isPending;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-bold font-sans text-lg text-foreground uppercase tracking-wider">
          {t('checkout.title', 'Checkout')}
        </h3>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mx-5 mt-4 p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('checkout.fullName', 'Full Name')}
          </label>
          <input
            type="text"
            {...register('fullName')}
            placeholder={t('checkout.fullNamePlaceholder', 'Enter your full name')}
            className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
          {errors.fullName && (
            <span className="text-xs text-destructive">{errors.fullName.message}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('checkout.emailAddress', 'Email Address')}
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder={t('checkout.emailPlaceholder', 'Enter your email address')}
            className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
          {errors.email && (
            <span className="text-xs text-destructive">{errors.email.message}</span>
          )}
        </div>

        {/* Phone */}
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('checkout.phoneNumber', 'Phone Number')}
              </label>
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                placeholder={t('checkout.phonePlaceholder', '+1 234 567 8900')}
                error={errors.phone?.message}
                disabled={disabled || isSubmitting}
              />
            </div>
          )}
        />

        {/* Payment method (visual only - Stripe handles card fields) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('checkout.paymentMethod', 'Payment Method')}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-background border border-input rounded-md px-3 py-2.5 text-sm text-muted-foreground/50 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span>{t('checkout.cardNumber', 'Stripe Hosted Checkout')}</span>
            </div>
          </div>
        </div>

        {/* Pay button */}
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('checkout.processing', 'Reserving seats...')}</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>
                {t('checkout.payButton', 'PAY ${{amount}} CAD', { amount: grandTotal.toFixed(2) })}
              </span>
            </>
          )}
        </button>

        {/* Security badges */}
        <div className="flex flex-col items-center gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>
              {t('checkout.secureCheckout', 'Secure Checkout powered by')}{' '}
              <span className="font-bold text-foreground">stripe</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>{t('checkout.securePayment', '100% secure payment')}</span>
          </div>
        </div>
      </form>
    </div>
  );
});

CheckoutCard.displayName = 'CheckoutCard';
export { CheckoutCard };
