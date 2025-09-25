# Product Requirements Document (PRD)
## AI-Powered CV Optimization Platform — Solo MVP v1.1

### 1. Product Vision
Deliver a solo-friendly, managed-stack web application that empowers job seekers to optimize their CVs for specific job applications using AI, with a simple, transparent, and ATS-friendly workflow. Prioritize low operational complexity (Vercel + Supabase), ethical boundaries, and user control over AI changes.

### 2. Problem Statement
Job seekers face significant challenges in tailoring their CVs for multiple job applications:
- Time-consuming manual customization for each application
- Difficulty identifying key requirements from job descriptions
- Uncertainty about optimal CV content for specific roles
- Lack of professional writing skills for effective presentation
- Overwhelming process when applying to multiple positions

### 3. Target Audience
- **Primary**: Active job seekers (professionals, recent graduates, career changers)
- **Secondary**: Career coaches, recruitment agencies, HR professionals
- **Demographics**: Tech-savvy individuals comfortable with AI tools
- **Geographic**: Global (English-speaking markets initially)

### 4. Core Features (MVP)

#### 4.1 User Authentication & Profile Management
- Email/magic-link authentication (Supabase Auth)
- Personal profile (name, location, professional summary)
- Social and website links (LinkedIn, GitHub, portfolio)
- Profile management and settings (embellishment level, retention)

#### 4.2 CV Input & Optimization
- Supported formats (MVP): DOCX and TXT (PDF later)
- Paste CV text option (primary path)
- AI-powered optimization to create a “Reference CV”
- Change summary with transparency and confidence indicators
- CV library to manage uploads/pasted versions with single reference selection

#### 4.3 Job Description Management
- Paste job description text (no web scraping in MVP)
- JD parsing and requirement analysis
- Keyword extraction and categorization
- Store up to 20 roles, manage selections, and trigger tailored CV generation per job

#### 4.4 AI-Powered CV Generation
- Tailored CV creation per pasted JD
- Matching analysis between Reference CV and JD requirements
- Embellishment control (1–5) with ethical guardrails
- Sequential processing with progress indicators

#### 4.5 Approval & Export
- Section-level review and approval (Summary, Experience, Skills, Education)
- Side-by-side diff of changes with accept/reject per section
- Export to HTML and DOCX (PDF later)

#### 4.6 Billing & Limits (MVP)
- Free tier with monthly quotas (e.g., 50 tailored generations)
- Pro subscription via Stripe (e.g., 300–500 generations, multi-JD generation)
- Per-user usage tracking and soft limits

#### 4.7 AI Settings & Controls
- Embellishment level (1–5)
- Transparency: change summaries and rationale
- Guardrails to prevent fabrication (no invented employers, dates, certs)

### 5. User Stories

#### 5.1 Primary User Stories
- **As a job seeker**, I want to upload my CV so that AI can optimize it for my target roles
- **As a job seeker**, I want to add multiple job URLs so that AI can analyze different positions
- **As a job seeker**, I want AI to generate tailored CVs for each job so that I can apply more effectively
- **As a job seeker**, I want to review and approve AI-generated content so that I maintain control
- **As a job seeker**, I want cover letters generated automatically so that I save time

#### 5.2 Secondary User Stories
- **As a user**, I want to control how much AI embellishes my experience so that I stay truthful
- **As a user**, I want to manage my personal profile so that AI understands me better
- **As a user**, I want to export my optimized CVs so that I can submit applications
- **As a user**, I want to track my application progress so that I stay organized

### 6. Acceptance Criteria (MVP)

#### 6.1 CV Input & Optimization
- **Given** I have a CV in DOCX/TXT format or pasted text
- **When** I upload or paste it to the platform
- **Then** AI analyzes and creates an optimized Reference CV
- **And** I can view a change summary and rationale
- **And** The Reference CV is saved in my profile

#### 6.2 Job Description Processing
- **Given** I have job descriptions
- **When** I paste the job descriptions (up to 5 at once in MVP)
- **Then** AI analyzes each job description
- **And** Extracts key requirements and keywords
- **And** Stores them for CV generation

