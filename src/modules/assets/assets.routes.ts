import { Router, Request, Response, NextFunction } from 'express';
import { assetsService } from './assets.service';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const assetsRouter = Router();

assetsRouter.use(requireAuth);

assetsRouter.get('/signed-url', async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filePath = req.query.path as string;

    if (!filePath) {
      throw new AppError(400, 'File path is required');
    }

    const url = await assetsService.getSignedUrl(filePath);
    res.status(200).json({ data: { url, expires_in: 300 } });
  } catch (err) {
    next(err);
  }
});

assetsRouter.post('/signed-urls', async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paths } = req.body;

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      throw new AppError(400, 'paths array is required');
    }

    if (paths.length > 20) {
      throw new AppError(400, 'Maximum 20 paths per request');
    }

    const urls = await assetsService.getSignedUrls(paths);
    res.status(200).json({ data: { urls, expires_in: 300 } });
  } catch (err) {
    next(err);
  }
});