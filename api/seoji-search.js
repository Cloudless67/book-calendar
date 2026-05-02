export default async function handler(req, res) {
  const { isbn } = req.query;
  const apiKey = process.env.VITE_SEOJI_API_KEY || process.env.SEOJI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Seoji API key missing' });
  }

  const searchParams = new URLSearchParams({
    cert_key: apiKey,
    result_style: 'json',
    page_no: 1,
    page_size: 10,
    isbn: isbn || '',
  });

  try {
    const response = await fetch(`https://www.nl.go.kr/seoji/SearchApi.do?${searchParams.toString()}`);
    if (!response.ok) throw new Error(`Seoji API error: ${response.status}`);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
