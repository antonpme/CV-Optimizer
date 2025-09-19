-- Solo MVP v1.1 – Supabase RLS Policies
-- Enable RLS and add owner-only policies

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.job_descriptions enable row level security;
alter table public.generated_cvs enable row level security;
alter table public.ai_runs enable row level security;

-- Profiles owner policy
drop policy if exists profiles_owner on public.profiles;
create policy profiles_owner on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- CVs owner policy
drop policy if exists cvs_owner on public.cvs;
create policy cvs_owner on public.cvs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Job Descriptions owner policy
drop policy if exists jd_owner on public.job_descriptions;
create policy jd_owner on public.job_descriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Generated CVs owner policy
drop policy if exists gc_owner on public.generated_cvs;
create policy gc_owner on public.generated_cvs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AI Runs readable by owner (writes happen server-side as needed)
drop policy if exists ai_runs_owner_select on public.ai_runs;
create policy ai_runs_owner_select on public.ai_runs
  for select using (user_id = auth.uid());

