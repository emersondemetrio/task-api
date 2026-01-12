import { z } from 'zod';

/**
 * Converts a Zod schema to JSON Schema format compatible with Fastify
 * Removes the $schema property which Fastify doesn't accept
 */
export const zodToFastifySchema = (schema: z.ZodTypeAny): Record<string, any> => {
  const jsonSchema = schema.toJSONSchema();
  // Remove $schema property as Fastify doesn't accept it
  const { $schema, ...fastifySchema } = jsonSchema;
  return fastifySchema;
};
