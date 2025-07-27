import type { Context, Next } from "hono";

export const securityHeaders = async (c: Context, next: Next) => {
  // Set security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self'");
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  await next();
};

export const corsHeaders = async (c: Context, next: Next) => {
  // CORS headers for development - adjust for production
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response('', { status: 204 });
  }

  await next();
};
