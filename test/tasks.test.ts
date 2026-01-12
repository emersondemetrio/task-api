import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { createTestServer, closeTestServer } from './helpers';
import type { FastifyInstance } from 'fastify';

describe('Tasks API', () => {
  let server: FastifyInstance;
  let createdTaskId: number | null = null;

  // User IDs from seed script: 1=admin, 2=moderator, 3=user
  const user1 = 1;
  const user2 = 2;
  const user3 = 3;

  before(async () => {
    server = await createTestServer({
      level: 'silent'
    });
  });

  after(async () => {
    if (createdTaskId) {
      try {
        await server.prisma.task.delete({ where: { id: createdTaskId } });
      } catch (error) {
        // Task might already be deleted, ignore
      }
    }
    await closeTestServer(server);
  });

  test('GET /tasks should return tasks array', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/tasks',
      headers: {
        'x-user-id': user3.toString()
      }
    });

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert(Array.isArray(body.tasks));
    assert(body._links);
  });

  test('POST /tasks should create a new task', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': user3.toString()
      },
      payload: {
        title: 'Test task',
        description: 'Test description'
      }
    });

    assert.strictEqual(response.statusCode, 201);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.title, 'Test task');
    assert.strictEqual(body.description, 'Test description');
    assert.strictEqual(body.status, 'TODO');
    assert(body.id);
    assert(body.createdAt);
    assert(body._links);

    createdTaskId = body.id;
  });

  test('POST /tasks should return 400 when title is missing', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': user3.toString()
      },
      payload: {}
    });

    assert.strictEqual(response.statusCode, 400);
    const body = JSON.parse(response.body);
    assert(body.error);
  });

  test('GET /tasks/:id should return task by id', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': user3.toString()
      },
      payload: {
        title: 'Task to get',
        description: 'Description'
      }
    });

    const createdTask = JSON.parse(createResponse.body);
    const taskId = createdTask.id;

    const getTaskResponse = await server.inject({
      method: 'GET',
      url: `/tasks/${taskId}`,
      headers: {
        'x-user-id': user3.toString()
      }
    });

    assert.strictEqual(getTaskResponse.statusCode, 200);
    const body = JSON.parse(getTaskResponse.body);
    assert.strictEqual(body.id, taskId);
    assert.strictEqual(body.title, 'Task to get');
    assert.strictEqual(body.description, 'Description');
    assert(body._links);

    await server.prisma.task.delete({ where: { id: taskId } });
  });

  test('GET /tasks/:id should return 404 for non-existent task', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/tasks/99999',
      headers: {
        'x-user-id': user3.toString()
      }
    });

    assert.strictEqual(response.statusCode, 404);
    const body = JSON.parse(response.body);
    assert(body.error);
  });

  test('PUT /tasks/:id should update task', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': user2.toString()
      },
      payload: {
        title: 'Task to update',
        description: 'Original description'
      }
    });

    const createdTask = JSON.parse(createResponse.body);
    const taskId = createdTask.id;

    const response = await server.inject({
      method: 'PUT',
      url: `/tasks/${taskId}`,
      headers: {
        'x-user-id': user2.toString()
      },
      payload: {
        title: 'Updated task title',
        description: 'Updated description',
        status: 'in_progress'
      }
    });

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.id, taskId);
    assert.strictEqual(body.title, 'Updated task title');
    assert.strictEqual(body.description, 'Updated description');
    assert.strictEqual(body.status, 'IN_PROGRESS');
    assert(body._links);

    await server.prisma.task.delete({ where: { id: taskId } });
  });

  test('PUT /tasks/:id should return 404 for non-existent task', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: '/tasks/99999',
      headers: {
        'x-user-id': user2.toString()
      },
      payload: {
        title: 'Updated title',
        description: 'Updated description',
        status: 'todo'
      }
    });

    assert.strictEqual(response.statusCode, 404);
    const body = JSON.parse(response.body);
    assert(body.error);
  });

  test('DELETE /tasks/:id should delete task', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': user1.toString()
      },
      payload: {
        title: 'Task to delete',
        description: 'Description'
      }
    });

    const createdTask = JSON.parse(createResponse.body);
    const taskId = createdTask.id;

    const deleteTaskResponse = await server.inject({
      method: 'DELETE',
      url: `/tasks/${taskId}`,
      headers: {
        'x-user-id': user1.toString()
      }
    });

    assert.strictEqual(deleteTaskResponse.statusCode, 204);

    const getDeletedTaskResponse = await server.inject({
      method: 'GET',
      url: `/tasks/${taskId}`,
      headers: {
        'x-user-id': user1.toString()
      }
    });

    assert.strictEqual(getDeletedTaskResponse.statusCode, 404);
  });
});
