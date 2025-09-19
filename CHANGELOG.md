# Changelog

All notable changes to this project are documented in this file.
This log follows a pragmatic format suited for a solo developer. Each iteration should add a concise summary under Unreleased or a tagged version.

## [Unreleased]
- Add initial Supabase SQL migrations and RLS policies (schema.sql, policies.sql, storage.sql)
- Add .env.example and SETUP.md for environment and onboarding
- Scaffold Next.js app with auth, layout, and route handlers (planned)
- Bootstrap Next.js 14 app (App Router, Tailwind, ESLint) with src/ structure (T1.3)
- Integrate Supabase auth (magic-link sign-in, middleware, callback route, sign-out) (T1.4)
- Protected `/app` dashboard layout with nav, sign-out, and Zod-validated profile form (T2.3)
- CV upload workflow (DOCX/TXT + pasted text) with Supabase Storage, reference toggle, and UI listing (T3.1)
- Reference CV optimisation flow (OpenAI JSON schema, `optimized_cvs` storage, diff preview) (T3.2)
- AI gateway helper (`lib/ai.ts`) with chat completion wrapper and usage logging (T3.3)

## [1.1] - 2025-09-08
### Added
- Introduced CHANGELOG.md for iteration tracking
- Solo MVP v1.1 plan and simplified stack (Next.js + Supabase)
- Section-level approvals and export to HTML/DOCX in scope
- Rate limiting and quotas plan (Upstash) and Sentry observability

### Changed
- PRD.md updated to Solo MVP v1.1, trimmed scope (no scraping, no cover letters, no bulk in MVP)
- Specs.md reworked for managed stack, added Supabase schema and RLS examples, MVP API endpoints, and deployment notes
- Security.md focused on MVP baseline (RLS, CSP/HSTS, limited file types) with Phase 2 items noted
- Tasks.md rewritten into an 8-week solo roadmap with explicit outputs and dependencies

### Removed
- Web scraping, bulk operations, and cover letters from MVP
- PDF parsing from MVP (DOCX/TXT only)

---

Guidelines for updates:
- Keep entries short and grouped under Added/Changed/Removed.
- Reference task IDs (e.g., T3.2) when applicable.
- When cutting a release, move items from Unreleased into a new version with date.
