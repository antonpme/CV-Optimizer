# Development Roadmap & Tasks
## AI-Powered CV Optimization Platform — Solo MVP v1.1

### Legend & Workflow
- Mark a task complete by changing `- [ ]` to `- [x]`. Keep ordering; dependencies rely on sequence.
- Each task ID (`T#.#`) must remain unchanged to preserve cross-references.
- Optional tasks are marked `(optional)`.
- After finishing a task: verify acceptance criteria, run lint/tests (if applicable), commit with a scoped message, then update this file and append a brief entry to `CHANGELOG.md`.
- At the end of each phase print `Phase <n> complete. Proceed to Phase <n+1>? (y/n)` in the terminal, summarize the phase in `CHANGELOG.md` under Unreleased, and wait for confirmation before continuing.
- Prep step before Phase 1: review `PRD.md`, `Specs.md`, `Design.md`, and `Security.md` to align on scope and constraints.

---

- [x] `T1.1` Vercel project bootstrap (Prereq: —)
  Output: Vercel project with main preview deployment, custom domain placeholder, environment variable skeleton committed.
  Implementation: ✅ COMPLETE — Imported GitHub repo as `ai-cv-optimizer`, configured env vars (Supabase + OpenAI). First build failed pre-app; ready to redeploy after Next.js scaffold.
- [x] `T1.2` Supabase project setup (Prereq: T1.1)
  Output: Supabase project in EU (Frankfurt), RLS enabled globally, anon/service keys stored securely.
  Implementation: ✅ COMPLETE — Supabase (FRA1) created via Vercel, Auth (magic link) enabled, schema/policies/storage scripts applied; keys stored for Vercel envs (regenerate prod before launch).
- [x] `T1.3` Next.js codebase scaffolding (Prereq: T1.1)
  Output: Next.js 14 + TypeScript repo with Tailwind, shadcn/ui, linting/formatting tooling configured.
  Implementation: ✅ COMPLETE — `create-next-app` scaffolded with App Router, Tailwind, ESLint, src/ structure; lint run; CHANGELOG updated. Local `node_modules/` present (ignored). Remove `tmp-next-delete/` directory when OS permits.
- [x] `T1.4` Supabase Auth integration (Prereq: T1.2, T1.3)
  Output: Email/magic-link sign-in flow working locally and on Vercel preview, SSR session helper in place.
  Implementation: ✅ COMPLETE — Added Supabase auth helpers (middleware, server actions, callback route), magic-link email form with `useFormState`, sign-out action, and home page session awareness.
- [x] `T1.5` Initialize CHANGELOG.md (Prereq: —)
  Output: `CHANGELOG.md` created with Solo MVP v1.1 entry and Unreleased section.
   Implementation: ✅ COMPLETE — Initial changelog added capturing doc updates and MVP scope.

### Phase 2 – Data & Profile (Week 2)
- [x] `T2.1` Database schema migration (Prereq: T1.2)
  Output: Tables `profiles`, `cvs`, `job_descriptions`, `generated_cvs`, `ai_runs` created with Supabase SQL migration.
  Implementation: ✅ COMPLETE — `supabase/schema.sql` provisions all core tables (profiles, cvs, job descriptions, generated CVs, AI runs) with defaults and timestamps.
- [x] `T2.2` RLS and indexes (Prereq: T2.1)
  Output: RLS owner policies and helpful indexes applied to all tables; verified with Supabase policy checks.
  Implementation: ✅ COMPLETE — `supabase/policies.sql` + `supabase/storage.sql` enforce per-user access on tables and `cv-uploads` bucket, with user-scoped indexes for dashboard queries.
- [x] `T2.3` Profile & settings UI (Prereq: T1.4, T2.2)
  Output: Profile page capturing summary, links, embellishment level, retention days; persists to Supabase.
  Implementation: ✅ COMPLETE — Protected `/app` layout with nav + sign-out, Zod-validated profile form using server actions, success/error messaging, and Supabase upsert with timestamps.

### Phase 3 – CV Intake & Reference Optimization (Week 3)
- [x] `T3.1` CV upload/paste API (`/api/cv`) (Prereq: T2.2)
  Output: API route storing DOCX/TXT uploads or pasted text in Supabase Storage + `cvs` table with validation.
  Implementation: ✅ COMPLETE — Server action `uploadCv` (DOCX via Mammoth, TXT or pasted text) saves content to `cvs`, uploads files to `cv-uploads`, auto-selects first reference CV, and revalidates `/app`.
- [ ] `T3.2` Reference optimization endpoint (`/api/cv/:id/optimize`) (Prereq: T3.1)
  Output: AI-powered reference CV creator saving change summary, confidence, and marking reference flag.
  Implementation: Pending.
