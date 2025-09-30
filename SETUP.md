# Setup Guide (Solo MVP v1.1)

This guide sets up the managed backend and environment for development and deployment.

## 1) Create Projects
- Vercel: Create a new Next.js project (we will scaffold next).
- Supabase: Create a new project in EU (Frankfurt) for GDPR alignment.

## 2) Apply Database Schema & Policies
- Open Supabase SQL Editor and run, in order:
  1. `supabase/schema.sql`
  2. `supabase/policies.sql`
  3. `supabase/storage.sql`

## 3) Configure Auth
- Enable email/magic-link authentication in Supabase Auth settings.
- Set site URL (Vercel preview URL for testing; update to production domain at launch).

## 4) Environment Variables
- Copy `.env.example` to your local `.env` (for local dev) and to Vercel Project Settings → Environment Variables.
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase → Project Settings → API
  - `NEXT_PUBLIC_SITE_URL` (your deployed base URL, e.g., https://ai-cv-optimizer-five.vercel.app)
  - `SUPABASE_SERVICE_ROLE` (server-only, never exposed to client)
  - `OPENAI_API_KEY`
  - Optional: Upstash tokens for rate limiting; Stripe keys if enabling billing
- Optional overrides: `CV_GENERATION_RATE_LIMIT`, `CV_GENERATION_RATE_WINDOW`, `CV_GENERATION_MONTHLY_LIMIT`, `CV_OPTIMIZE_RATE_LIMIT`, `CV_OPTIMIZE_RATE_WINDOW`, `CV_OPTIMIZE_MONTHLY_LIMIT` (set to `0` for unlimited)
- Logging: request IDs are added automatically; use Vercel + Supabase logs (JSON output) for telemetry.

## 5) Storage
- Bucket `cv-uploads` is created by `supabase/storage.sql`.
- Client uploads should set `x-upsert: true` and will auto-assign `owner = auth.uid()`.

## 6) Next.js App (coming next)

## 7) Plans & quotas
- After deploying, use the Plan & Usage card on `/app` to switch between Free and Pro presets (dev helper).
- All per-user limits live in the Supabase `user_entitlements` table; defaults mirror the free tier.

- We will scaffold Next.js 14 with Tailwind and shadcn/ui, add Supabase client (SSR helpers), and route handlers for:
  - `/api/cv`, `/api/cv/:id/optimize`, `/api/jd`, `/api/generate`, `/api/generated/:id`, `/api/export/cv/:id`.
- Runtime dependencies added so far: `@supabase/*`, `zod` (form validation), `mammoth` (DOCX extraction), `diff-match-patch` (diff rendering), `@radix-ui/react-dropdown-menu` (UI primitives).

## 8) Changelog
- After each iteration, append a short entry to `CHANGELOG.md` under Unreleased and reference relevant task IDs from `Tasks.md`.

---

If you run into SQL errors, ensure your Supabase project has `pgcrypto` enabled (it is enabled by default in most projects) and re-run the files in order.


