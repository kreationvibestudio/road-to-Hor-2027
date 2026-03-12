-- Fix "Invalid time zone specified: Etc/Unknown" in Supabase
-- Run this in Supabase Dashboard → SQL Editor → New query

-- Option 1: Use UTC (recommended by Supabase for consistency)
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Option 2: Use Nigeria time (Africa/Lagos) if you prefer local time in the DB
-- ALTER DATABASE postgres SET timezone TO 'Africa/Lagos';

-- After running, you may need to disconnect and reconnect (or restart the pooler)
-- for the change to take effect for new connections.
