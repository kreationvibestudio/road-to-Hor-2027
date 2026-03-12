const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const supabase = createClient(url, serviceKey);

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, community, category, status, allocation_amount, allocation_currency, allocation_year, summary, start_date, expected_end_date, last_updated')
    .eq('show_on_site', true)
    .in('status', ['in_progress', 'completed'])
    .order('last_updated', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ projects: data || [] });
};
