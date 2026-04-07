import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const PORT = Number(env.PORT);

app.listen(PORT, () => {
  logger.info('MiniGenius backend started', {
    port: PORT,
    environment: env.NODE_ENV,
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { message: err.message });
  process.exit(1);
});