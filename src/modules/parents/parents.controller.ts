import { Request, Response, NextFunction } from 'express';
import { parentsService } from './parents.service';
import { AppError } from '../../middleware/errorHandler';
import { z } from 'zod';

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  locale: z.string().optional(),
  country_code: z.string().length(2).optional(),
});

export const parentsController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const data = await parentsService.getProfile(req.user.id);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const input = updateProfileSchema.parse(req.body);
      const data = await parentsService.updateProfile(req.user.id, input);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const data = await parentsService.getDashboard(req.user.id);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};