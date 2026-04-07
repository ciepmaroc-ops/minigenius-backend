import { z } from 'zod';

export const startSessionSchema = z.object({
  child_id: z.string().uuid('Invalid child ID'),
  activity_id: z.string().uuid('Invalid activity ID'),
});

export const updateSessionSchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
  max_score: z.number().int().min(0).optional(),
  duration_seconds: z.number().int().min(0).optional(),
  completion_status: z
    .enum(['in_progress', 'completed', 'abandoned'])
    .optional(),
});

export const completeSessionSchema = z.object({
  score: z.number().int().min(0).max(100),
  max_score: z.number().int().min(0),
  duration_seconds: z.number().int().min(0),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;