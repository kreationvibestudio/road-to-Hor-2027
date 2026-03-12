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
    return res.status(400).json({ error: 'Missing id' });
  }

  const supabase = createClient(url, serviceKey);

  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projErr) {
    return res.status(500).json({ error: projErr.message });
  }

  const { data: updates, error: updErr } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  if (updErr) {
    return res.status(500).json({ error: updErr.message });
  }

  let attachments = [];
  const { data: attData, error: attErr } = await supabase
    .from('project_attachments')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false });
  if (!attErr && attData) attachments = attData;

  return res.status(200).json({
    project,
    updates: updates || [],
    attachments
  });
};

