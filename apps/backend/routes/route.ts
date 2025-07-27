import { Hono } from 'hono';
import { authHandler } from './middleware/auth';

export const apiRoutes = new Hono();

// 1. Routes which are public `/public/`


// 2. Routes which are protected by authentication `/p/`
// Note: '/p/' stands for protected routes.
// 2A. Middeware for authentication
apiRoutes.use('/p/*', authHandler);
// 2B. Routes
import { placeViewRoutes } from './placeview'; apiRoutes.route('/p', placeViewRoutes);
import { placeUpdateRoutes } from './placeupdate'; apiRoutes.route('/place', placeUpdateRoutes);

// 3. Health check route
import { healthRoute } from './health'; apiRoutes.route('/health', healthRoute);
