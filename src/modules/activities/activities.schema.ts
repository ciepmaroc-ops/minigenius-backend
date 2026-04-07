import { z } from 'zod';

export const listActivitiesSchema = z.object({
  category: z.string().optional(),
  required_plan: z.enum(['free', 'premium']).optional(),
  limit: z.string().default('20'),
  offset: z.string().default('0'),
});

export type ListActivitiesInput = z.infer<typeof listActivitiesSchema>;