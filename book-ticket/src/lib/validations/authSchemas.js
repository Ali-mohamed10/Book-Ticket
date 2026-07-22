/**
 * Authentication Validation Schemas
 *
 * Purpose: Zod schemas for all auth forms.
 * Used with React Hook Form via @hookform/resolvers.
 *
 * Dependencies: zod
 */
import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
  password: z
    .string()
    .min(1, 'validation.passwordRequired'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'validation.fullNameMin'),
    phone: z
      .string()
      .min(10, 'validation.phoneMin')
      .max(15, 'validation.phoneMax')
      .regex(/^\+?[0-9]+$/, 'validation.phoneInvalid'),
    email: z
      .string()
      .min(1, 'validation.emailRequired')
      .email('validation.emailInvalid'),
    password: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(/[A-Z]/, 'validation.passwordUppercase')
      .regex(/[a-z]/, 'validation.passwordLowercase')
      .regex(/[0-9]/, 'validation.passwordNumber'),
    confirmPassword: z
      .string()
      .min(1, 'validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsMismatch',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'validation.passwordMin')
      .regex(/[A-Z]/, 'validation.passwordUppercase')
      .regex(/[a-z]/, 'validation.passwordLowercase')
      .regex(/[0-9]/, 'validation.passwordNumber'),
    confirmPassword: z
      .string()
      .min(1, 'validation.confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsMismatch',
    path: ['confirmPassword'],
  });
