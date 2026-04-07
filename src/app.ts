import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { parentsRouter } from './modules/parents/parents.routes';
import { childrenRouter } from './modules/children/children.routes';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes';
import { activitiesRouter } from './modules/activities/activities.routes';
import { sessionsRouter } from './modules/sessions/sessions.routes';
import { assetsRouter } from './modules/assets/assets.routes';
import stripeRouter from './routes/stripe';

export const app = express();
app.use('/stripe', stripeRouter);
app.use(helmet());
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(apiLimiter);

app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
  });
  next();
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/parents', parentsRouter);
app.use('/children', childrenRouter);
app.use('/activities', activitiesRouter);
app.use('/sessions', sessionsRouter);
app.use('/assets', assetsRouter);
app.use('/subscriptions', subscriptionsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);