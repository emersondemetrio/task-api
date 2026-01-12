import { FastifyReply, FastifyRequest } from "fastify";

export const getAllTasks = async (
  request: FastifyRequest, reply: FastifyReply
) => {
  // TODO get user from headers
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

export const updateTask = async (
  request: FastifyRequest<{
    Params: {
      id: number
    }
    Body: {
      title: string
      description: string,
      status: any
    }
  }>, reply: FastifyReply
) => {
  const payload = request.body
  const params = request.params

  if (!params?.id) {
    return reply.code(400).send({
      error: 'Missing id'
    })
  }

  const id = params.id;

  const task = await request.server.prisma.task.update({
    where: {
      id
    },
    data: {
      ...payload,
      creatorId: 1, // TODO get from request
      status: 'TODO'
    }
  })

  return reply.code(200).send(task)
}

export const deleteTask = async (
  request: FastifyRequest<{
    Params: {
      id: number
    }
  }>, reply: FastifyReply
) => {
  const params = request.params

  if (!params?.id) {
    return reply.code(400).send({
      error: 'Missing id'
    })
  }

  const id = params.id;

  await request.server.prisma.task.delete({
    where: {
      id
    }
  })

  return reply.code(204).send();
}

