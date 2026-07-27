import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'booklog.png'],
        manifest: {
          name: 'BookLog',
          short_name: 'BookLog',
          description: 'A personal book reading calendar and log',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
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
            } else if (req.url && req.url.startsWith('/api/kakao-search')) {
              try {
                const liveEnv = loadEnv(mode, process.cwd(), '');
                const urlObj = new URL(req.url, 'http://localhost');
                const searchParams = urlObj.searchParams;
                const apiKey = (
                  process.env.VITE_KAKAO_REST_API_KEY ||
                  liveEnv.VITE_KAKAO_REST_API_KEY ||
                  liveEnv.KAKAO_REST_API_KEY ||
                  process.env.KAKAO_REST_API_KEY ||
                  ''
                ).trim();

                if (!apiKey) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({
                    error: '카카오 REST API 키가 설정되지 않았습니다. .env 파일의 VITE_KAKAO_REST_API_KEY에 키를 입력해 주세요.'
                  }));
                  return;
                }

                const response = await fetch(`https://dapi.kakao.com/v3/search/book?${searchParams.toString()}`, {
                  headers: {
                    'Authorization': `KakaoAK ${apiKey}`,
                  },
                });

                const data = await response.text();
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(data);
                return;
              } catch(e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: e.message }));
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
