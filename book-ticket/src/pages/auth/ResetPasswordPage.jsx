import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { resetPasswordSchema } from '../../lib/validations/authSchemas';
import { FormInput } from '../../components/ui/FormInput';
import { FormButton } from '../../components/ui/FormButton';
import { supabase } from '../../lib/supabaseClient';

export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    // Supabase extracts the token hash from the URL automatically
    // We just need to check if there's a valid session after it processes it
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setServerError(t('auth.invalidResetLink', 'Invalid or expired reset link.'));
      }
      setIsVerifying(false);
    };
    
    checkSession();
  }, [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    const { error } = await updatePassword(data.password);
    
    if (error) {
      setServerError(error.message);
    } else {
      // Password updated successfully
      navigate('/', { replace: true });
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (serverError && !isVerifying && serverError.includes('expired')) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-2xl font-bold font-sans text-destructive mb-2">
            {t('auth.linkExpired', 'Link Expired')}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {serverError}
          </p>
        </div>
        <NavLink 
          to="/forgot-password"
          className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded py-2 mt-4"
        >
          {t('auth.requestNewLink', 'Request new link')}
        </NavLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-sans text-primary mb-2">
          {t('auth.setNewPassword', 'Set New Password')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.setNewPasswordSubtitle', 'Please enter your new password.')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
            {serverError}
          </div>
        )}

        <FormInput
          label={t('auth.newPassword', 'New Password')}
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
          {t('auth.updatePasswordButton', 'Update Password')}
        </FormButton>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
