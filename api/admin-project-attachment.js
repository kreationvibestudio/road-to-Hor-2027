const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 86400;
const BUCKET = 'project-attachments';
const SIGNED_URL_EXPIRY = 3600; // 1 hour

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(String(value)).digest('hex');
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = process.env.ADMIN_PASSWORD;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !url || !serviceKey) {
    return res.status(500).json({ error: 'Admin or Supabase not configured' });
  }

  const cookieValue = getCookie(req, COOKIE_NAME);
  if (!verifyCookie(cookieValue, secret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const id = (req.query && req.query.id) || (req.url.split('?')[1] || '').split('id=')[1];
  if (!id) {
    return res.status(400).json({ error: 'Missing attachment id' });
  }

  const supabase = createClient(url, serviceKey);
  const { data: att, error: fetchErr } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !att) {
    return res.status(404).json({ error: 'Attachment not found' });
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(att.storage_path, SIGNED_URL_EXPIRY);

  if (signErr || !signed || !signed.signedUrl) {
    return res.status(500).json({ error: 'Could not generate download URL' });
  }

  return res.redirect(302, signed.signedUrl);
};
