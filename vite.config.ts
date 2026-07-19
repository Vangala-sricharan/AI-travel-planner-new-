import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// A simple Vite plugin to serve the serverless functions in development
function localApiPlugin() {
  return {
    name: 'local-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url && (req.url.startsWith('/api/generate-itinerary') || req.url.startsWith('/api/modify-itinerary'))) {
          const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
          const pathname = url.pathname;

          try {
            let handlerModule;
            if (pathname === '/api/generate-itinerary') {
              handlerModule = await server.ssrLoadModule(path.resolve(__dirname, 'api/generate-itinerary.ts'));
            } else if (pathname === '/api/modify-itinerary') {
              handlerModule = await server.ssrLoadModule(path.resolve(__dirname, 'api/modify-itinerary.ts'));
            }

            if (handlerModule && handlerModule.default) {
              // Parse body for POST requests
              let body = {};
              if (req.method === 'POST') {
                const buffers: Buffer[] = [];
                for await (const chunk of req) {
                  buffers.push(chunk as Buffer);
                }
                const data = Buffer.concat(buffers).toString();
                if (data) {
                  try {
                    body = JSON.parse(data);
                  } catch (e) {
                    body = data;
                  }
                }
              }

              // Mock VercelRequest and VercelResponse
              const vercelReq = Object.assign(req, {
                query: Object.fromEntries(url.searchParams),
                body: body,
                cookies: {}
              });

              const vercelRes = Object.assign(res, {
                status(statusCode: number) {
                  res.statusCode = statusCode;
                  return vercelRes;
                },
                json(jsonBody: any) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(jsonBody));
                  return vercelRes;
                },
                send(body: any) {
                  res.end(body);
                  return vercelRes;
                }
              });

              await handlerModule.default(vercelReq, vercelRes);
              return;
            }
          } catch (error) {
            console.error('Error in local API plugin:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error', details: String(error) }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
