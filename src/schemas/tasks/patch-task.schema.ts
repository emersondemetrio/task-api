import { z } from 'zod';
import { taskStatusEnum } from './update-task.schema';

export const patchTaskSchema = z.object({
  title: z.string().min(1, 'Title must be a non-empty string').trim().optional(),
  description: z.string().min(1, 'Description must be a non-empty string').trim().optional(),
  status: taskStatusEnum.optional()
})
  .refine((data) => {
    return !!data.title || !!data.description || !!data.status
  },
    {
      message: 'At least one field (title, description, or status) must be provided'
    }
  );

export type PatchTaskBody = z.infer<typeof patchTaskSchema>;
