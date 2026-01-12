import { buildFastifyApp } from './app';

const main = async () => {
  const fastify = buildFastifyApp();
  const port = Number(process.env.PORT) || 4000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    fastify.log.info(`Server listening at http://${host}:${port}`);
  } catch (error) {
    console.error("Unexpected error:", error);
    fastify.log.error(error);
    process.exit(1);
  }
};

main();
