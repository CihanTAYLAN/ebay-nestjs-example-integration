import { Router } from 'express';
import { storeRoutes } from './stores';
import { productRoutes } from './products';
import { categoryRoutes } from './categories';
import { priceRulesRoutes } from './priceRules';
import { templatesRoutes } from './templates';
import { ordersRoutes } from './orders';
import { authRoutes } from './auth';

const router = Router();

// API versioning
router.use('/v1', v1Routes());

// Mount route modules
function v1Routes() {
  const v1Router = Router();

  // Public routes
  v1Router.use('/auth', authRoutes);

  // Protected routes (require authentication in real implementation)
  v1Router.use('/stores', storeRoutes);
  v1Router.use('/products', productRoutes);
  v1Router.use('/categories', categoryRoutes);
  v1Router.use('/price-rules', priceRulesRoutes);
  v1Router.use('/templates', templatesRoutes);
  v1Router.use('/orders', ordersRoutes);

  return v1Router;
}

export { router };
