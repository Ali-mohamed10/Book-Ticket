import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema } from '../../lib/validations/authSchemas';
import { FormInput } from '../../components/ui/FormInput';
import { FormButton } from '../../components/ui/FormButton';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    const { error } = await signUp(data.email, data.password, data.fullName);
    
    if (error) {
      if (error.message.includes('User already registered')) {
        setServerError(t('auth.emailExists', 'This email is already registered.'));
      } else {
        setServerError(error.message);
      }
    } else {
      // If email confirmations are enabled in Supabase, the user is created
      // but not logged in. Redirect to verification page.
      navigate('/verify-email', { state: { email: data.email } });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-sans text-primary mb-2">
          {t('auth.registerTitle', 'Create an Account')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.registerSubtitle', 'Join Khaleeji Tour for the best events')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
            {serverError}
          </div>
        )}

        <FormInput
          label={t('auth.fullName', 'Full Name')}
          type="text"
          placeholder={t('auth.fullNamePlaceholder', 'John Doe')}
          icon={User}
          error={errors.fullName?.message ? t(errors.fullName.message) : ''}
          {...register('fullName')}
        />

        <FormInput
          label={t('auth.email', 'Email Address')}
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          error={errors.email?.message ? t(errors.email.message) : ''}
          {...register('email')}
        />

        <FormInput
          label={t('auth.password', 'Password')}
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message ? t(errors.password.message) : ''}
          {...register('password')}
        />

        <FormInput
          label={t('auth.confirmPassword', 'Confirm Password')}
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : ''}
          {...register('confirmPassword')}
        />

        <FormButton type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          {t('auth.registerButton', 'Sign Up')}
        </FormButton>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {t('auth.hasAccount', 'Already have an account?')}{' '}
        <NavLink 
          to="/login" 
          className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          {t('auth.loginLink', 'Sign in')}
        </NavLink>
      </div>
    </div>
  );
};

export default RegisterPage;
