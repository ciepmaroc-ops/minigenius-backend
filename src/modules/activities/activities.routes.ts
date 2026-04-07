import { Router } from 'express';
import { activitiesController } from './activities.controller';

export const activitiesRouter = Router();

activitiesRouter.get('/', activitiesController.list);
activitiesRouter.get('/plan/:plan', activitiesController.getByPlan);
activitiesRouter.get('/:slug', activitiesController.getOne);