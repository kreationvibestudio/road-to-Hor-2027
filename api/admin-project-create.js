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
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !url || !serviceKey) {
    return res.status(500).json({ error: 'Admin or Supabase not configured' });
  }

  const cookieValue = getCookie(req, COOKIE_NAME);
  if (!verifyCookie(cookieValue, secret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const title = (body.title || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const row = {
    title,
    community: (body.community || '').trim() || null,
    ward: (body.ward || '').trim() || null,
    category: (body.category || '').trim() || null,
    status: (body.status || 'planned').trim() || 'planned',
    allocation_amount: body.allocation_amount != null && body.allocation_amount !== '' ? Number(body.allocation_amount) : null,
    allocation_currency: (body.allocation_currency || 'NGN').trim() || 'NGN',
    allocation_year: body.allocation_year != null && body.allocation_year !== '' ? Number(body.allocation_year) : null,
    start_date: (body.start_date || '').trim() || null,
    expected_end_date: (body.expected_end_date || '').trim() || null,
    next_milestone_date: (body.next_milestone_date || '').trim() || null,
    summary: (body.summary || '').trim() || null
  };

  const supabase = createClient(url, serviceKey);
  const { data, error } = await supabase.from('projects').insert(row).select().single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
};
