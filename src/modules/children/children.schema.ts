import { z } from 'zod';

export const createChildSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Name is required')
    .max(30, 'Name too long'),
  avatar_id: z.string().optional(),
  birth_year: z
    .number()
    .int()
    .min(2015, 'Invalid birth year')
    .max(new Date().getFullYear(), 'Invalid birth year')
    .optional(),
});

export const updateChildSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Name is required')
    .max(30, 'Name too long')
    .optional(),
  avatar_id: z.string().optional(),
  birth_year: z
    .number()
    .int()
    .min(2015, 'Invalid birth year')
    .max(new Date().getFullYear(), 'Invalid birth year')
    .optional(),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;