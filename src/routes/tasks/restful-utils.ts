import { FastifyRequest } from 'fastify';

type Link = {
  href: string;
  rel: string;
  method?: string;
};

const getBaseUrl = (request: FastifyRequest): string => {
  const protocol = request.protocol;
  const hostname = request.hostname;
  return `${protocol}://${hostname}`;
};

export const getTaskLinks = (request: FastifyRequest, taskId: number): Link[] => {
  const baseUrl = getBaseUrl(request);
  return [
    {
      href: `${baseUrl}/tasks/${taskId}`,
      rel: 'self',
      method: 'GET'
    },
    {
      href: `${baseUrl}/tasks/${taskId}`,
      rel: 'update',
      method: 'PUT'
    },
    {
      href: `${baseUrl}/tasks/${taskId}`,
      rel: 'patch',
      method: 'PATCH'
    },
    {
      href: `${baseUrl}/tasks/${taskId}`,
      rel: 'delete',
      method: 'DELETE'
    }
  ];
};

export const getTasksCollectionLinks = (request: FastifyRequest): Link[] => {
  const baseUrl = getBaseUrl(request);
  return [
    {
      href: `${baseUrl}/tasks`,
      rel: 'self',
      method: 'GET'
    },
    {
      href: `${baseUrl}/tasks`,
      rel: 'create',
      method: 'POST'
    }
  ];
};

export const addLinksToTask = <T extends { id: number }>(
  request: FastifyRequest,
  task: T
): T & { _links: Link[] } => {
  return {
    ...task,
    _links: getTaskLinks(request, task.id)
  };
};

export const addLinksToTasks = <T extends { id: number }>(
  request: FastifyRequest,
  tasks: T[]
): Array<T & { _links: Link[] }> => {
  return tasks.map(task => addLinksToTask(request, task));
};
