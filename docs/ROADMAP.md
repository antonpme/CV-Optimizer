# CV Optimizer — Product Roadmap

## Vision
AI-powered CV optimization platform with per-page pricing and credits system.

---

## Phase 1: Launch NOW (MVP)

### Core Features
- [x] CV upload and parsing (docx)
- [x] Job description input
- [x] AI-powered CV optimization
- [x] Tailored CV generation
- [x] Export to docx/html
- [ ] **Per-page pricing ($1/page)**
- [ ] **Top-up credits system**
- [ ] **Stripe checkout integration**
- [ ] **Dashboard with basic metrics**

### Pricing Model
| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 5 | $5 | $1.00 |
| Basic | 12 | $10 | $0.83 |
| Pro | 30 | $20 | $0.67 |
| Enterprise | 100 | $50 | $0.50 |

> 1 credit = 1 page of CV optimization

### Dashboard Metrics (Phase 1)
- Credits Balance
- Money Spent (total $)
- CVs Optimized (count)
- Pages Processed (count)
- Recent Activity (last 5 actions)

### Tech Tasks
See [TASKS.md](./TASKS.md) for detailed breakdown.

---

## Phase 2: Growth

### Features
- [ ] History feature (view past optimizations)
- [ ] Monthly subscription options
- [ ] Usage trends visualization
- [ ] More complex packages
- [ ] History as paid add-on (storage costs)

### Subscription Plans
| Plan | Credits/month | Price | Extras |
|------|---------------|-------|--------|
| Basic | 20 | $15/mo | History access |
| Pro | 50 | $30/mo | History + Priority |
| Team | 200 | $99/mo | Multi-user |

### Dashboard Additions
- Subscription Status widget
- Usage Trends chart
- History Browser

---

## Phase 3: Advanced

### Features
- [ ] Application tracking system
- [ ] Gmail/MCP integration for response analysis
- [ ] Role-specific fine-tuning
- [ ] A/B testing different CV versions
- [ ] AI analysis: which CV versions perform better
- [ ] Advanced analytics

### Dashboard Additions
- Applications Tracker widget
- CV Performance metrics
- Response Rate analytics

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
