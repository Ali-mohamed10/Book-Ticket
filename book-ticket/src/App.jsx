import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import './lib/i18n'; // Initialize i18n

import MainLayout from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { GuestRoute } from './components/auth/GuestRoute';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Lazy load auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'));

// Lazy load admin pages
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));

// Lazy load error pages
const UnauthorizedPage = lazy(() => import('./pages/errors/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public & Protected Routes inside Main Layout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<div className="text-center py-20 text-2xl font-bold font-sans">Welcome to Khaleeji Tour</div>} />
                
                {/* Example of Protected Route
                <Route path="profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } /> 
                */}

                {/* Admin / Dashboard Route */}
                <Route path="admin" element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={['admin', 'editor']}>
                      <DashboardPage />
                    </RoleGuard>
                  </ProtectedRoute>
                } />
                
                {/* Error Pages */}
                <Route path="unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Auth Routes inside Auth Layout */}
              <Route element={<AuthLayout />}>
                <Route path="login" element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                } />
                <Route path="register" element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                } />
                <Route path="forgot-password" element={
                  <GuestRoute>
                    <ForgotPasswordPage />
                  </GuestRoute>
                } />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="verify-email" element={<EmailVerificationPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
