# Changelog

All notable changes to this project are documented in this file.
This log follows a pragmatic format suited for a solo developer. Each iteration should add a concise summary under Unreleased or a tagged version.

## [Unreleased]
- Add security headers (CSP, HSTS, frame protections, Referrer-Policy, Permissions-Policy) via `next.config.ts` (T6.2)
- Fix Supabase magic-link callback to accept both code and token flows, preventing redirect loops back to the sign-in form.
- Lower default free-tier quotas to 3 monthly generations/optimizations and tighten per-minute limits to 3.
- Sync dashboard plan presets with new quotas and allow reapplying the Free plan defaults via plan card.
- Auto-provision the Free plan (3/3 limits) for all users at sign-in, resyncing existing free records.
- Add request-id middleware, JSON server logging, and monthly AI spend summary (T6.3)
- Improve dashboard accessibility with skip link, skeleton loading, and updated plan messaging (T6.4)
- Refresh PRD.md, Specs.md, Security.md, and Design.md to match current Solo MVP scope (paste-only JDs, no cover letters, Next.js + Supabase stack)
- Add section-level review flow (generated_cv_sections, approval server action, dashboard UI) (T5.1, T5.2)
- Implement export service + history (/api/export/cv/[id], HTML/DOCX generation) (T5.3, T5.4)
- Add docx dependency and Supabase schema updates for exports/sections
- Add Upstash-backed rate limiting + monthly quotas for optimize/generate actions (T6.1)
- Add Supabase `user_entitlements` table, plan usage card, and per-plan limits for future Free/Pro tiers (Tier-ready v1)
- Update Tasks.md roadmap to emphasize Phase 5 approvals/exports and remove stale references
- Housekeeping: normalize documentation formatting to ASCII-friendly characters and current dates

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
