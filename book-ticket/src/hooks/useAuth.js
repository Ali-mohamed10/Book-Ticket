/**
 * useAuth Hook
 *
 * Purpose: Convenience hook to consume AuthContext.
 * Throws an error if used outside AuthProvider.
 *
 * Dependencies: AuthContext
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
