import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold font-sans text-primary">
          {t('admin.title', 'Dashboard')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('admin.welcomeUser', 'Welcome back, {{name}}! You are logged in as {{role}}.', {
            name: profile?.full_name,
            role: profile?.role
          })}
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-6 bg-secondary/10 border border-border rounded-lg">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t('admin.statsEvents', 'Events Managed')}
          </h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="p-6 bg-secondary/10 border border-border rounded-lg">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t('admin.statsBookings', 'Total Bookings')}
          </h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>
        <div className="p-6 bg-secondary/10 border border-border rounded-lg">
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t('admin.statsRevenue', 'Total Revenue')}
          </h3>
          <p className="text-3xl font-bold text-primary">$0.00</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