#### 6.3 Tailored CV Generation
- **Given** I have a Reference CV and job descriptions
- **When** I generate tailored CVs
- **Then** AI creates tailored CVs for each position (sequentially)
- **And** Highlights relevant experience and skills
- **And** Matches JD requirements with CV content

#### 6.4 Approval & Export
- **Given** AI has generated tailored CVs
- **When** I review them
- **Then** I can approve per section or edit content
- **And** I can export approved CVs to HTML/DOCX

### 7. Non-Functional Requirements (MVP)

#### 7.1 Performance
- CV optimization: < 2 minutes
- JD analysis: < 1 minute per JD
- Tailored generation: < 2 minutes per JD (sequential)
- Response time: < 2 seconds for UI interactions

#### 7.2 Security
- Supabase Auth + Row Level Security (RLS)
- Data encryption in transit and at rest (managed)
- Storage policies for user-owned files
- Secure headers (CSP, HSTS) and SSR protection
- Rate limiting and abuse prevention (Upstash)

#### 7.3 Scalability
- Vercel serverless + Supabase managed scaling
- Sequential processing for MVP; background jobs later (Edge Functions)

#### 7.4 Usability
- Intuitive user interface
- Mobile-responsive design
- Clear progress indicators
- Helpful tooltips and guidance
- Accessibility compliance (WCAG 2.1)

### 8. Success Metrics

#### 8.1 User Engagement
- User registration rate
- CV upload completion rate
- Job URL submission rate
- CV approval rate
- User retention rate

#### 8.2 Business Metrics
- Number of optimized CVs generated
- Processing success rate
- User satisfaction score
- Conversion rate to premium features
- Customer acquisition cost

#### 8.3 Technical Metrics
- API response times
- Error rates
- System uptime
- Processing queue length
- Resource utilization

### 9. Assumptions & Constraints

#### 9.1 Assumptions
- Users have basic computer literacy
- Users understand their career goals
- Job descriptions are publicly accessible
- AI can effectively analyze and optimize content
- Users will provide accurate information

#### 9.2 Constraints
- No web scraping in MVP; pasted JDs only
- 5 JDs per generation batch (MVP)
- File size limit 5MB; DOCX/TXT only (MVP)
- AI API call quotas per user; budget caps
- Regional data residency (EU by default)

### 10. Risks & Mitigation (MVP)

#### 10.1 Technical Risks
- **AI API reliability**: Retries with backoff; graceful degradation
- **File parsing errors**: DOCX/TXT only; robust validation; paste fallback
- **Performance issues**: Sequential processing; later Edge Functions if needed
- **Export fidelity**: Start with HTML/DOCX; validate ATS-friendly structure

#### 10.2 Business Risks
- **User adoption**: Clear value, frictionless onboarding, free tier
- **Compliance**: Privacy-first design; Supabase EU region
- **Cost management**: Quotas, token logging, model choice (4o-mini)
- **Competition**: UX quality, transparency, ATS focus

### 11. Future Considerations
- Web scraping of JDs (respect TOS/robots.txt)
- Cover letter generation
- Bulk operations and automation
- ATS partner integrations and scoring
- Multi-language support
- LinkedIn and job board integrations
- Mobile app

### 12. Out of Scope (MVP)
- Web scraping
- Cover letters
- Bulk generation and operations
- Advanced analytics and reporting
- Direct job application submission
- Mobile application (web-only initially)
- Real-time collaboration

### 13. Pricing & Plans (Recommendation)
- Beta: Invite-only free tier to validate UX and quality
- Public launch: Free tier (e.g., 50 generations/month) + Pro subscription ($12–19/mo) with higher limits and export options
- Usage logging for tokens/cost per user; soft caps and upgrade prompts

---

**Version**: 1.1  
**Date**: 2025-09-08  
**Status**: Solo MVP  
**Next Review**: After beta feedback
