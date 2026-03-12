-- Allow the admin page (using anon key) to read all rows from requests.
-- Run this in Supabase Dashboard → SQL Editor so the admin page can load requests.

create policy "Allow anon read for admin"
on public.requests
for select
to anon
using (true);
