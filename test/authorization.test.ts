import type { FastifyInstance } from 'fastify';
import assert from 'node:assert';
import { after, before, describe, test } from 'node:test';
import { Task } from '../generated/prisma';
import { closeTestServer, createTestServer } from './helpers';

describe('Authorization Tests', () => {
  let server: FastifyInstance;

  const userId1 = 1;
  const userId2 = 2;

  before(async () => {
    server = await createTestServer({
      level: 'silent'
    });
  });

  after(async () => {
    await closeTestServer(server);
  });

  test('GET /tasks should only return tasks belonging to the user', async () => {
    // Task for user 1
    const createResponse1 = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': userId1.toString()
      },
      payload: {
        title: 'User 1 Task',
        description: 'Description'
      }
    });

    const task1 = JSON.parse(createResponse1.body);
    const task1Id = task1.id;

    // Task for user 2
    const createResponse2 = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': userId2.toString()
      },
      payload: {
        title: 'User 2 Task',
        description: 'Description'
      }
    });

    const task2 = JSON.parse(createResponse2.body);
    const task2Id = task2.id;

    // User 1 should only see their own task
    const getTasksResponse = await server.inject({
      method: 'GET',
      url: '/tasks',
      headers: {
        'x-user-id': userId1.toString()
      }
    });

    assert.strictEqual(getTasksResponse.statusCode, 200);
    const body = JSON.parse(getTasksResponse.body);
    assert(Array.isArray(body.tasks));

    // User 1 should only see task1, not task2
    const taskIds = body.tasks.map((task: Task) => task.id);
    assert(taskIds.includes(task1Id), 'User 1 should see their own task');
    assert(!taskIds.includes(task2Id), 'User 1 should not see user 2\'s task');

    // Cleanup
    await server.prisma.task.delete({ where: { id: task1Id } });
    await server.prisma.task.delete({ where: { id: task2Id } });
  });

  test('PUT /tasks/:id should only allow updating a task belonging to the auth user', async () => {
    const createResponse = await server.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        'x-user-id': userId1.toString()
      },
      payload: {
        title: 'User 1 Task',
        description: 'Original description'
      }
    });

    const task = JSON.parse(createResponse.body);
    const taskId = task.id;

    // User 2 tries to update user 1's task - should return 404
    const expectedToFailUpdateResponse = await server.inject({
      method: 'PUT',
      url: `/tasks/${taskId}`,
      headers: {
        'x-user-id': userId2.toString()
      },
      payload: {
        title: 'Hacked by user 2',
        description: 'Hacked description',
        status: 'done'
      }
    });

    assert.strictEqual(expectedToFailUpdateResponse.statusCode, 404);
    const body = JSON.parse(expectedToFailUpdateResponse.body);
    assert(body.error);

    // Verify task was not updated
    const verifyResponse = await server.inject({
      method: 'GET',
      url: `/tasks/${taskId}`,
      headers: {
        'x-user-id': userId1.toString()
      }
    });

    const verifyBody = JSON.parse(verifyResponse.body);
    assert.strictEqual(verifyBody.title, 'User 1 Task', 'Task should not be updated');

    // Cleanup
    await server.prisma.task.delete({ where: { id: taskId } });
  });
});
