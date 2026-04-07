import { Request, Response, NextFunction } from 'express';
import { activitiesService } from './activities.service';
import { listActivitiesSchema } from './activities.schema';

export const activitiesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listActivitiesSchema.parse(req.query);
      const data = await activitiesService.list(input);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await activitiesService.getOne(req.params.slug);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getByPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = req.params.plan as 'free' | 'premium';
      if (!['free', 'premium'].includes(plan)) {
        res.status(400).json({ error: 'Plan must be free or premium' });
        return;
      }
      const data = await activitiesService.getByPlan(plan);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};