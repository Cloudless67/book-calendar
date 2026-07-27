export default async function handler(req, res) {
  const { query, target, page, size, sort } = req.query;

  const apiKey = (process.env.VITE_KAKAO_REST_API_KEY || process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_CLIENT_ID || process.env.KAKAO_CLIENT_ID || process.env.VITE_KAKAO_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(400).json({ error: '카카오 REST API 키가 설정되지 않았습니다. .env 파일의 VITE_KAKAO_REST_API_KEY에 키를 입력해 주세요.' });
  }

  const searchParams = new URLSearchParams();
  if (query) searchParams.append('query', query);
  if (target) searchParams.append('target', target);
  if (page) searchParams.append('page', page);
  if (size) searchParams.append('size', size);
  if (sort) searchParams.append('sort', sort);

  const endpoint = 'https://dapi.kakao.com/v3/search/book';

  try {
    const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
      headers: {
        'Authorization': `KakaoAK ${apiKey}`,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
