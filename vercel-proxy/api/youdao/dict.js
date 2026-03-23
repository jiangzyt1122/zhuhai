const crypto = require('node:crypto');

const YOUDAO_ENDPOINT = 'https://openapi.youdao.com/api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const cleanString = (value) => `${value ?? ''}`.trim().replace(/\s+/g, ' ');

const buildInput = (query) => {
  if (query.length <= 20) {
    return query;
  }

  return `${query.slice(0, 10)}${query.length}${query.slice(-10)}`;
};

module.exports = async (req, res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed.' });
    return;
  }

  const appKey = process.env.YOUDAO_APP_KEY;
  const appSecret = process.env.YOUDAO_APP_SECRET;

  if (!appKey || !appSecret) {
    res.status(500).json({
      message: 'Missing YOUDAO_APP_KEY or YOUDAO_APP_SECRET.'
    });
    return;
  }

  const query = cleanString(req.query?.q);
  if (!query) {
    res.status(400).json({ message: 'Missing query parameter q.' });
    return;
  }

  const salt = crypto.randomUUID();
  const curtime = `${Math.floor(Date.now() / 1000)}`;
  const sign = crypto
    .createHash('sha256')
    .update(`${appKey}${buildInput(query)}${salt}${curtime}${appSecret}`)
    .digest('hex');

  const upstreamParams = new URLSearchParams({
    q: query,
    from: 'auto',
    to: 'zh-CHS',
    appKey,
    salt,
    sign,
    signType: 'v3',
    curtime,
    ext: 'mp3',
    voice: '0'
  });

  try {
    const upstreamResponse = await fetch(YOUDAO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: upstreamParams.toString()
    });

    const text = await upstreamResponse.text();
    res.status(upstreamResponse.status);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(text);
  } catch (error) {
    res.status(502).json({
      message: error instanceof Error ? error.message : 'Failed to reach Youdao service.'
    });
  }
};
