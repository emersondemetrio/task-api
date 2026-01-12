
import 'dotenv/config';
import Fastify, { FastifyInstance, FastifyLoggerOptions } from 'fastify';
import prismaPlugin from './plugins/prisma';
import authPlugin from './plugins/auth';
import { routes } from './routes';

const loggerSettings = {
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    }
  } : undefined
}

export const buildFastifyApp = (
  logger: FastifyLoggerOptions = loggerSettings
): FastifyInstance => {
  const fastify = Fastify({
    logger
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
