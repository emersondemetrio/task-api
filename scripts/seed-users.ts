import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
  });

  try {
    await prisma.user.upsert({
      where: { email: 'user1@tasks-api.com' },
      update: {},
      create: {
        email: 'user1@tasks-api.com',
        name: 'John doe',
      },
    });

    await prisma.user.upsert({
      where: { email: 'user2@tasks-api.com' },
      update: {},
      create: {
        email: 'user2@tasks-api.com',
        name: 'Jane doe',
      },
    });

    await prisma.user.upsert({
      where: { email: 'user3@tasks-api.com' },
      update: {},
      create: {
        email: 'user3@tasks-api.com',
        name: 'Jim doe',
      },
    });

    console.log('Users created successfully:');
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
