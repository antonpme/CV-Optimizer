# Technical Specifications
## AI-Powered CV Optimization Platform - Solo MVP v1.1

### 0. Overview (Authoritative for v1.1)
- **Frontend**: Next.js 15 App Router on Vercel (TypeScript, Tailwind, shadcn/ui)
- **Backend**: Supabase (Postgres + Auth + Storage) with server actions in Next.js
- **AI**: OpenAI GPT-4o mini (JSON schema enforced) via shared helper (`lib/ai.ts`)
- **Storage**: Supabase Storage bucket `cv-uploads` (DOCX/TXT only, private)
- **Processing**: Synchronous server actions; sequential JD handling (no queues yet)
- **Auth**: Supabase email/magic-link; SSR helpers for middleware, server comps/actions
- **Deployment**: Vercel project `ai-cv-optimizer`; Supabase FRA1 region
- **Observability**: Supabase logs + Vercel logs; Sentry planned (Phase 6)

### 1. System Architecture

#### 1.1 High-Level Diagram
```
Browser (Next.js App Router pages)
    -> (HTTPS)
Vercel Serverless (React server components + server actions)
    -> (Supabase client w/ service role for actions)
Supabase Postgres (RLS enforced tables) + Auth + Storage
    ->
OpenAI APIs (GPT-4o mini)
```

#### 1.2 Core Components
- **App Router pages**: `/` (marketing placeholder), `/auth/sign-in`, `/app` dashboard, `/auth/callback` route handler
- **Server actions**: Auth (magic link), profile CRUD, CV upload/optimization, JD management, tailored CV generation
- **Shared libs**: Supabase client wrappers (`createClientForServerComponent`, `createClientForServerAction`), AI helper, Zod schemas
- **Supabase SQL**: `supabase/schema.sql`, `supabase/policies.sql`, `supabase/storage.sql`

### 2. Technology Stack Alignment

#### 2.1 Frontend
- Next.js 15 (App Router, Server Components)
- TypeScript 5.x
- Tailwind CSS + shadcn/ui primitives
- Zod for server-side validation
- React Server Actions (`useFormState`) for mutations

#### 2.2 Backend & Data
- Supabase Postgres 15 with RLS on all tables
- Supabase Storage private bucket for DOCX/TXT
- Supabase Auth (email link) + sessions consumed via server helpers
- No custom Node/Express server in v1.1

#### 2.3 AI Integration
- OpenAI REST API via `openai` SDK (configured in `lib/ai.ts`)
- JSON schema prompts for reference optimization and tailored generation
- Usage logging persisted to `ai_runs`

### 3. Database Schema (Supabase)

#### 3.1 Tables
- `profiles`: user metadata, embellishment level, retention preference
- `cvs`: uploaded/pasted CV content, reference flag
- `optimized_cvs`: AI-optimized reference outputs with rationale (Phase 3)
- `job_descriptions`: pasted JD text + metadata (20 per user cap)
- `generated_cvs`: tailored CV outputs with notes and match score
- `user_entitlements`: per-user plan configuration (plan name, per-minute/monthly limits, export flag)
- `ai_runs`: provider usage logs for cost/telemetry

#### 3.2 Row Level Security
Policies restrict reads/writes to `auth.uid() = user_id` (or equivalent) for all tables. `supabase/policies.sql` contains:
- `profiles`: owner select/insert/update
- `cvs`, `job_descriptions`, `generated_cvs`: owner CRUD policies
- `ai_runs`: insert by owner, select by owner (future admin override TBD)

#### 3.3 Storage Policies
`supabase/storage.sql` provisions bucket `cv-uploads` and policies ensuring `auth.uid() = owner` for CRUD.

### 4. Supabase Configuration
- Region: `aws-1-eu-central-1`
- Auth: Magic link enabled, Site URL = production Vercel URL to support email deep links
- JWT secret stored in Vercel env vars (`SUPABASE_SERVICE_ROLE_KEY` server-only)
- DB migrations applied via SQL editor (tracked in repo)

