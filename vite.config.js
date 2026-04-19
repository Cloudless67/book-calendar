import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'image-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/image-proxy?url=')) {
            const targetUrl = new URL(req.url, 'http://localhost').searchParams.get('url');
            if (targetUrl) {
              try {
                const response = await fetch(targetUrl);
                const buffer = await response.arrayBuffer();
                res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.end(Buffer.from(buffer));
                return;
              } catch (e) {
                console.error('Image proxy error:', e);
                res.statusCode = 500;
                res.end('Error fetching image');
                return;
              }
            }
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/nl-api': {
        target: 'https://www.nl.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nl-api/, '')
      },
      '/naver-api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-api/, '')
      }
    }
  }
})
