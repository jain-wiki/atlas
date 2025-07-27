
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { auth } from "./lib/auth";

const app = new Hono();

// Mount Better Auth handler at /api/auth/*
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Placeholder for API routes (to be implemented and imported)
// import { apiRoutes } from "./routes/route";
// app.route("/api", apiRoutes);

// Error handling middleware
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

serve(app);