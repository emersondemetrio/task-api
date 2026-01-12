import { FastifyRequest, FastifyReply } from 'fastify';
import { TaskStatus } from '../../../generated/prisma';
import { Prisma } from '../../../generated/prisma';
import type { CreateTaskBody, UpdateTaskBody, PatchTaskBody, TaskParams } from '../../schemas/tasks';

const TASK_STATUS_MAP: Record<string, TaskStatus> = {
  'todo': TaskStatus.TODO,
  'in_progress': TaskStatus.IN_PROGRESS,
  'done': TaskStatus.DONE,
  'archived': TaskStatus.ARCHIVED,
};

export const getAllTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user;

  if (!user) {
    return reply.code(401).send({ error: 'Authentication is required' });
  }

  const tasks = await request.server.prisma.task.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return reply.code(200).send({
    tasks
  });
}

export const getTaskById = async (request: FastifyRequest, reply: FastifyReply) => {
  const task = await request.server.prisma.task.findUnique({
    where: { id: request.task!.id }
  });

  if (!task) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  request.log.debug({ task }, 'Task found');

  return reply.code(200).send(task);
}

export const createTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { title, description } = request.body as CreateTaskBody;

  if (!request.user) {
    return reply.code(401).send({ error: 'Authentication is required' });
  }

  const task = await request.server.prisma.task.create({
    data: {
      title,
      description,
      // Design choice - all tasks are created as TODO
      status: TaskStatus.TODO,
      creatorId: request.user.id,
    }
  });

  request.log.info({ taskId: task.id }, 'Task created');

  return reply.send(task);
}

export const patchTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as TaskParams;

  const { title, description, status } = request.body as PatchTaskBody;

  const updateData: Prisma.TaskUpdateInput = {};

  if (!!title) {
    updateData.title = title;
  }

  if (!!description) {
    updateData.description = description;
  }

  if (!!status) {
    updateData.status = TASK_STATUS_MAP[status] || status as unknown as TaskStatus;
  }

  try {
    const task = await request.server.prisma.task.update({
      where: { id },
      data: updateData,
    });

    request.log.info({ id, updates: { title, description, status } }, 'Task patched');

    return reply.code(200).send(task);
  } catch (error) {
    request.log.error({ id, error }, 'Error patching task');
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export const updateTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as TaskParams;
  const { title, description, status } = request.body as UpdateTaskBody;

  const mappedStatus = TASK_STATUS_MAP[status] || status as unknown as TaskStatus;

  try {
    const task = await request.server.prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status: mappedStatus,
      },
    });

    request.log.info({ id }, 'Task updated (full replacement)');
    return reply.code(200).send(task);
  } catch (error) {
    request.log.error({ id, error }, 'Error updating task');
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export const deleteTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as TaskParams;

  try {
    await request.server.prisma.task.delete({
      where: { id }
    });

    request.log.info({ id }, 'Task deleted');
    return reply.code(204).send();
  } catch (error) {
    request.log.error({ id, error }, 'Error deleting task');
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
