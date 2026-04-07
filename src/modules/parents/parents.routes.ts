import { Router } from 'express';
import { parentsController } from './parents.controller';
import { requireAuth } from '../../middleware/auth';

export const parentsRouter = Router();

parentsRouter.use(requireAuth);

parentsRouter.get('/me', parentsController.getProfile);
parentsRouter.patch('/me', parentsController.updateProfile);
parentsRouter.get('/me/dashboard', parentsController.getDashboard);