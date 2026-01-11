# CV Optimizer — Database Schema

## Current Tables

### Existing (in Supabase)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User profile data | Yes |
| `cvs` | Uploaded CVs | Yes |
| `job_descriptions` | Job descriptions | Yes |
| `generated_cvs` | Tailored CVs | Yes |
| `generated_cv_sections` | CV sections for review | Yes |
| `optimized_cvs` | Optimized reference CVs | Yes |
| `cv_exports` | Export history | Yes |
| `ai_runs` | AI request logs | Yes |
| `user_entitlements` | Plan limits | Yes |
| `user_balances` | Credit balance | Yes |
| `credit_transactions` | Credit history | Yes |

---

## Phase 1: Schema Changes

### Add Stripe fields

```sql
-- Add stripe_customer_id to user_balances
ALTER TABLE public.user_balances
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_user_balances_stripe_customer
ON public.user_balances(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;
```

### Stripe Events Table (Idempotency)

```sql
-- Track processed Stripe events
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

-- RLS: Only service role can access
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- No public policies - service role only
```

### Update credit_transactions

```sql
-- Add Stripe reference
ALTER TABLE public.credit_transactions
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_pi
ON public.credit_transactions(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;
```

---

## RPC Functions

### Existing Functions

```sql
-- add_credits(p_user_id UUID, p_amount INT) -> INT
-- Returns new balance after adding credits

-- spend_credits(p_user_id UUID, p_amount INT) -> INT | NULL
-- Returns new balance or NULL if insufficient
```

### New Functions Needed

```sql
-- Link Stripe customer to user
CREATE OR REPLACE FUNCTION public.link_stripe_customer(
  p_user_id UUID,
  p_stripe_customer_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_balances
  SET stripe_customer_id = p_stripe_customer_id
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_balances (user_id, credits, stripe_customer_id)
    VALUES (p_user_id, 0, p_stripe_customer_id);
  END IF;
END;
$$;

-- Get user by Stripe customer ID
CREATE OR REPLACE FUNCTION public.get_user_by_stripe_customer(
  p_stripe_customer_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM public.user_balances
  WHERE stripe_customer_id = p_stripe_customer_id;

  RETURN v_user_id;
END;
$$;
```

---

## Dashboard Queries

### Credits Balance
```sql
SELECT credits FROM user_balances WHERE user_id = $1;
```

### Total Spent (All Time)
```sql
SELECT
  COUNT(*) as transaction_count,
  COALESCE(SUM(ABS(delta_credits)), 0) as total_credits_spent
FROM credit_transactions
WHERE user_id = $1 AND delta_credits < 0;
```

### CVs Optimized (All Time)
```sql
SELECT COUNT(*) FROM ai_runs
WHERE user_id = $1 AND status = 'success';
```

### Pages Processed (All Time)
```sql
-- Assuming 1 credit = 1 page
SELECT COALESCE(SUM(ABS(delta_credits)), 0) as pages
FROM credit_transactions
WHERE user_id = $1 AND type = 'spend';
```

### Recent Activity
```sql
SELECT
  id,
  delta_credits,
  type,
  note,
  created_at
FROM credit_transactions
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 5;
```

### Monthly Spending
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COALESCE(SUM(ABS(delta_credits)), 0) as credits_spent
FROM credit_transactions
WHERE user_id = $1 AND delta_credits < 0
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC
LIMIT 12;
```

---

## Migration Plan

### Step 1: Add columns (non-breaking)
```sql
ALTER TABLE public.user_balances
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

ALTER TABLE public.credit_transactions
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
```

### Step 2: Create new tables
```sql
CREATE TABLE IF NOT EXISTS public.stripe_events (...);
```

### Step 3: Create RPC functions
```sql
CREATE OR REPLACE FUNCTION public.link_stripe_customer(...);
CREATE OR REPLACE FUNCTION public.get_user_by_stripe_customer(...);
```

### Step 4: Create indexes
```sql
CREATE INDEX IF NOT EXISTS idx_user_balances_stripe_customer ...;
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_pi ...;
```

---

## Security Notes

1. **stripe_events** — No public RLS policies, service role only
2. **stripe_customer_id** — Should not be exposed to client
3. **Webhook verification** — Always verify Stripe signatures
4. **Idempotency** — Check stripe_events before processing
