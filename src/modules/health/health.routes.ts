import { Router, Request, Response } from 'express';
import { supabase } from '../../Config/supabase';
import { logger } from '../../utils/logger';

export const healthRouter = Router();

healthRouter.get('/', async (_req: Request, res: Response) => {
  const { error } = await supabase
    .from('parent_accounts')
    .select('id')
    .limit(1);

  const dbStatus = error ? 'unreachable' : 'ok';

  if (error) {
    logger.warn('Health check — database unreachable', {
      message: error.message,
    });
  }

  res.status(dbStatus === 'ok' ? 200 : 503).json({
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
    },
  });
});
