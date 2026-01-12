import type { FastifyInstance } from 'fastify';
import assert from 'node:assert';
import { after, before, describe, test } from 'node:test';
import { closeTestServer, createTestServer } from './helpers';

describe('Health Check API', () => {
  let server: FastifyInstance;

  before(async () => {
    server = await createTestServer({
      level: 'silent'
    });
  });

  after(async () => {
    await closeTestServer(server);
  });

  test('GET /health should return status `ok`', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health'
    });

    assert.strictEqual(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.strictEqual(body.status, 'ok');
    assert(body.timestamp);
    assert(typeof body.timestamp === 'string');
  });
});
