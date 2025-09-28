# Design Document
## AI-Powered CV Optimization Platform - Solo MVP v1.1

### 1. Design Philosophy
Build a calm, confidence-inspiring workspace where solo job seekers can collaborate with AI while staying in control. Clarity, transparency, and focus trump visual flash.

### 2. System Foundations
- **Framework**: Next.js App Router with Tailwind and shadcn/ui
- **Grid**: 12-column responsive grid, 8 px spacing scale
- **Color Palette**:
  - Primary: #2563eb (blue)
  - Secondary: #10b981 (green)
  - Accent: #f59e0b (amber)
  - Neutrals: #0f172a, #1f2937, #64748b, #f8fafc, #ffffff
- **Typography**: Inter (UI + body), JetBrains Mono (code / structured diff)
- **Iconography**: Lucide icons, simple outline style

### 3. Core User Journeys (MVP)
1. **Sign-in**: Landing -> email form -> magic link -> `/auth/callback` -> `/app`
2. **Profile setup**: Complete profile card -> update embellishment level, links -> see confirmation toast
3. **Reference CV**: Upload or paste CV -> view parsed text -> run AI optimization -> review change summary and confidence
4. **Job intake**: Paste job description -> optional title/company -> save to list -> manage stored jobs (max 20)
5. **Tailored generation**: Select reference CV + jobs -> choose embellishment level -> run generator -> review outputs per JD
6. **Future (Phase 5)**: Section diff approval -> export to HTML/DOCX

### 4. Screen Architecture

#### 4.1 Landing Page (stub)
- Hero: concise value prop, CTA button linking to sign-in
- Secondary info: roadmap teaser, trust badges (placeholder until content ready)

#### 4.2 Auth Pages
- `/auth/sign-in`: centered card, email input, submit button, info about magic link timing
- `/auth/callback`: spinner and status messages; redirects back home on success

#### 4.3 App Shell (`/app`)
- **Top Bar**: Product logo, breadcrumb (static: Dashboard), user avatar w/ sign-out
- **Page Layout**: Single column stack for Solo MVP to reduce cognitive load
- **Section Pattern**: Headline + helper text + card with actions

Sections in order:
0. **Plan & Usage**: Card showing current plan, monthly usage bars, and dev-only plan toggle.
1. **Profile**: Multi-column form inside card, Save button anchored bottom right, inline validation messages
2. **Reference CV Panel**: Summary area showing latest optimization metadata, button group for Optimize / set embellishment level
3. **CV Library**: Upload widget (drag/drop + browse), list of existing CVs with metadata chips (reference flag, created date)
4. **Job Descriptions**: Add form (textarea + optional fields), list with accordion view for text preview, delete buttons
5. **Tailored Results**: Generation form (checkbox list of JDs + embellishment slider), result cards with status badge, expandable detail view containing tailored text and match notes

### 5. Interaction Patterns
- **Forms**: use `useFormState`, show success toast + summary inline
- **Progress**: Buttons show spinner while server action pending; generator displays status message (success/partial/error)
- **Empty States**: Provide quick-start copy, e.g., CV library empty card with illustration placeholder
- **Errors**: Inline field errors + toast with actionable guidance
- **Focus order**: Logical top-to-bottom, ensuring keyboard navigation works without traps

### 6. Content Presentation
- **Change Summaries**: Display bullet list of high-level adjustments, highlight confidence score with badge color (green >=0.7, yellow else)
- **Tailored CV Text**: Render in monospace block with copy button; Phase 5 will add diff + inline approvals
- **Job Cards**: Show extracted keywords as tokens (future enhancement); currently display trimmed job text with toggle for full view

### 7. Accessibility & Inclusivity
- WCAG 2.1 AA contrast ratios checked for primary palette
- Focus ring uses Tailwind `ring-offset-2 ring-sky-500`
- All interactive elements reachable via keyboard (tab order mirrors layout)
- Provide descriptive aria labels for upload triggers and action buttons
- Support reduced motion preference by disabling non-essential transitions

### 8. Responsive Considerations
- **Mobile**: Stack sections with sticky CTA for uploads/generation; collapse navigation into menu icon
- **Tablet**: Two-column layout for profile form and CV/job lists where space permits
- **Desktop**: Standard single column with generous whitespace; future expansions can introduce secondary column for analytics

### 9. Visual Assets & Future Enhancements
- Illustrations: Plan for simple line art representing CV/job matching (Phase 6 polish)
- Export Modal (Phase 5): overlay with format toggles, preview snippet, status badges
- Approval UI (Phase 5): two-pane diff, section accordions with accept/reject buttons and rationale chips

### 10. Deliverables & Handoff
- Figma file (todo) capturing current flows and upcoming approval/export concepts
- Component inventory document aligning shadcn/ui primitives with design tokens
- QA checklist covering auth, uploads, generation, error states

---

**Version**: 1.1  
**Date**: 2025-09-25  
**Status**: Solo MVP - dashboard live, approval/export in design backlog  
**Next Review**: After Phase 5 UI delivery
