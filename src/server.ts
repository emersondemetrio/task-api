import fastify from 'fastify';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma';

import dotenv from 'dotenv';

dotenv.config();

const server = fastify()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
});

server.get('/tasks', async (request, reply) => {
  const tasks = await prisma.task.findMany()
  return reply.code(200).send(tasks)
})

server.listen({ port: 4000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
