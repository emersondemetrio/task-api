import { FastifyPluginAsync } from 'fastify';
import { taskRoutes } from './tasks';

export const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(taskRoutes, { prefix: '/tasks' });
};
