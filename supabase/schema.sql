-- Solo MVP v1.1 - Supabase Schema
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
  docx_path text,
  text_content text not null,
  is_reference boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optimized CVs (latest reference optimisations)
create table if not exists public.optimized_cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cv_id uuid not null references public.cvs(id) on delete cascade,
  optimized_text text not null,
  optimization_summary jsonb,
  ai_model_used text,
  confidence_score numeric(4,2),
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
  status text default 'pending' check (status in ('pending','in_review','approved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Generated CV Sections (section-level review data)
create table if not exists public.generated_cv_sections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_cv_id uuid not null references public.generated_cvs(id) on delete cascade,
  section_name text not null,
  original_text text not null,
  suggested_text text not null,
  final_text text,
  rationale text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  ordering int2 not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CV Export history
create table if not exists public.cv_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generated_cv_id uuid not null references public.generated_cvs(id) on delete cascade,
  format text not null check (format in ('html','docx')),
  status text not null default 'completed' check (status in ('completed','failed')),
  notes text,
  created_at timestamptz default now()
);

-- AI Runs (usage & cost)
create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_type text not null check (run_type in ('optimize_cv','cv_generation')),
  provider text not null default 'openai',
  model text not null,
  tokens_input int default 0,
  tokens_output int default 0,
  cost_usd numeric(8,4) default 0,
  status text default 'success' check (status in ('success','failed')),
  metadata jsonb,
  created_at timestamptz default now()
);
-- User entitlements (plan-based quotas)
create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro','custom')),
  gen_rate_limit int default 5,
  gen_window_seconds int default 60,
  gen_monthly_limit int default 50,
  opt_rate_limit int default 8,
  opt_window_seconds int default 60,
  opt_monthly_limit int default 30,
  allow_export boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_cvs_user on public.cvs(user_id, created_at desc);
create index if not exists idx_jd_user on public.job_descriptions(user_id, created_at desc);
create index if not exists idx_gc_user on public.generated_cvs(user_id, created_at desc);
create index if not exists idx_optimized_cvs_user on public.optimized_cvs(user_id, created_at desc);
create index if not exists idx_sections_cv on public.generated_cv_sections(user_id, generated_cv_id, ordering);
create index if not exists idx_exports_user on public.cv_exports(user_id, created_at desc);



