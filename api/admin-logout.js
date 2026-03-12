const COOKIE_NAME = 'admin_session';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const isProd = process.env.VERCEL_ENV === 'production';
  const cookie = [
    COOKIE_NAME + '=',
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Strict'
  ];
  if (isProd) cookie.push('Secure');

  res.setHeader('Set-Cookie', cookie.join('; '));
  return res.status(200).json({ ok: true });
};
