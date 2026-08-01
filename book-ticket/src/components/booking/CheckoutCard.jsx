/**
 * CheckoutCard
 *
 * Purpose: Checkout form UI for the Event Details page.
 *          Collects user info (name, email, phone). No actual Stripe processing.
 * Input: grandTotal, currency, disabled state, onSubmit callback
 * Output: Rendered checkout form
 * Dependencies: react-hook-form, zod, react-i18next, useAuth
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
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

const CheckoutCard = memo(({ grandTotal = 0, currency = 'CAD', disabled = false }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Handle form submission
  const onSubmit = (data) => {
    if (!user) {
      // Redirect unauthenticated users to login with redirect back
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    // Future: Create Stripe checkout session
    console.log('Checkout data:', data);
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-bold font-sans text-lg text-foreground uppercase tracking-wider">
          {t('checkout.title', 'Checkout')}
        </h3>
      </div>

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
                disabled={disabled}
              />
            </div>
          )}
        />

        {/* Payment method (visual only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t('checkout.paymentMethod', 'Payment Method')}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-background border border-input rounded-md px-3 py-2.5 text-sm text-muted-foreground/50 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span>{t('checkout.cardNumber', 'Card Number')}</span>
            </div>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-20 bg-background border border-input rounded-md px-3 py-2.5 text-sm text-muted-foreground/50 focus:outline-none"
              disabled
            />
            <input
              type="text"
              placeholder="CVC"
              className="w-16 bg-background border border-input rounded-md px-3 py-2.5 text-sm text-muted-foreground/50 focus:outline-none"
              disabled
            />
          </div>
        </div>

        {/* Pay button */}
        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          <Lock className="w-4 h-4" />
          {!user
            ? t('checkout.loginRequired', 'Sign in to continue')
            : t('checkout.payButton', 'PAY ${{amount}} CAD', { amount: grandTotal.toFixed(2) })}
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
