# CV Optimizer — Product Roadmap

## Vision

**"Help me get the job I'm applying for RIGHT NOW"**

AI-powered CV optimization platform that tailors your CV for specific job descriptions.
Credits-based pricing — pay per operation, not subscriptions.

---

## Core Concept: CV Branching

```
Original CV (uploaded, immutable)
    │
    ▼
Master CV (AI-optimized baseline)
    │
    ├── Branch: "Google SWE" (tailored to JD)
    │       └── v1 → v2 → v3 (iterations)
    │
    ├── Branch: "Meta PM" (tailored to JD)
    │       └── v1 → v2
    │
    └── Branch: "Startup CTO" (tailored to JD)
            └── v1
```

User can iterate on branches until satisfied, then export.

---

## 2026 Trajectory

### Q1: CV Optimization (Phase 1) ← WE ARE HERE
**JTBD:** "Help me tailor my CV for this specific job"

- [ ] Upload CV → Create Master CV
- [ ] Add JD → Create Branch (tailored CV)
- [ ] Re-generate / Refine iterations
- [ ] Export ready CV
- [ ] Credits system + Stripe checkout
- [ ] Clean UI with sidebar navigation

### Q2: Smart Job Search (Phase 2)
**JTBD:** "Help me find jobs that match my profile"

- [ ] MCP integrations (LinkedIn, Indeed, Glassdoor)
- [ ] AI matching: JD ↔ User Profile
- [ ] "Jobs for you" personalized feed
- [ ] Save & organize interesting JDs

### Q3: Auto-Apply (Phase 3)
**JTBD:** "Help me apply faster"

- [ ] Application form auto-fill agent
- [ ] Application tracking dashboard
- [ ] Status monitoring (applied → interview → offer)
- [ ] Response detection

### Q4: Interview Prep (Phase 4)
**JTBD:** "Help me prepare for interviews"

- [ ] Email/portal response analysis
- [ ] Voice AI sparring partner
- [ ] Role-specific preparation
- [ ] Common questions by company/role

---

## Phase 1 Details

### Credit Operations

| Operation | Credits | Description |
|-----------|---------|-------------|
| Create Master CV | 5 | Deep AI optimization of original |
| New Branch (per JD) | 3 | JD analysis + tailored generation |
| Re-generate | 1 | New attempt, same inputs |
| Refine | 2 | User feedback → targeted edit |

### Credit Packs

| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 10 | $10 | $1.00 |
| Basic | 25 | $20 | $0.80 |
| Pro | 60 | $40 | $0.67 |
| Enterprise | 150 | $75 | $0.50 |

### UI Structure

```
/app
├── Dashboard        ✓ Overview + credits widget
├── CV Lab           ✓ Master + Branches workflow
├── Jobs             ✓ Saved JDs (manual add)
├── Applications     🔒 Coming Q2
├── Billing          ✓ Credits + transactions
└── Settings         ✓ Profile
```

### AI Architecture (No Fine-tuning)

Using skills + tools approach:
- **Skill file:** CV optimization best practices, ATS rules, industry specifics
- **Examples:** Before/after CV pairs for few-shot learning
- **Tools:** analyze_jd(), score_match(), suggest_keywords()
- **Provider:** OpenRouter (model flexibility)

---

## Architecture Decisions

### Design System
- **Tailwind CSS v4** — already in place
- **shadcn/ui** — for consistent, customizable components
- **Radix UI** — accessible primitives (already using dropdown-menu)

### Database
- **Supabase** — PostgreSQL with RLS
- Credits system tables exist (`user_balances`, `credit_transactions`)
- RPC functions exist (`add_credits`, `spend_credits`)

### Payments
- **Stripe** — Checkout Sessions for one-time payments
- **Stripe** — Subscriptions for Phase 2
- **Webhooks** — for credit fulfillment

### Infrastructure
- **Vercel** — hosting and edge functions
- **Upstash Redis** — rate limiting
- **OpenAI** — AI model (gpt-4o-mini)

---

## Success Metrics

### Phase 1
- Users can purchase credits via Stripe
- Users see accurate balance and spending
- Conversion rate from free to paid

### Phase 2
- Subscription retention rate
- History feature adoption

### Phase 3
- Application tracking usage
- CV performance improvement data
