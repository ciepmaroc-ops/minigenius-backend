import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './Config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { healthRouter } from './modules/health/health.routes';
import { authRouter } from './modules/Auth/auth.routes';
import { parentsRouter } from './modules/parents/parents.routes';
import { childrenRouter } from './modules/children/children.routes';
import { subscriptionsRouter } from './modules/subscriptions/subscriptions.routes';
import { activitiesRouter } from './modules/activities/activities.routes';
import { sessionsRouter } from './modules/sessions/sessions.routes';
import { assetsRouter } from './modules/assets/assets.routes';
import stripeRouter from './routes/stripe';

export const app = express();

// ── 1. CORS EN PREMIER — absolument avant tout ──────────────
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Gérer les preflight OPTIONS (important pour les requêtes cross-origin)
app.options('*', cors());

// ── 2. Stripe webhook — avant express.json() ────────────────
// IMPORTANT : doit recevoir le raw body pour vérifier la signature
app.use('/stripe', stripeRouter);

// ── 3. Sécurité et parsing ───────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(apiLimiter);

// ── 4. Logger des requêtes ───────────────────────────────────
app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
  });
  next();
});

// ── 5. Routes ────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/parents', parentsRouter);
app.use('/children', childrenRouter);
app.use('/activities', activitiesRouter);
app.use('/sessions', sessionsRouter);
app.use('/assets', assetsRouter);
app.use('/subscriptions', subscriptionsRouter);

// ── 6. 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── 7. Error handler ─────────────────────────────────────────
app.use(errorHandler);
