import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { forgotPasswordSchema } from '../../lib/validations/authSchemas';
import { FormInput } from '../../components/ui/FormInput';
import { FormButton } from '../../components/ui/FormButton';

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    const { error } = await resetPassword(data.email);
    
    if (error) {
      setServerError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-2xl font-bold font-sans text-primary mb-2">
            {t('auth.checkEmailTitle', 'Check your email')}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('auth.resetLinkSent', 'We have sent a password reset link to your email.')}
          </p>
        </div>
        <NavLink 
          to="/login"
          className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded py-2 mt-4"
        >
          {t('auth.backToLogin', 'Back to login')}
        </NavLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-sans text-primary mb-2">
          {t('auth.forgotPasswordTitle', 'Reset Password')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.forgotPasswordSubtitle', "Enter your email and we'll send you a link to reset your password.")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
            {serverError}
          </div>
        )}

        <FormInput
          label={t('auth.email', 'Email Address')}
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          error={errors.email?.message ? t(errors.email.message) : ''}
          {...register('email')}
        />

        <FormButton type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          {t('auth.sendResetLink', 'Send Reset Link')}
        </FormButton>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <NavLink 
          to="/login" 
          className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          {t('auth.backToLogin', 'Back to login')}
        </NavLink>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
