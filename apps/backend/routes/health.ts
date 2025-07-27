import type { ApiResponse } from '@jamku/types';
import { Hono } from 'hono';

import pkg from '../package.json' with { type: 'json' }

export const healthRoute = new Hono();

// Health check endpoint
// GET /api/health
healthRoute.get('/', (c) => {
  const response: ApiResponse = {
    success: true,
    message: 'Jain Atlas API is running!',
    data: {
      status: 'ok',
      version: pkg.version,
    }
  };
  return c.json(response);
});