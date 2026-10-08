export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path, ...restQuery } = req.query;
    const subpath = Array.isArray(path) ? path.join('/') : (path || '');
    const queryString = new URLSearchParams(restQuery).toString();
    const targetUrl = `https://api.binance.com/${subpath}${queryString ? '?' + queryString : ''}`;

    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type') || 'application/json';
    const body = await response.text();

    res.setHeader('Content-Type', contentType);
    return res.status(response.status).send(body);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
