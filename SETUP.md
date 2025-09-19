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

## 5) Storage
- Bucket `cv-uploads` is created by `supabase/storage.sql`.
- Client uploads should set `x-upsert: true` and will auto-assign `owner = auth.uid()`.

## 6) Next.js App (coming next)
- We will scaffold Next.js 14 with Tailwind and shadcn/ui, add Supabase client (SSR helpers), and route handlers for:
  - `/api/cv`, `/api/cv/:id/optimize`, `/api/jd`, `/api/generate`, `/api/generated/:id`, `/api/export/cv/:id`.

## 7) Changelog
- After each iteration, append a short entry to `CHANGELOG.md` under Unreleased and reference relevant task IDs from `Tasks.md`.

---

If you run into SQL errors, ensure your Supabase project has `pgcrypto` enabled (it is enabled by default in most projects) and re-run the files in order.
