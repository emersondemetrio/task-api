import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

const AUTHENTICATION_HEADER = 'x-user-id'

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip authentication for health check endpoint
    if (request.url === '/health') {
      return;
    }

    // Get user ID from header
    const userIdHeader = request.headers[AUTHENTICATION_HEADER];

    if (!userIdHeader || typeof userIdHeader !== 'string') {
      request.log.warn('Missing X-User-Id header');
      return reply.code(401).send({ error: 'Authentication required' });
    }

    const userId = Number(userIdHeader);

    if (isNaN(userId) || userId <= 0) {
      request.log.warn({ userIdHeader }, 'Invalid user ID in header');
      return reply.code(401).send({ error: 'Invalid user ID' });
    }

    try {
      // Look up user in database
      const user = await request.server.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        request.log.warn({ userId }, 'User not found');
        return reply.code(401).send({ error: 'User not found' });
      }

      request.user = user;
    } catch (error) {
      request.log.error({ userId, error }, 'Error authenticating user');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default fp(authPlugin);
