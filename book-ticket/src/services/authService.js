/**
 * Authentication Service
 *
 * Purpose: Encapsulates all Supabase Auth operations.
 * Separates auth business logic from React components.
 *
 * Dependencies: supabaseClient
 */
import { supabase } from '../lib/supabaseClient';

/**
 * Register a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {string} phone
 * @returns {Promise<{data, error}>}
 */
export const signUp = async (email, password, fullName, phone) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone },
    },
  });
  return { data, error };
};

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data, error}>}
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

/**
 * Sign out the current user.
 * @returns {Promise<{error}>}
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Send a password reset email.
 * @param {string} email
 * @returns {Promise<{data, error}>}
 */
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

/**
 * Update the current user's password (after reset).
 * @param {string} newPassword
 * @returns {Promise<{data, error}>}
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

/**
 * Get the current session.
 * @returns {Promise<{data, error}>}
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

/**
 * Fetch the user profile from the profiles table.
 * @param {string} userId
 * @returns {Promise<{data, error}>}
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

/**
 * Update the user profile.
 * @param {string} userId
 * @param {object} updates - { full_name, phone, avatar_url }
 * @returns {Promise<{data, error}>}
 */
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

/**
 * Resend confirmation email.
 * @param {string} email
 * @returns {Promise<{data, error}>}
 */
export const resendConfirmationEmail = async (email) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return { data, error };
};

/**
 * Check if an email exists in the profiles table (using RPC).
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const checkEmailExists = async (email) => {
  const { data, error } = await supabase.rpc('check_email_exists', {
    lookup_email: email
  });
  if (error) return null;
  return !!data;
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
