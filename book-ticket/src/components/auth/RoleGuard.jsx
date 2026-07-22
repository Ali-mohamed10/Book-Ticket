/**
 * RoleGuard
 *
 * Purpose: Restricts routes to specific roles (e.g. admin).
 * Redirects unauthorized users to /unauthorized.
 *
 * Dependencies: useAuth
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || !allowedRoles.includes(profile.role) || profile.status === 'suspended') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
