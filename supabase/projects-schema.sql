-- Projects schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor.

-- Constituency projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  community text,
  ward text,
  category text,
  status text default 'planned', -- planned | in_progress | completed | on_hold
  allocation_amount numeric,
  allocation_currency text default 'NGN',
  allocation_year int,
  start_date date,
  expected_end_date date,
  actual_end_date date,
  next_milestone_date date,
  summary text,
  last_updated timestamptz default now()
);

-- Updates / milestones for each project
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  project_id uuid not null references public.projects(id) on delete cascade,
  summary text not null,
  details text,
  status text, -- optional: if this update changes status
  progress_percent int,
  created_by text
);

-- Extend requests table to support statuses and linking to projects
alter table public.requests
  add column if not exists status text default 'received',
  add column if not exists linked_project_id uuid references public.projects(id),
  add column if not exists internal_notes text;

