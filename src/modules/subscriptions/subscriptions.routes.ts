import { Router } from 'express';

export const subscriptionsRouter = Router();

subscriptionsRouter.get('/plans', (_req, res) => {
  res.status(200).json({
    data: [
      {
        id: 'free',
        name: 'Free',
        price_monthly: 0,
        price_yearly: 0,
        currency: 'USD',
        features: [
          '2 activities',
          '1 child profile',
          'Basic progress tracking',
        ],
      },
      {
        id: 'premium',
        name: 'Premium',
        price_monthly: 11.99,
        price_yearly: 61.00,
        currency: 'USD',
        yearly_saving: 'Save 32%',
        features: [
          'All standard activities',
          '5 child profiles',
          'Full progress dashboard',
          'Audio guided activities',
          'Math and language activities',
          'Priority support',
        ],
      },
      {
        id: 'platinum',
        name: 'Platinum',
        price_monthly: 22.00,
        price_yearly: 99.00,
        currency: 'USD',
        yearly_saving: 'Save 62%',
        features: [
          'Everything in Premium',
          'Robotics sessions',
          'Advanced STEM activities',
          'Exclusive new activities first',
          'Up to 8 child profiles',
          'Dedicated support',
        ],
      },
    ],
  });
});

subscriptionsRouter.post('/checkout', (_req, res) => {
  res.status(501).json({
    error: 'Stripe payments coming soon',
  });
});