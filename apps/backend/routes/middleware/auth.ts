import type { Context, Next } from "hono";
import { auth } from "../../lib/auth";
import { createErrorResponse, ErrorMessages } from './responses';

export const requireAuth = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || !session.user) {
    return c.json(createErrorResponse(ErrorMessages.UNAUTHORIZED), 401);
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};
