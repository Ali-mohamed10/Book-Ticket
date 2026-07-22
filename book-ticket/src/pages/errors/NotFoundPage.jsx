import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-8xl font-bold font-sans text-primary mb-4 opacity-50">404</h1>
      
      <h2 className="text-3xl font-bold font-sans text-foreground mb-4">
        {t('errors.404Title', 'Page Not Found')}
      </h2>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        {t('errors.404Desc', "We can't seem to find the page you're looking for. It might have been removed or doesn't exist.")}
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

export default NotFoundPage;
