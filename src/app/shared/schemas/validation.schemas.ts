import z from 'zod';

/**
 * Shared password validation schema
 * Requires minimum 4 characters
 */
export const passwordSchema = z
  .string()
  .min(4, 'Password must be at least 4 characters');

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

/**
 * Password change schema with confirmation
 */
export const passwordChangeSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});
