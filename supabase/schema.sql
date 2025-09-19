-- Solo MVP v1.1 – Supabase Schema
-- Apply in Supabase SQL Editor or via migration tooling

-- Extensions (ensure pgcrypto for gen_random_uuid)
create extension if not exists pgcrypto;

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  job_title text,
  location text,
  professional_summary text,
  website_url text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  embellishment_level int2 default 3 check (embellishment_level between 1 and 5),
  data_retention_days int2 default 90,
  ai_training_consent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CVs
create table if not exists public.cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  original_filename text,
  docx_path text, -- Supabase Storage object path (optional)
  text_content text not null,
  is_reference boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job Descriptions (paste-only in MVP)
create table if not exists public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  company text,
  text_content text not null,
  keywords jsonb,
  created_at timestamptz default now()
);

-- Generated CVs (tailored per JD)
create table if not exists public.generated_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id uuid not null references public.cvs(id) on delete cascade,
  jd_id uuid not null references public.job_descriptions(id) on delete cascade,
  tailored_text text not null,
  optimization_notes jsonb,
  match_score numeric(4,2),
  status text default 'pending' check (status in ('pending','completed','approved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI Runs (usage & cost)
create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_type text not null check (run_type in ('optimize_cv','analyze_jd','generate_tailored_cv')),
  provider text not null default 'openai',
  model text not null,
  tokens_input int default 0,
  tokens_output int default 0,
  cost_usd numeric(8,4) default 0,
  status text default 'success' check (status in ('success','failed')),
  metadata jsonb,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_cvs_user on public.cvs(user_id, created_at desc);
create index if not exists idx_jd_user on public.job_descriptions(user_id, created_at desc);
create index if not exists idx_gc_user on public.generated_cvs(user_id, created_at desc);

