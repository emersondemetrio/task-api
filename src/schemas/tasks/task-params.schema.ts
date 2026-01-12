import { z } from 'zod';

export const taskParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export type TaskParams = z.infer<typeof taskParamsSchema>;
