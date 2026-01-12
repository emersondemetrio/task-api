import { FastifyReply, FastifyRequest } from "fastify";

export const getAllTasks = async (
  request: FastifyRequest, reply: FastifyReply
) => {
  const tasks = await request.server.prisma.task.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return reply.code(200).send(tasks)
}

export const getTaskById = async (
  request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply
) => {
  if (!request?.params?.id) {
    return reply.code(400).send({
      error: 'Missing id'
    })
  }

  const id = Number(request.params.id)
  const task = await request.server.prisma.task.findUnique({
    where: {
      id
    }
  })

  if (!task) {
    return reply.code(404).send({
      error: 'Task not found'
    })
  }

  return reply.code(200).send(task)
}

export const createTask = async (
  request: FastifyRequest<{
    Body: {
      title: string
      description: string
    }
  }>, reply: FastifyReply
) => {
  const payload = request.body

  const task = await request.server.prisma.task.create({
    data: {
      ...payload,
      creatorId: 1,
      status: 'TODO'
    }
  })

  return reply.code(200).send(task)
}
