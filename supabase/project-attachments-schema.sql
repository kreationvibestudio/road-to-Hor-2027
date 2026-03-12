-- Project attachments (documents and images)
-- Run this in Supabase Dashboard → SQL Editor.
-- Also create a Storage bucket named "project-attachments" in Dashboard → Storage.

create table if not exists public.project_attachments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  content_type text,
  file_size bigint
);

-- Optional: allow service role to manage; anon has no access (admin uses API with cookie).
-- RLS is on by default in Supabase; add policy if you use anon key for storage.
-- Storage bucket "project-attachments" should be private; API uses service role to upload/download.
