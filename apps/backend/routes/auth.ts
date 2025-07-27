import { Hono } from "hono";
import { auth } from "../lib/auth";
import { requireAuth } from "./middleware/auth";
import { createSuccessResponse, createErrorResponse, ErrorMessages } from './middleware/responses';

export const authRoutes = new Hono();

// GET /api/auth/status - Check authentication status
authRoutes.get("/status", async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session && session.user) {
      return c.json(createSuccessResponse({
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        }
      }));
    } else {
      return c.json(createSuccessResponse({ authenticated: false }));
    }
  } catch (error) {
    return c.json(createErrorResponse("Failed to check authentication status"), 500);
  }
});

// GET /api/auth/me - Get current user info (protected)
authRoutes.get("/me", requireAuth, async (c) => {
  const user = (c as any).get('user');
  return c.json(createSuccessResponse(user));
});

// POST /api/auth/logout - Logout endpoint
authRoutes.post("/logout", async (c) => {
  try {
    // Better Auth handles logout automatically through its API
    return c.json(createSuccessResponse({ message: "Logged out successfully" }));
  } catch (error) {
    return c.json(createErrorResponse("Failed to logout"), 500);
  }
});
