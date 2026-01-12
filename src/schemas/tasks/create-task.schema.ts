import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().min(1, 'Description is required').trim()
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>;
