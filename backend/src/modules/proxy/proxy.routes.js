const express = require('express');
const http = require('http');
const https = require('https');
const env = require('../../config/env');

const router = express.Router();

function isAllowedPicsumHost(hostname) {
  return hostname === 'picsum.photos' || hostname.endsWith('.picsum.photos');
}

function isRedirect(statusCode) {
  return (
    statusCode === 301 ||
    statusCode === 302 ||
    statusCode === 303 ||
    statusCode === 307 ||
    statusCode === 308
  );
}

function fetchAndPipeImage(urlString, res, redirectCount = 0) {
  if (redirectCount > 5) {
    res.status(502).json({ error: 'Bad Gateway', message: 'Too many redirects' });
    return;
  }

  let url;
  try {
    url = new URL(urlString);
  } catch {
    res.status(400).json({ error: 'Bad Request', message: 'Invalid url' });
    return;
  }

  if ((url.protocol !== 'https:' && url.protocol !== 'http:') || !isAllowedPicsumHost(url.hostname)) {
    res.status(400).json({ error: 'Bad Request', message: 'Only picsum.photos URLs are allowed' });
    return;
  }

  const client = url.protocol === 'https:' ? https : http;
  const req = client.get(
    url,
    {
      headers: {
        'User-Agent': 'NestHeavenImageProxy/1.0',
        Accept: 'image/*',
      },
    },
    (upstream) => {
      if (isRedirect(upstream.statusCode) && upstream.headers.location) {
        upstream.resume();
        const nextUrl = new URL(upstream.headers.location, url).toString();
        fetchAndPipeImage(nextUrl, res, redirectCount + 1);
        return;
      }

      if (!upstream.statusCode || upstream.statusCode < 200 || upstream.statusCode >= 300) {
        upstream.resume();
        res
          .status(502)
          .json({ error: 'Bad Gateway', message: `Upstream status ${upstream.statusCode || 'unknown'}` });
        return;
      }

      const contentType = upstream.headers['content-type'];
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');

      upstream.on('error', () => {
        if (!res.headersSent) {
          res.status(502).json({ error: 'Bad Gateway', message: 'Upstream error' });
        }
      });

      upstream.pipe(res);
    }
  );

  req.on('error', () => {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad Gateway', message: 'Failed to fetch image' });
    }
  });
}

// Dev-only image proxy to avoid emulator/device internet issues.
router.get('/image', (req, res) => {
  if (env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const url = req.query.url || req.query.u;
  if (typeof url !== 'string' || !url) {
    return res.status(400).json({ error: 'Bad Request', message: 'url query param is required' });
  }

  return fetchAndPipeImage(url, res);
});

module.exports = router;

