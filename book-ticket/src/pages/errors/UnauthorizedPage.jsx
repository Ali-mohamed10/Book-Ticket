import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-10 h-10 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-bold font-sans text-foreground mb-4">
        {t('errors.403Title', 'Access Denied')}
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        {t('errors.403Desc', "You don't have permission to access this page. If you believe this is a mistake, please contact support.")}
      </p>
      
      <NavLink
        to="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        {t('errors.backHome', 'Return to Homepage')}
      </NavLink>
    </div>
  );
};

export default UnauthorizedPage;
