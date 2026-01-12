import fastify from 'fastify';
import prismaPlugin from './plugins/prisma'

const server = fastify({
  logger: {
    level: 'info',
  }
})

server.register(prismaPlugin)

server.get('/tasks', async (request, reply) => {
  const tasks = await request.server.prisma.task.findMany()
  return reply.code(200).send(tasks)
})

server.listen({ port: 4000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
