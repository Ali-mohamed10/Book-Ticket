import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../lib/validations/authSchemas';
import { FormInput } from '../../components/ui/FormInput';
import { FormButton } from '../../components/ui/FormButton';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setServerError(t('auth.invalidCredentials', 'Invalid email or password.'));
      } else {
        setServerError(error.message);
      }
    }
    // Success is handled by AuthContext + GuestRoute redirecting to /
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-sans text-primary mb-2">
          {t('auth.loginTitle', 'Welcome Back')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.loginSubtitle', 'Sign in to your account to continue')}
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

        <FormInput
          label={
            <div className="flex items-center justify-between w-full">
              <span>{t('auth.password', 'Password')}</span>
              <NavLink 
                to="/forgot-password" 
                className="text-xs font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
              >
                {t('auth.forgotPasswordLink', 'Forgot password?')}
              </NavLink>
            </div>
          }
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password?.message ? t(errors.password.message) : ''}
          {...register('password')}
        />

        <FormButton type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          {t('auth.loginButton', 'Sign In')}
        </FormButton>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        {t('auth.noAccount', "Don't have an account?")}{' '}
        <NavLink 
          to="/register" 
          className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          {t('auth.registerLink', 'Sign up')}
        </NavLink>
      </div>
    </div>
  );
};

export default LoginPage;
