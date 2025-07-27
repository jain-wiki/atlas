import { auth } from '../../lib/auth';

import type { Context, Next } from 'hono'
import type { ApiResponse } from '@jamku/types';
import type { Session, User } from '../../lib/auth';

// Extend Hono's Context to include 'session'
declare module 'hono' {
  interface ContextVariableMap {
    session: Session;
    user: User
  }
}


export async function authHandler(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({
      success: false, show: true,
      error: 'Session not active',
    } as ApiResponse, 401);
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
}

