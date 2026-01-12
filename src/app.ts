
import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import prismaPlugin from './plugins/prisma';
import { routes } from './routes';

export const buildFastifyApp = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      level: 'info',
    }
  })

  fastify.register(prismaPlugin)

  fastify.register(routes)

  fastify.get('/health', (_, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  })

  return fastify
}
