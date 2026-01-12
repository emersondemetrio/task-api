import { FastifyPluginAsync } from 'fastify';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from './handlers';
import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
} from '../../schemas/tasks';
import { zodToFastifySchema } from '../../schemas/utils';

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', getAllTasks);

  fastify.get('/:id', {
    schema: {
      params: zodToFastifySchema(taskParamsSchema)
    },
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

  }, updateTask);

  // TODO add patch

  fastify.delete('/:id', {
    schema: {
      params: zodToFastifySchema(taskParamsSchema)
    },
  }, deleteTask);
};
