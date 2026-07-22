import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { Logo } from '../components/ui/Logo';

export const AuthLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Minimal Header */}
      <header className="w-full p-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-secondary/10 border border-border rounded-xl shadow-lg p-6 md:p-8 backdrop-blur-sm">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <NavLink to="/" className="hover:text-primary transition-colors">
          {t('auth.backToHome', 'Back to Home')}
        </NavLink>
      </footer>
    </div>
  );
};