### 5. Application Flows

#### 5.1 Sign-in Flow
1. User submits email via `/auth/sign-in` form (server action `signInWithEmail`)
2. Supabase sends magic link; redirect to `/auth/callback`
3. Route handler exchanges code, sets session cookie, redirects to `/app`

#### 5.2 Profile Management
- `/app` server component fetches profile; `ProfileForm` posts to `updateProfile`
- Zod validates inputs; results persisted via upsert on `profiles`

#### 5.3 CV Intake & Reference Optimization
- Upload form accepts DOCX/TXT or paste
- DOCX parsed with `mammoth`; content stored in `cvs`, original file uploaded to bucket
- First CV auto-marked as reference
- `optimizeReferenceCv` action calls OpenAI, stores optimized text + change summary in `optimized_cvs`

#### 5.4 Job Description Management
- `addJobDescription` validates paste length, enforces limit of 20
- Jobs stored with optional title/company; displayed in dashboard
- Deletions remove record and revalidate `/app`

#### 5.5 Tailored CV Generation
- User selects up to 5 JDs and an embellishment level
- `generateTailoredCvs` loops sequentially, calling `callTailoredCv`
- Outputs saved in `generated_cvs` with status; partial failures logged

### 6. Pending Features (Phase 5+)
- Section-level approval UI + API
- Export service for HTML/DOCX (templating, signed URLs)
- Rate limiting (Upstash), CSP/Security headers, Sentry telemetry
- Stripe billing + quotas
- Automated test suite (Playwright) prior to beta

### 7. Environment Variables
| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client/server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Elevated Supabase operations (server actions only) |
| `SUPABASE_JWT_SECRET` | server | Token validation (if needed) |
| `OPENAI_API_KEY` | server | GPT-4o mini access |
| `NEXT_PUBLIC_SITE_URL` | client/server | Used for auth redirects |
| `NEXT_TELEMETRY_DISABLED` | optional | Disable Next telemetry locally |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | server | Rate limiting for AI actions (Upstash) |
| `CV_GENERATION_RATE_LIMIT` / `CV_GENERATION_RATE_WINDOW` | server (optional) | Override per-user rate limit for tailored CV runs (default 3 per minute) |
| `CV_OPTIMIZE_RATE_LIMIT` / `CV_OPTIMIZE_RATE_WINDOW` | server (optional) | Override per-user rate limit for reference optimizations (default 3 per minute) |
| `CV_GENERATION_MONTHLY_LIMIT` | server (optional) | Monthly tailored CV quota per user (default 3) |
| `CV_OPTIMIZE_MONTHLY_LIMIT` | server (optional) | Monthly reference optimization quota per user (default 3) |

### 8. Deployment & CI/CD
- GitHub repo `antonpme/CV-Optimizer`
- Vercel auto-deploy on push to `main`
- `npm run lint` and `npm run build` executed during Vercel build (Turbopack)
- Manual QA post-deploy until automated tests land

### 9. Observability & Logging
- Supabase logs (database, auth) accessible via dashboard
- `ai_runs` table captures provider usage, errors
- Vercel request logs for server actions
- Sentry integration planned to capture client/server errors (Phase 6)

### 10. Data Retention
- User-configurable `data_retention_days` stored in `profiles`
- Actual cleanup job not yet implemented; documented as future automation
- Manual deletion available via UI (CV/JD delete buttons)

### 11. Security Highlights
- Supabase RLS + storage policies enforced
- Secrets managed via Vercel environment variables
- HTTPS-only endpoints
- Pending work: CSP, rate limiting, export signing, DSR automation

### 12. Testing Strategy (Current)
- Manual verification for auth, profile, CV upload, optimization, JD generation
- TODO: Introduce Playwright smoke covering sign-in -> tailored CV flow (Phase 8)

---

**Version**: 1.1  
**Date**: 2025-09-25  
**Status**: Solo MVP - Phase 6 in progress (rate limiting live)  
**Next Review**: After Phase 6 hardening (headers, telemetry, accessibility)

