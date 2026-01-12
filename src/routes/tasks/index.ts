import { FastifyPluginAsync } from 'fastify';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
} from './handlers';
import {
  createTaskSchema,
  updateTaskSchema,
  patchTaskSchema,
  taskParamsSchema,
} from '../../schemas/tasks';
import { zodToFastifySchema } from '../../schemas/utils';
import { requireTaskOwnership } from '../../decorators/authorization';

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  // Tasks are guaranteed to belong to user via where clause
  fastify.get('/', getAllTasks);

  fastify.get('/:id', {
    schema: {
      params: zodToFastifySchema(taskParamsSchema)
    },
    preHandler: requireTaskOwnership
  }, getTaskById);

  fastify.post('/', {
    schema: {
      body: zodToFastifySchema(createTaskSchema)
    }
  }, createTask);

  fastify.put('/:id', {
    schema: {
      params: zodToFastifySchema(taskParamsSchema),
      body: zodToFastifySchema(updateTaskSchema)
    },
    preHandler: requireTaskOwnership
  }, updateTask);

  fastify.patch('/:id', {
    schema: {
      params: zodToFastifySchema(taskParamsSchema),
      body: zodToFastifySchema(patchTaskSchema)
    },
    preHandler: requireTaskOwnership
  }, patchTask);

  fastify.delete('/:id', {
    schema: {
      params: zodToFastifySchema(taskParamsSchema)
    },
    preHandler: requireTaskOwnership
  }, deleteTask);
};
