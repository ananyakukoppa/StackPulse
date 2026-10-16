import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password must not exceed 100 characters'),
  name: z.string().trim().min(1, 'Name cannot be blank').max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
