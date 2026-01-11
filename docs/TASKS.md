# CV Optimizer — Task Breakdown

## Phase 1 Tasks

### Backend

#### Stripe Integration
- [ ] Create Stripe products for credit packs
- [ ] Create Stripe prices ($5, $10, $20, $50)
- [ ] Implement `/api/checkout/route.ts` — create Checkout Session
- [ ] Implement `/api/webhooks/stripe/route.ts` — handle events
- [ ] Connect Stripe customer to Supabase user
- [ ] Add credits on successful payment (webhook)

#### Database
- [x] `user_balances` table — created with stripe_customer_id
- [x] `credit_transactions` table — created with Stripe references
- [x] `stripe_events` table — created for webhook idempotency
- [x] `add_credits` RPC function
- [x] `spend_credits` RPC function
- [x] `link_stripe_customer` RPC function
- [x] `get_user_by_stripe_customer` RPC function
- [ ] Update pricing config for per-page model

#### API Routes
- [ ] `GET /api/credits/balance` — get current balance
- [ ] `GET /api/credits/transactions` — get transaction history
- [ ] `POST /api/credits/estimate` — estimate cost before action

### Frontend

#### UI Components (shadcn/ui)
- [x] Install and configure shadcn/ui (tailwind-merge, clsx, cva)
- [x] Button component (with variants)
- [x] Card components (Card, CardHeader, CardTitle, etc.)
- [x] Badge component (with success/warning variants)
- [x] Skeleton component
- [x] Progress component (Radix)
- [x] Separator component (Radix)
- [x] Input component
- [x] Label component (Radix)
- [x] Textarea component
- [x] Dialog component (Radix)
- [x] Tooltip component (Radix)
- [x] Toast/Sonner component
- [x] Barrel export (components/ui/index.ts)

#### Dashboard Widgets
- [x] `CreditsWidget` — balance display with top-up CTA
- [x] `StatsWidget` — CVs optimized, generated, credits used, total spent
- [x] `ActivityWidget` — recent transactions list
- [x] `dashboard.ts` — data fetching functions
- [x] Integrate widgets into `/app/page.tsx`

#### Pages
- [x] Redesign `/app` page with new dashboard (Dashboard Overview section added)
- [ ] Create `/app/pricing` page — credit packs
- [ ] Create `/app/billing` page — transaction history
- [ ] Update navigation with new sections

#### User Flows
- [ ] Purchase credits flow (button → Stripe → success)
- [ ] Insufficient credits warning before action
- [ ] Success/error states for payments

### Design
- [ ] Color palette finalization
- [ ] Typography scale
- [ ] Spacing system
- [ ] Component variants (primary, secondary, ghost)
- [ ] Dark mode support (optional Phase 1)

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
