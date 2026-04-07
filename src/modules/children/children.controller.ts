import { Request, Response, NextFunction } from 'express';
import { childrenService } from './children.service';
import { createChildSchema, updateChildSchema } from './children.schema';
import { AppError } from '../../middleware/errorHandler';

export const childrenController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const data = await childrenService.list(req.user.id);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const data = await childrenService.getOne(req.user.id, req.params.id);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const input = createChildSchema.parse(req.body);
      const data = await childrenService.create(req.user.id, input);
      res.status(201).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const input = updateChildSchema.parse(req.body);
      const data = await childrenService.update(req.user.id, req.params.id, input);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'Unauthorized');
      const data = await childrenService.remove(req.user.id, req.params.id);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};