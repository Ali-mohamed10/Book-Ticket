import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdminLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t('admin.title', 'Overview'), path: '/admin', exact: true },
    { name: t('admin.events.title', 'Events'), path: '/admin/events' },
    { name: t('admin.seatMaps.title', 'Seat Maps'), path: '/admin/seat-maps' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in-up">
      {/* Admin Navigation */}
      <nav className="flex gap-4 border-b border-border pb-4 overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Content */}
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
