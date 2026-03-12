-- Add visibility toggle for public Funds & transparency section
-- Run in Supabase Dashboard → SQL Editor (after projects table exists).

alter table public.projects
  add column if not exists show_on_site boolean default true;

comment on column public.projects.show_on_site is 'When true and status is in_progress or completed, project is listed in Funds and transparency on the public site.';