- [ ] `T3.3` AI gateway module (Prereq: T3.2)
  Output: Shared OpenAI client with JSON schema enforcement, retry/backoff, token logging to `ai_runs`.
  Implementation: Pending.
- [ ] `T3.4` CV intake UI (Prereq: T3.1)
  Output: Upload + paste experience with progress state, error handling, and reference CV preview.
  Implementation: Pending.

### Phase 4 – JD Management & Tailored Generation (Week 4)
- [ ] `T4.1` JD paste API (`/api/jd`) (Prereq: T2.2)
  Output: Endpoint accepting up to 5 pasted descriptions, storing metadata/keywords; includes validation.
  Implementation: Pending.
- [ ] `T4.2` Tailored generation endpoint (`/api/generate`) (Prereq: T3.2, T4.1)
  Output: Sequential generator mapping Reference CV + selected JDs to tailored outputs with progress.
  Implementation: Pending.
- [ ] `T4.3` JD management UI (Prereq: T4.1)
  Output: JD list with add/delete, keyword highlights, and status indicators.
  Implementation: Pending.
- [ ] `T4.4` Tailored CV viewer (Prereq: T4.2)
  Output: UI to inspect tailored CVs, match analysis, and generation history per JD.
  Implementation: Pending.

### Phase 5 – Review & Export (Week 5)
- [ ] `T5.1` Section diff & approval UI (Prereq: T4.4)
  Output: Side-by-side view with section-level accept/reject for Summary, Experience, Skills, Education.
  Implementation: Pending.
- [ ] `T5.2` Approval endpoints (`/api/generated/:id/approve|reject`) (Prereq: T4.2)
  Output: API updates status, records timestamps, and supports manual edits before approval.
  Implementation: Pending.
- [ ] `T5.3` Export service (`/api/export/cv/:id`) (Prereq: T5.2)
  Output: HTML and DOCX exports with ATS-safe templates and signed download URLs.
  Implementation: Pending.
- [ ] `T5.4` Export UI controls (Prereq: T5.3)
  Output: Export modal with format selection, metadata toggles, and download history list.
  Implementation: Pending.

### Phase 6 – Hardening & UX Polish (Week 6)
- [ ] `T6.1` Rate limiting & quotas (Prereq: T4.2)
  Output: Upstash Ratelimit + per-user usage caps enforced on generation endpoints, with friendly error states.
  Implementation: Pending.
- [ ] `T6.2` Security headers & CSP (Prereq: T1.3)
  Output: Strict CSP, HSTS, X-Frame-Options=DENY, Referrer-Policy configured in Next.js.
  Implementation: Pending.
- [ ] `T6.3` Telemetry & logging (Prereq: T3.3)
  Output: Sentry integrated (client/server), correlation IDs in logs, `ai_runs` cost dashboard query.
  Implementation: Pending.
- [ ] `T6.4` UX/accessibility polish (Prereq: T5.4)
  Output: Empty states, loading skeletons, keyboard navigation, WCAG 2.1 AA color contrast fixes.
  Implementation: Pending.

### Phase 7 – Billing Enablement (Week 7, optional)
- [ ] `T7.1` Stripe subscription backend (optional) (Prereq: T3.3)
  Output: Stripe products/prices, webhook handler, Supabase user entitlements table.
  Implementation: Pending.
- [ ] `T7.2` Billing UI & gating (optional) (Prereq: T7.1)
  Output: Pricing modal, upgrade prompts, feature gating by tier, customer portal link.
  Implementation: Pending.

### Phase 8 – Beta, QA & Launch (Week 8)
- [ ] `T8.1` End-to-end test suite (Prereq: T5.4, T6.4)
  Output: Playwright tests covering upload→optimize→generate→approve→export; CI run green.
  Implementation: Pending.
- [ ] `T8.2` Robust content testing (Prereq: T3.1)
  Output: DOCX/TXT fuzz suite, long-text handling verification, manual edge case checklist signed off.
  Implementation: Pending.
- [ ] `T8.3` Beta invite + feedback loop (Prereq: T8.1)
  Output: Invite system, feedback form, baseline metrics dashboard, onboarding email copy.
  Implementation: Pending.
- [ ] `T8.4` Post-beta review & launch prep (Prereq: T8.3)
  Output: Beta findings report, prioritized bug list, launch checklist with go/no-go criteria, release notes finalized in `CHANGELOG.md`.
  Implementation: Pending.

---

**Version**: 1.1  
**Date**: 2025-09-08  
**Status**: Solo MVP  
**Next Review**: After beta feedback and scope update for Phase 2
