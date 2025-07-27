const PORT_LOCAL = 5001;
const PORT_BACKEND = 5002;
const PORT_FRONTEND = 5003;


const server = Bun.serve({
  port: PORT_LOCAL,
  async fetch(req) {
    const url = new URL(req.url);

    // Route API requests to backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = `http://localhost:${PORT_BACKEND}${url.pathname}${url.search}`;

      try {
        const response = await fetch(backendUrl, {
          method: req.method,
          headers: req.headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (error) {
        console.error('Backend proxy error:', error);
        return new Response('Backend service unavailable', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }

    // Route all other requests to frontend
    const frontendUrl = `http://localhost:${PORT_FRONTEND}${url.pathname}${url.search}`;

    try {
      const response = await fetch(frontendUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error('Frontend proxy error:', error);
      return new Response('Frontend service unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
});

console.log(`🚀 Reverse proxy server running on http://localhost:${server.port}
🛠️ API requests (/api/*) → http://localhost:${PORT_BACKEND}
💻 Frontend requests (/*) → http://localhost:${PORT_FRONTEND}`
);


// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down reverse proxy server...');
  server.stop();
  process.exit(0);
});