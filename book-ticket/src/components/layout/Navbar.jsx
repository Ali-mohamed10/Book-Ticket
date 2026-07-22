import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, canAccessDashboard, profile, user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fullName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const displayLetter = fullName.charAt(0).toUpperCase();
  const displayName = fullName !== 'User' 
    ? fullName.trim().split(/\s+/).slice(0, 2).join(' ') 
    : 'User';

  const navLinks = [
    { name: t('nav.events'), path: '/' },
    { name: t('nav.howItWorks'), path: '/how-it-works' },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMobileMenu();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo onClick={closeMobileMenu} />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1 ${
                  isActive ? 'text-primary' : 'text-foreground/80'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4 ml-2">
              {canAccessDashboard && (
                <NavLink
                  to="/admin"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t('nav.dashboard', 'Dashboard')}
                </NavLink>
              )}
              <div className="group relative flex items-center gap-2 text-sm font-medium text-foreground cursor-default">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold font-sans">
                  {displayLetter}
                </div>
                <span className="max-w-25 truncate">{displayName}</span>
                
                {/* Email Tooltip on Hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md border border-border">
                  {profile?.email || user?.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors focus:outline-none focus:ring-2 focus:ring-destructive rounded-md"
                aria-label="Sign out"
                title={t('auth.signOut', 'Sign out')}
              >
                <LogOut className="w-5 h-5" />
            </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ml-2"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{t('nav.login')}</span>
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded-md hover:bg-secondary transition-colors"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden absolute top-16 left-0 w-full bg-background border-b border-border transition-all duration-300 ease-in-out overflow-hidden shadow-lg ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col p-4 gap-2" aria-label="Mobile Navigation">
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-secondary/20 rounded-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold font-sans">
                {displayLetter}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{displayName}</span>
                <span className="text-xs text-muted-foreground">{profile?.email || user?.email}</span>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block font-medium transition-colors hover:text-primary px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                  isActive ? 'text-primary bg-secondary/30' : 'text-foreground'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          
          {canAccessDashboard && (
            <NavLink
              to="/admin"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 font-medium transition-colors hover:text-primary px-4 py-3 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <LayoutDashboard className="w-5 h-5 text-primary" />
              {t('nav.dashboard', 'Dashboard')}
            </NavLink>
          )}

          <div className="flex items-center justify-between px-4 py-4 mt-2 border-t border-border">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-3 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('auth.signOut', 'Sign out')}</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background mt-2"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{t('nav.login')}</span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
};
