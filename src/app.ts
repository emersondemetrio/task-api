
import Fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify';
import prismaPlugin from './plugins/prisma'
import { createTask, getAllTasks, getTaskById } from './routes/tasks/handlers';
import 'dotenv/config';

const taskRouter: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', getAllTasks)
  fastify.post('/', createTask)
  fastify.get('/:id', getTaskById)
}

export const buildFastifyApp = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      level: 'info',
    }
  })

  fastify.register(prismaPlugin)

  fastify.register(taskRouter, {
    prefix: '/tasks'
  })

  fastify.get('/health', (request, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  })

  return fastify
}
