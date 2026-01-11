# CV Optimizer — Task Breakdown

## Phase 1 Scope (Refined)

**JTBD:** "Help me tailor my CV for this specific job"

### Core User Flow
1. Upload CV → Create Master CV (5 credits)
2. Add JD → Create Branch/Tailored CV (3 credits)
3. Re-generate (1 credit) or Refine with feedback (2 credits)
4. Export ready CV

---

## UI Redesign (Priority 1)

### Layout Architecture
- [ ] Implement sidebar navigation layout
- [ ] Remove legacy single-page scroll design
- [ ] Create app shell with consistent header

### Pages Structure
```
/app
├── /dashboard      → Overview + credits widget
├── /cv-lab         → Master + Branches workflow (CV Branching)
├── /jobs           → Saved JDs (manual add)
├── /applications   → 🔒 Coming Q2 (placeholder)
├── /billing        → Credits + transaction history
└── /settings       → Profile
```

### Cleanup (Remove Legacy)
- [ ] Remove `PlanUsageCard` component (old Free/Pro system)
- [ ] Remove `CostSummaryCard` component (old AI spend tracking)
- [ ] Remove "Switch to Free/Pro" dev helper buttons
- [ ] Remove `user_entitlements` references from dashboard
- [ ] Consolidate pricing configs into single source

### New Components Needed
- [ ] `Sidebar` — navigation component
- [ ] `AppShell` — layout wrapper with sidebar + header
- [ ] `CVLabView` — Master + Branches interface
- [ ] `BranchCard` — single branch display with versions
- [ ] `CostConfirmDialog` — "This will cost X credits. Proceed?"

---

## Backend

### Stripe Integration
- [ ] Create Stripe products for credit packs (10/25/60/150)
- [ ] Create Stripe prices ($10, $20, $40, $75)
- [ ] Implement `/api/checkout/route.ts` — create Checkout Session
- [ ] Implement `/api/webhooks/stripe/route.ts` — handle events
- [ ] Connect Stripe customer to Supabase user
- [ ] Add credits on successful payment (webhook)

### Database (Already Done)
- [x] `user_balances` table — with stripe_customer_id
- [x] `credit_transactions` table — with Stripe references
- [x] `stripe_events` table — for webhook idempotency
- [x] `add_credits` RPC function
- [x] `spend_credits` RPC function
- [x] `link_stripe_customer` RPC function
- [x] `get_user_by_stripe_customer` RPC function

### Database (New for Branching)
- [ ] Add `cv_branches` table (or extend `generated_cvs`)
- [ ] Add `branch_versions` table for iteration history
- [ ] Add version diffing support (optional, can store full text)

### API Routes
- [ ] `GET /api/credits/balance` — get current balance
- [ ] `GET /api/credits/transactions` — get transaction history
- [ ] `POST /api/credits/estimate` — estimate cost before action
- [ ] `POST /api/cv/master` — create master CV
- [ ] `POST /api/cv/branch` — create branch for JD
- [ ] `POST /api/cv/regenerate` — regenerate branch version
- [ ] `POST /api/cv/refine` — refine with user feedback

---

## UI Components (Already Done)
- [x] shadcn/ui installed and configured
- [x] Button, Card, Badge, Skeleton, Progress, Separator
- [x] Input, Label, Textarea, Dialog, Tooltip, Sonner
- [x] Dashboard widgets (Credits, Stats, Activity)

---

## Technical Improvements (Already Done)
- [x] Migrated `@supabase/auth-helpers-nextjs` → `@supabase/ssr`
- [x] Added `createServiceClient()` for webhook/admin operations
- [x] Updated `database.ts` with full type definitions
- [x] Fixed React 19 `useActionState` migration

---

## Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | From Supabase MCP |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set | From Supabase MCP |
| `NEXT_PUBLIC_SITE_URL` | ✅ Set | Production URL |
| `SUPABASE_SERVICE_ROLE` | ❌ TODO | Needed for webhooks |
| `STRIPE_SECRET_KEY` | ❌ TODO | Needed for payments |
| `STRIPE_WEBHOOK_SECRET` | ❌ TODO | Needed for webhooks |
| `OPENROUTER_API_KEY` | ❌ TODO | For AI (replacing OpenAI) |

---

## Definition of Done (Phase 1)

- [ ] Clean sidebar navigation UI
- [ ] CV Lab with Master + Branches workflow
- [ ] User can create Master CV (costs 5 credits)
- [ ] User can create Branch per JD (costs 3 credits)
- [ ] User can re-generate (1 credit) or refine (2 credits)
- [ ] User can purchase credits via Stripe
- [ ] Credits deducted on operations
- [ ] User can see balance and transaction history
- [ ] Mobile responsive
- [ ] No legacy UI remnants

---

## Technical Improvements Done

- [x] Migrated from `@supabase/auth-helpers-nextjs` to `@supabase/ssr`
- [x] Added `createServiceClient()` for webhook/admin operations
- [x] Updated all files for async Supabase client creation
- [x] Updated `database.ts` with full type definitions
- [x] Fixed pricing.ts template literal issues
- [x] Fixed cv.actions.ts - removed non-existent `industry` field reference
- [x] Created `.env.local` with Supabase credentials from MCP
- [x] Fixed sign-in-form.tsx - migrated `useFormState` → `useActionState` (React 19)

