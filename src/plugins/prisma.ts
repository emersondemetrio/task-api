import { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin'
import { PrismaClient } from "../../generated/prisma";
import { Pool } from "pg";
import dotenv from 'dotenv'
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config()

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify, options) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
  });

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
  })
}

export default fp(prismaPlugin);
