import { Router } from 'express';
import { childrenController } from './children.controller';
import { requireAuth } from '../../middleware/auth';

export const childrenRouter = Router();

childrenRouter.use(requireAuth);

childrenRouter.get('/', childrenController.list);
childrenRouter.get('/:id', childrenController.getOne);
childrenRouter.post('/', childrenController.create);
childrenRouter.patch('/:id', childrenController.update);
childrenRouter.delete('/:id', childrenController.remove);