
import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import { routes } from './routes';

export const buildFastifyApp = (): FastifyInstance => {
  const fastify = Fastify({
    logger: {
      level: 'info',
    }
  })

  // Prisma lives on server requests
  fastify.register(prismaPlugin)

  // Auth user is present on requests
  fastify.register(authPlugin)

  fastify.register(routes)

  fastify.get('/health', (_, reply) => {
    return reply.code(200).send({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  })

  return fastify
}
