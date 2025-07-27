
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers'

import { auth } from './lib/auth';
import { errorHandler } from './routes/middleware/errorhandler';
import { apiRoutes } from './routes/route';

import type { Session, User } from './lib/auth'

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  }
}>();

// Add security middleware
app.use(secureHeaders())

// Mount Better Auth handler at /api/auth/*
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// Mount API routes
app.route('/api', apiRoutes);

// Error handling middleware
app.onError(errorHandler);

const port = Number(process.env.PORT) || 5002;
console.log(`🚀 API Server Running: http://localhost:${port}/api`);
export default {
  port,
  fetch: app.fetch,
};