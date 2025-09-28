# Product Requirements Document (PRD)
## AI-Powered CV Optimization Platform – Solo MVP v1.1

### 1. Product Vision
Deliver a solo-friendly, managed-stack web application that helps job seekers tailor their CVs to specific job descriptions with transparent AI assistance. Prioritize low operational complexity (Vercel + Supabase), ethical guardrails, and user control over AI changes.

### 2. Problem Statement
Job seekers struggle to customize their CVs quickly and confidently for multiple openings:
- Manual tailoring is time-consuming and repetitive
- It is hard to extract key requirements from job descriptions
- Users are unsure which experience to emphasize for each role
- Writing polished, ATS-friendly content is challenging without support
- Tracking multiple applications becomes overwhelming

### 3. Target Audience
- **Primary**: Active job seekers (professionals, graduates, career changers)
- **Secondary**: Career coaches and small recruiting agencies
- **Demographics**: English-speaking, tech-comfortable users receptive to AI tooling
- **Geographic**: Global (initial focus on EU/US time zones)

### 4. Core Features (Solo MVP v1.1)

#### 4.1 Authentication & Profile
- Email/magic link authentication via Supabase Auth
- Dashboard gated behind session-aware layout
- Profile form for personal details, professional summary, links, embellishment level, data retention preference

#### 4.2 CV Intake & Reference Optimization
- Paste CV text (primary path) and upload DOCX/TXT files (5 MB cap)
- Supabase Storage bucket (`cv-uploads`) with per-user policies
- Automated text extraction for DOCX via Mammoth; TXT stored directly
- AI-powered reference optimization with change summary, rationale, and confidence indicators
- Reference CV selection (single active reference at a time)

#### 4.3 Job Description Management
- Paste job descriptions (no scraping in MVP)
- Store up to 20 per user, validate minimum length, optional title/company metadata
- Dashboard list with delete controls and keyword highlights (UI polish later)

#### 4.4 Tailored CV Generation
- Sequential AI generation per selected JD (max 5 at once) using reference CV + JD
- Match analysis metadata (notes + score) stored alongside tailored CV
- Status tracking and usage logging in Supabase (`generated_cvs`, `ai_runs`)

#### 4.5 Review & Export (Planned for next iteration)
- Section-level diff approval (Summary, Experience, Skills, Education)
- Export to HTML and DOCX with ATS-friendly templates
- These items remain open (Phase 5 roadmap)

#### 4.6 Billing & Limits (Deferred)
- Free tier quotas + Stripe Pro subscription deferred until post-MVP validation
- Supabase `user_entitlements` table tracks per-user limits (free vs future paid tiers) so billing can flip on easily

### 5. User Stories (Active Scope)

#### 5.1 Implemented Stories
- **As a job seeker**, I want to sign in with my email so that I can securely access my dashboard.
- **As a job seeker**, I want to maintain my profile so that AI understands my background.
- **As a job seeker**, I want to upload or paste my CV so that the system can optimize it.
- **As a job seeker**, I want AI to optimize my CV once so that I have a polished reference version.
- **As a job seeker**, I want to paste job descriptions so that the platform can analyze each target role.
- **As a job seeker**, I want tailored CV drafts for selected job descriptions so that I can apply faster.

#### 5.2 Upcoming Stories
- **As a job seeker**, I want to approve AI changes section by section so that I stay in control.
- **As a job seeker**, I want to export approved CVs to HTML/DOCX so that I can submit applications easily.
- **As a job seeker**, I want limits and feedback if I exceed my quota so that I understand usage.

### 6. Acceptance Criteria

#### 6.1 Authentication & Profile
- **Given** I sign in via magic link
- **When** I follow the link
- **Then** I land on the dashboard if the session is valid
- **And** I can update my profile and see saved values on refresh

#### 6.2 CV Intake & Optimization
- **Given** I paste or upload a DOCX/TXT CV within limits
- **When** the upload completes
- **Then** the CV content is stored and visible in the CV Library
- **And** I can trigger Reference Optimization and see AI-generated summaries and confidence

#### 6.3 Job Description Management
- **Given** I have a dashboard session
- **When** I paste a job description of at least 80 characters
- **Then** it is stored with optional metadata and listed in my Jobs section
- **And** I cannot exceed 20 saved job descriptions

#### 6.4 Tailored CV Generation
- **Given** I have a reference CV and selected job descriptions
- **When** I start the generation flow
- **Then** the system processes each job sequentially, storing tailored outputs
- **And** I see success or partial failure feedback and usage is logged

#### 6.5 Review & Export (Future)
- To be defined once section approval and export features are built (Phase 5)

### 7. Non-Functional Requirements

#### 7.1 Performance
- Reference optimization: < 2 minutes per run
- Tailored generation: < 2 minutes per job (sequential)
- Dashboard interactions: < 2 seconds perceived latency

#### 7.2 Security
- Supabase Auth + RLS on all tables
- Storage bucket locked to owners via policies
- HTTPS enforced via Vercel + Supabase
- Security headers (CSP, HSTS) planned in Phase 6

#### 7.3 Scalability
- Vercel serverless + Supabase managed services
- Sequential processing for MVP; queues deferred

#### 7.4 Usability
- Dashboard-first workflow with contextual guidance
- Responsive design leveraging Tailwind UI components
- Simple error messaging for validation and AI failures
- Accessibility review scheduled in Phase 6

### 8. Success Metrics
- Activation rate: % of signups completing profile + reference optimization
- Tailored CV generation completion rate per session
- Average AI tokens per generation (cost visibility)
- NPS / qualitative feedback from beta invitees

### 9. Assumptions & Constraints
- Users provide truthful CV data
- Job descriptions are pasted manually (no scraping)
- OpenAI GPT-4o mini available within budget
- Data residency preference: Supabase EU (Frankfurt)

### 10. Risks & Mitigation
- **AI hallucination**: Maintain change summaries, section approval, low embellishment defaults
- **File parsing errors**: DOCX/TXT only, paste fallback, validation errors surfaced to user
- **Cost overruns**: Usage logging per user, soft quotas, potential rate limiting via Upstash
- **Auth friction**: Clear magic link instructions; consider session debugging telemetry

### 11. Future Considerations (Post v1.1)
- Section approval & exports (currently in flight)
- Billing (Stripe subscriptions) after usability validation
- Cover letter generation and bulk workflows
- PDF parsing support and additional languages
- Integrations (LinkedIn, ATS scoring) once core flow stabilizes

### 12. Out of Scope (Solo MVP v1.1)
- Web scraping of job descriptions
- Cover letter generation
- Bulk batch processing or automation
- Mobile app and native clients
- Team collaboration features

### 13. Pricing & Go-to-Market
- Beta: invite-only free cohort until Section Review + Export complete
- Launch: Free tier (e.g., 50 tailored generations/month) + Pro plan ($12–19) with higher quotas and exports
- Instrument usage logging to inform pricing before public launch

---

**Version**: 1.1  
**Date**: 2025-09-25  
**Status**: Solo MVP – live core flows, Phase 5 in progress  
**Next Review**: After section approval & export release
