const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const COOKIE_NAME = 'admin_session';
const MAX_AGE = 86400;
const BUCKET = 'project-attachments';
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

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

function safeFilename(name) {
  return (name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
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
  const projectId = (body.project_id || '').trim();
  const fileName = safeFilename(body.file_name || 'file');
  const contentType = (body.content_type || 'application/octet-stream').trim();
  const base64 = body.content_base64;

  if (!projectId || !base64 || typeof base64 !== 'string') {
    return res.status(400).json({ error: 'project_id, file_name, and content_base64 are required' });
  }

  let buffer;
  try {
    buffer = Buffer.from(base64, 'base64');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid base64 content' });
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'File too large (max 4MB)' });
  }

  const supabase = createClient(url, serviceKey);
  const uuid = crypto.randomBytes(16).toString('hex');
  const storagePath = projectId + '/' + uuid + '_' + fileName;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (uploadErr) {
    return res.status(500).json({ error: 'Upload failed: ' + uploadErr.message });
  }

  const { data: row, error: insertErr } = await supabase
    .from('project_attachments')
    .insert({
      project_id: projectId,
      file_name: fileName,
      storage_path: storagePath,
      content_type: contentType,
      file_size: buffer.length
    })
    .select()
    .single();

  if (insertErr) {
    return res.status(500).json({ error: insertErr.message });
  }

  return res.status(201).json(row);
};
