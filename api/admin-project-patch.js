const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 86400;

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

const ALLOWED_KEYS = [
  'status', 'title', 'community', 'ward', 'category',
  'allocation_amount', 'allocation_currency', 'allocation_year',
  'start_date', 'expected_end_date', 'actual_end_date', 'next_milestone_date',
  'summary', 'show_on_site'
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'PATCH') {
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
    return res.status(400).json({ error: 'Missing project id' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const updates = {};
  ALLOWED_KEYS.forEach(function (key) {
    if (body[key] !== undefined) {
      if (key === 'allocation_amount' || key === 'allocation_year') {
        updates[key] = body[key] === '' || body[key] == null ? null : Number(body[key]);
      } else if (key === 'show_on_site') {
        updates[key] = Boolean(body[key]);
      } else {
        updates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key];
      }
    }
  });
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  updates.last_updated = new Date().toISOString();

  const supabase = createClient(url, serviceKey);
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};