---

## Technical Debt / Cleanup

- [ ] Remove "Dev helper" plan switching buttons
- [ ] Consolidate pricing configs (`src/config/pricing.ts`, `src/lib/pricing.ts`)
- [ ] Add proper error boundaries
- [ ] Add loading states to all async components
- [ ] Implement proper logout flow
- [ ] Add telemetry/analytics hooks

---

## Environment Variables Status

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Set | From Supabase MCP |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Set | From Supabase MCP |
| `NEXT_PUBLIC_SITE_URL` | ✅ Set | `http://localhost:3000` |
| `SUPABASE_SERVICE_ROLE` | ❌ TODO | Needed for webhooks/admin |
| `OPENAI_API_KEY` | ❌ TODO | Needed for AI features |
| `STRIPE_SECRET_KEY` | ❌ TODO | Needed for payments |
| `STRIPE_WEBHOOK_SECRET` | ❌ TODO | Needed for webhooks |
| `UPSTASH_REDIS_REST_URL` | ❌ Optional | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ Optional | Rate limiting |

---

## File Structure (Current)

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts          # TODO: Stripe checkout
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts      # TODO: Stripe webhooks
│   │   └── credits/
│   │       ├── balance/route.ts  # TODO
│   │       └── transactions/route.ts # TODO
│   ├── app/
│   │   ├── page.tsx              # DONE: Dashboard + widgets integrated
│   │   ├── pricing/
│   │   │   └── page.tsx          # TODO: Credit packs
│   │   └── billing/
│   │       └── page.tsx          # TODO: Transaction history
│   └── globals.css
├── components/
│   ├── ui/                       # DONE: shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── tooltip.tsx
│   │   ├── sonner.tsx
│   │   └── index.ts
│   └── dashboard/                # DONE: Dashboard widgets
│       ├── index.ts              # Barrel export
│       └── widgets/
│           ├── index.ts          # Barrel export
│           ├── credits-widget.tsx
│           ├── stats-widget.tsx
│           └── activity-widget.tsx
├── lib/
│   ├── supabase.ts               # UPDATED: @supabase/ssr
│   ├── dashboard.ts              # NEW: Dashboard data fetching
│   ├── stripe.ts                 # TODO: Stripe client
│   └── credits.ts                # EXISTS: Credit operations
├── types/
│   └── database.ts               # UPDATED: Full types + RPC
└── config/
    └── pricing.ts                # EXISTS: Pricing config
```

---

## Next Steps (Priority Order)

1. ~~**Dashboard Widgets** — Create CreditsWidget, StatsWidget, ActivityWidget~~ ✅ DONE
2. ~~**Dashboard Redesign** — Update `/app/page.tsx` with widgets~~ ✅ DONE
3. **Stripe Products** — Create products/prices in Stripe dashboard or via MCP
4. **Checkout API** — `/api/checkout/route.ts` for Stripe Checkout Sessions
5. **Webhook Handler** — `/api/webhooks/stripe/route.ts` for payment events
6. **Pricing Page** — `/app/pricing/page.tsx` with credit packs

---

## Definition of Done (Phase 1)

- [ ] User can view credit balance
- [ ] User can purchase credits via Stripe
- [ ] Credits are automatically added after payment
- [ ] User can see spending history
- [ ] Dashboard shows all Phase 1 metrics
- [ ] UI is consistent and polished
- [ ] Mobile responsive
- [ ] Error states handled gracefully

---

## Session Log

### 2026-01-11 — Session 2 (Ren)

**Completed:**
- Fixed parsing error in `src/app/app/page.tsx` (unclosed `<section>` tag)
- Migrated `useFormState` → `useActionState` in `sign-in-form.tsx` (React 19)
- Created `.env.local` with Supabase credentials from MCP
- Verified TypeScript compiles cleanly
- Tested auth flow — magic link works, redirects to Vercel deployment
- Committed and pushed to `feature/ui-redesign` branch (49 files, 4117 additions)

**Decisions:**
- Testing on Vercel deployment instead of localhost (user preference)
- Branch: `feature/ui-redesign` for all Phase 1 work

**Next Session:**
1. Check Vercel deployment status
2. Test dashboard widgets visually on Vercel
3. Create Stripe products/prices via MCP
4. Implement `/api/checkout/route.ts`
5. Create `/app/pricing` page

**Commit:** `fbca6f1` — "feat: Phase 1 credits system foundation"

---

### 2026-01-10 — Session 1 (Ren)

**Completed:**
- Installed shadcn/ui and created 12 UI components
- Created dashboard widgets (CreditsWidget, StatsWidget, ActivityWidget)
- Created `dashboard.ts` data fetching functions
- Migrated Supabase from auth-helpers to @supabase/ssr
- Updated `database.ts` with full type definitions and RPC types
- Created documentation (TASKS.md, DATABASE.md, DESIGN-SYSTEM.md, ROADMAP.md)
- Database tables created via Supabase MCP (user_balances, credit_transactions, stripe_events)
- RPC functions created (add_credits, spend_credits, link_stripe_customer, get_user_by_stripe_customer)
