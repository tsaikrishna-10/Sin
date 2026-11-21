// Vercel serverless function: keeps the OMDb API key on the server.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ Response: 'False', Error: 'Method not allowed' });
  }
  const imdbId = String(req.query.i || '').trim();
  if (!/^tt[0-9]{7,10}$/.test(imdbId)) {
    return res.status(400).json({ Response: 'False', Error: 'A valid IMDb ID is required.' });
  }
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ Response: 'False', Error: 'OMDb is not configured on the server yet.' });
  }
  try {
    const upstream = await fetch('https://www.omdbapi.com/?i=' + encodeURIComponent(imdbId) + '&plot=full&apikey=' + encodeURIComponent(apiKey));
    const data = await upstream.json();
    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    return res.status(502).json({ Response: 'False', Error: 'Unable to reach OMDb right now.' });
  }
};
