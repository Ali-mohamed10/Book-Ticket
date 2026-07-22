import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { FormButton } from '../../components/ui/FormButton';

export const EmailVerificationPage = () => {
  const { t } = useTranslation();
  const { resendConfirmation } = useAuth();
  const location = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  
  const email = location.state?.email;

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setMessage('');
    
    const { error } = await resendConfirmation(email);
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(t('auth.resendSuccess', 'Verification email resent successfully.'));
    }
    setIsResending(false);
  };

  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold font-sans text-primary mb-2">
          {t('auth.verifyTitle', 'Check your email')}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('auth.verifySubtitle', 'We sent a verification link to')}
          <br />
          <span className="font-medium text-foreground">{email || t('auth.yourEmail', 'your email address')}</span>
        </p>
      </div>

      {message && (
        <div className={`p-3 border rounded-md text-sm ${
          message.includes('success') 
            ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {message}
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        <FormButton 
          type="button" 
          variant="outline" 
          onClick={handleResend} 
          isLoading={isResending}
          disabled={!email}
          className="w-full"
        >
          {t('auth.resendButton', 'Resend Email')}
        </FormButton>
        
        <NavLink 
          to="/login"
          className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded py-2"
        >
          {t('auth.backToLogin', 'Back to login')}
        </NavLink>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
