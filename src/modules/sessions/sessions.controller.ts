import { Request, Response, NextFunction } from 'express';
import { sessionsService } from './sessions.service';
import {
  startSessionSchema,
  updateSessionSchema,
  completeSessionSchema,
} from './sessions.schema';
import { AppError } from '../../middleware/errorHandler';

export const sessionsController = {
  async start(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const input = startSessionSchema.parse(req.body);
      const data = await sessionsService.start(req.user.id, input);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const input = updateSessionSchema.parse(req.body);
      const data = await sessionsService.update(
        req.user.id,
        req.params.id,
        input
      );
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const input = completeSessionSchema.parse(req.body);
      const data = await sessionsService.complete(
        req.user.id,
        req.params.id,
        input
      );
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async listByChild(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const data = await sessionsService.listByChild(
        req.user.id,
        req.params.childId
      );
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};