const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 86400; // 24 hours

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

function verifyCookie(cookieValue, secret) {
  if (!cookieValue || !secret) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [timestamp, sig] = parts;
  const expected = sign(timestamp, secret);
  if (expected !== sig) return false;
  const age = Date.now() - Number(timestamp);
  if (age < 0 || age > MAX_AGE * 1000) return false;
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    return res.status(500).json({ error: 'Admin not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const password = body.password;

  if (password !== secret) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const timestamp = String(Date.now());
  const sig = sign(timestamp, secret);
  const value = timestamp + '.' + sig;

  const isProd = process.env.VERCEL_ENV === 'production';
  const cookie = [
    COOKIE_NAME + '=' + value,
    'Path=/',
    'Max-Age=' + MAX_AGE,
    'HttpOnly',
    'SameSite=Strict'
  ];
  if (isProd) cookie.push('Secure');

  res.setHeader('Set-Cookie', cookie.join('; '));
  return res.status(200).json({ ok: true });
};
