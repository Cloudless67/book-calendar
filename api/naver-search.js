export default async function handler(req, res) {
  const { query, d_titl, d_auth, d_isbn, display, start, sort } = req.query;
  
  const clientId = process.env.VITE_NAVER_CLIENT_ID || process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET || process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Naver API credentials missing' });
  }

  const searchParams = new URLSearchParams();
  if (query) searchParams.append('query', query);
  if (d_titl) searchParams.append('d_titl', d_titl);
  if (d_auth) searchParams.append('d_auth', d_auth);
  if (d_isbn) searchParams.append('d_isbn', d_isbn);
  if (display) searchParams.append('display', display);
  if (start) searchParams.append('start', start);
  if (sort) searchParams.append('sort', sort);

  let endpoint = 'https://openapi.naver.com/v1/search/book.json';
  if (d_titl || d_auth || d_isbn) {
    endpoint = 'https://openapi.naver.com/v1/search/book_adv.json';
  }

  try {
    const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
