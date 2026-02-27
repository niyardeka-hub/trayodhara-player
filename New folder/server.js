const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// helper to call Tidal API
async function tidalRequest(endpoint, params = {}) {
  const apiKey = process.env.TIDAL_API_KEY;
  if (!apiKey) {
    throw new Error('TIDAL_API_KEY is not set in environment');
  }
  const url = `https://api.tidal.com/v1/${endpoint}`;
  const response = await axios.get(url, {
    params: { ...params, countryCode: 'US' },
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });
  return response.data;
}

// search endpoint - supports multiple query types similar to hifi-api
app.get('/search', async (req, res) => {
  // hifi-api allows one of s (track), a (artist), v (video) or p (playlist)
  const { s, a, v, p, limit = 25, offset = 0 } = req.query;
  if (!s && !a && !v && !p) {
    return res.status(400).json({ error: 'one of s,a,v,p query params is required' });
  }
  let params = { limit, offset };
  if (s) params.s = s;
  if (a) params.a = a;
  if (v) params.v = v;
  if (p) params.p = p;

  try {
    const data = await tidalRequest('search', params);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to search' });
  }
});

// info endpoint returns detailed track metadata
app.get('/info/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await tidalRequest(`tracks/${id}`);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to fetch info' });
  }
});

// track endpoint returns manifest/stream urls for a given quality
app.get('/track/:id', async (req, res) => {
  const id = req.params.id;
  const { quality = 'HI_RES_LOSSLESS' } = req.query;
  try {
    // tidal's /tracks/{id}/streamUrl might exist, but we'll fetch generic info and
    // return the manifest or preview url for demonstration
    const data = await tidalRequest(`tracks/${id}`);
    // if the API returns streamUrl or manifest, pass it along
    if (data.streamUrl) {
      return res.json({ streamUrl: data.streamUrl, quality: quality });
    }
    if (data.manifest) {
      return res.json({ manifest: data.manifest, mimeType: data.manifestMimeType });
    }
    // fallback to preview
    res.json({ previewUrl: data.previewUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to fetch track' });
  }
});

// recommendations endpoint
app.get('/recommendations/:id', async (req, res) => {
  const id = req.params.id;
  const { limit = 20, offset = 0 } = req.query;
  try {
    const data = await tidalRequest(`recommendations/tracks`, { trackId: id, limit, offset });
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to fetch recommendations' });
  }
});

// download endpoint - proxies the mp3 stream
app.get('/download/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const track = await tidalRequest(`tracks/${id}`);
    if (track.previewUrl) {
      return res.redirect(track.previewUrl);
    }
    res.status(404).json({ error: 'no download available' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to download' });
  }
});

// fetch track stream url
app.get('/track/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const data = await tidalRequest(`tracks/${id}`);
    // The API may not provide direct mp3 URL. We'll return the preview URL or similar.
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to fetch track' });
  }
});

// download endpoint - proxies the mp3 stream
app.get('/download/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // in reality we would use Tidal's stream endpoint and pipe the data
    // since Tidal doesn't allow direct mp3 downloads from public API, we'll just fetch the track and return its preview url
    const track = await tidalRequest(`tracks/${id}`);
    if (track && track.audioQuality && track.audioQuality.bitrate) {
      // placeholder
    }
    // for demonstration we redirect to preview
    if (track.previewUrl) {
      return res.redirect(track.previewUrl);
    }
    res.status(404).json({ error: 'no download available' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to download' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
