import { Router } from 'express';
import { sessionsController } from './sessions.controller';
import { requireAuth } from '../../middleware/auth';

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

sessionsRouter.post('/', sessionsController.start);
sessionsRouter.patch('/:id', sessionsController.update);
sessionsRouter.post('/:id/complete', sessionsController.complete);
sessionsRouter.get('/child/:childId', sessionsController.listByChild);