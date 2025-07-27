
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { auth } from "./lib/auth";
import { errorHandler } from "./routes/middleware/errorhandler";
import { securityHeaders, corsHeaders } from "./routes/middleware/security";
import { apiRoutes } from "./routes/route";

const app = new Hono();

// Add security middleware
app.use('*', securityHeaders);
app.use('*', corsHeaders);

// Mount Better Auth handler at /api/auth/*
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Mount API routes
app.route("/api", apiRoutes);

// Error handling middleware
app.onError(errorHandler);

serve(app);