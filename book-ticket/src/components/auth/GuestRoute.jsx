/**
 * GuestRoute
 *
 * Purpose: Redirects authenticated users away from login/register pages.
 *
 * Dependencies: useAuth
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
