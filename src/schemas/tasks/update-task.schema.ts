import { z } from 'zod';

export const taskStatusEnum = z.enum(['todo', 'in_progress', 'done', 'archived']);

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title must be a non-empty string').trim(),
  description: z.string().min(1, 'Description must be a non-empty string').trim(),
  status: taskStatusEnum
});

export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;
