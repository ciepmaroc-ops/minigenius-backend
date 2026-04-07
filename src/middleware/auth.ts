import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn('Invalid token attempt', { path: req.path });
      throw new AppError(401, 'Invalid or expired token');
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? '',
      role: 'parent',
    };

    next();
  } catch (err) {
    next(err);
  }
}