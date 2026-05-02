import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-mock',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/image-proxy?url=')) {
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
            } else if (req.url && req.url.startsWith('/api/naver-search')) {
              try {
                const urlObj = new URL(req.url, 'http://localhost');
                const searchParams = urlObj.searchParams;
                
                let endpoint = 'https://openapi.naver.com/v1/search/book.json';
                if (searchParams.has('d_titl') || searchParams.has('d_auth') || searchParams.has('d_isbn')) {
                  endpoint = 'https://openapi.naver.com/v1/search/book_adv.json';
                }

                const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
                  headers: {
                    'X-Naver-Client-Id': env.VITE_NAVER_CLIENT_ID || env.NAVER_CLIENT_ID || '',
                    'X-Naver-Client-Secret': env.VITE_NAVER_CLIENT_SECRET || env.NAVER_CLIENT_SECRET || '',
                  },
                });

                if (!response.ok) {
                  res.statusCode = response.status;
                  res.end(await response.text());
                  return;
                }
                const data = await response.text();
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              } catch(e) {
                res.statusCode = 500;
                res.end(e.message);
                return;
              }
            } else if (req.url && req.url.startsWith('/api/seoji-search')) {
              try {
                const urlObj = new URL(req.url, 'http://localhost');
                const isbn = urlObj.searchParams.get('isbn');
                const searchParams = new URLSearchParams({
                  cert_key: env.VITE_SEOJI_API_KEY || env.SEOJI_API_KEY || '',
                  result_style: 'json',
                  page_no: 1,
                  page_size: 10,
                  isbn: isbn || '',
                });

                const response = await fetch(`https://www.nl.go.kr/seoji/SearchApi.do?${searchParams.toString()}`);
                const data = await response.text();
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              } catch(e) {
                res.statusCode = 500;
                res.end(e.message);
                return;
              }
            }
            next();
          });
        }
      }
    ]
  };
})
