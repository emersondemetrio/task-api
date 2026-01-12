import { FastifyRequest, FastifyReply } from 'fastify';
import type { TaskParams } from '../schemas/tasks';

export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
    task?: {
      id: number;
      title: string;
      description: string;
      status: string;
      creatorId: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}

export const requireTaskOwnership = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  if (!request.user) {
    request.log.warn('Unauthenticated request to protected route');
    return reply.code(401).send({ error: 'Authentication required' });
  }

  const { id } = request.params as TaskParams;

  const task = await request.server.prisma.task.findUnique({
    where: { id, creatorId: request.user.id }
  });

  if (!task) {
    request.log.warn({ id, userId: request.user.id }, 'Task not found or does not belong to user');
    return reply.code(404).send({ error: 'Task not found' });
  }

  // Attach task to request for use in handlers
  request.task = task;
};
