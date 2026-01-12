import { buildFastifyApp } from '../src/app';
import type { FastifyInstance, FastifyLoggerOptions } from 'fastify';

export const createTestServer = async (
  logger: FastifyLoggerOptions
): Promise<FastifyInstance> => {
  const server = buildFastifyApp(logger);
  await server.ready();
  return server;
};

export const closeTestServer = async (server: FastifyInstance): Promise<void> => {
  await server.close();
};
