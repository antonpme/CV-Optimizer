# Security & Compliance Documentation
## AI-Powered CV Optimization Platform - Solo MVP v1.1

### 0. MVP Security Snapshot (Authoritative for v1.1)
- **Identity & Auth**: Supabase Auth (email/magic links). Admin access guarded by Supabase dashboard MFA.
- **Access Control**: Postgres Row Level Security on every table; storage bucket policies ensure users touch only their own files.
- **Hosting Footprint**: Next.js on Vercel (HTTPS enforced), Supabase FRA1 (EU) for data residency, Supabase Storage for uploads.
- **Data Handling**: DOCX/TXT only, 5 MB max. Files stored privately; text persisted in Postgres. No cover letters, no scraping.
- **Secrets**: Managed via Vercel project settings (server-only for service role key, OpenAI, JWT secret).
- **Logging**: `ai_runs` table tracks AI usage; Supabase + Vercel logs for infra visibility. No PII in logs beyond user IDs/emails.
- **Privacy Controls**: Profile field `data_retention_days` defaults to 90; manual cleanup actions (delete CV/JD) available. Automated retention job is backlog.
- **Outstanding Work (Phase 5/6)**: Section approval integrity checks, export signing, CSP/HSTS headers, Sentry instrumentation, automated retention, DSR tooling.

The remainder of this document frames ongoing governance. Items tagged *Phase 2+* are aspirational for post-MVP hardening.

### 1. Security Principles
- **Least Privilege**: All Supabase tables and storage buckets enforce owner-only access.
- **Defense in Depth**: Auth + RLS + storage policies + server-action validation.
- **Transparency**: Users see change summaries and can reject AI edits (once Phase 5 ships).
- **Privacy by Design**: EU data residency, limited data collection, no third-party trackers.
- **Operational Simplicity**: Managed services (Vercel, Supabase) to reduce attack surface.

### 2. Data Classification & Handling
| Level | Description | Handling Notes |
| --- | --- | --- |
| Public | Marketing copy, roadmap docs | Git tracked, no restrictions |
| Internal | Design guidelines, specs | Repo access control |
| Confidential | Profiles, CV text, JD text, AI outputs | Supabase RLS, encrypted at rest, TLS in transit |
| Highly Sensitive | API keys, service role key | Stored in Vercel env vars (server-only), never in client code |

### 3. Authentication & Session Management
- Magic link sign-in; passwordless reduces credential theft surface.
- `/auth/callback` route validates Supabase session and redirects to `/app`.
- Dashboard server components check session per request; unauthenticated requests render nothing.
- Invalid or expired links fall back to sign-in page with error messaging (planned UX polish).

### 4. Authorization & RLS Enforcement
- `profiles`, `cvs`, `job_descriptions`, `generated_cvs`, `ai_runs` all enforce `auth.uid() = user_id` (or insert owner equality).
- Storage bucket `cv-uploads` enforces owner-based CRUD policies.
- Server actions use Supabase service role key only to satisfy RLS predicates (no cross-user access allowed).
- Phase 5: Introduce `generated_cvs.status` transitions (draft/pending/approved) with policies preventing edits post-approval.

### 5. Input Validation & File Safety
- CV uploads limited to DOCX/TXT; mimetype + file size checked before processing.
- DOCX parsed with Mammoth; fallback to paste to avoid arbitrary binary parsing.
- Job description form uses Zod validation (length, optional metadata).
- Phase 6+: Add antivirus scan (e.g., Cloudmersive) if we accept more formats.

### 6. AI Usage Controls
- `lib/ai.ts` centralizes OpenAI calls with model allowlist, JSON schema enforcement, and response validation.
- `ai_runs` stores prompt/response token counts, status, and metadata for audit.
- Embellishment level defaults to 3/5; guardrails in prompt prohibit fabricating employers, dates, or credentials.
- Phase 6: Introduce per-user soft quotas + Upstash rate limiting to prevent abuse.

### 7. Logging & Monitoring
- Supabase dashboard: auth logs, SQL logs for RLS violations.
- Vercel: request logs and build logs (lint/type errors).
- `ai_runs`: success/failure tracking for AI calls; leverage for support triage.
- Backlog: Sentry (client + server), log correlation IDs, cost dashboards.

### 8. Incident Response (MVP Readiness)
- Detect via Supabase/Vercel alerts or anomalous `ai_runs` entries.
- Immediate actions: revoke compromised keys (Supabase, OpenAI), rotate Vercel env vars, disable affected routes.
- User comms: email template drafted in `docs/` (todo), update changelog once resolved.
- Backlog: Formal runbooks, on-call routines, postmortem template.

### 9. Compliance Considerations
- GDPR-friendly defaults: EU hosting, limited PII (name, location, links, CV content provided by user).
- Data Subject Rights: manual export/delete via Supabase console currently; add in-app flows during Phase 6.
- No payment data processed yet; PCI scope deferred until Stripe integration.
- Privacy policy + ToS to be written before public beta (legal backlog).

### 10. Roadmap for Hardening (Phase References)
1. **Phase 5**: Section approval RLS rules, export signing, audit log for approvals.
2. **Phase 6**: CSP/HSTS, Upstash rate limiting, Sentry, keyboard-access review, DSR automation.
3. **Phase 7**: Stripe webhook security (signed events, replay protection), entitlement checks.
4. **Phase 8**: Playwright E2E tests, fuzz testing for DOCX/TXT, beta feedback loop, launch checklist.

---

**Version**: 1.1  
**Date**: 2025-09-25  
**Status**: Solo MVP - safeguards + rate limiting live, remaining hardening in phases 6-8  
**Next Review**: After completing Phase 6 (headers, telemetry, accessibility)
