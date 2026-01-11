---
name: stripe-integration
description: Implement Stripe payment processing for robust, PCI-compliant payment flows including checkout, subscriptions, webhooks, and credits systems. Use when integrating Stripe payments, building subscription systems, implementing secure checkout flows, or managing credits-based pricing.
---

# Stripe Integration Expert

Master Stripe payment processing integration for robust, PCI-compliant payment flows including checkout, subscriptions, webhooks, refunds, and credits-based systems.

## When to Use This Skill

- Implementing payment processing in web/mobile applications
- Setting up subscription billing systems
- Handling one-time payments and recurring charges
- Building credits/top-up payment systems
- Processing refunds and disputes
- Managing customer payment methods
- Implementing SCA (Strong Customer Authentication) for European payments

## Core Concepts

### 1. Payment Flows

**Checkout Session (Hosted)**
- Stripe-hosted payment page
- Minimal PCI compliance burden
- Fastest implementation
- Supports one-time and recurring payments

**Payment Intents (Custom UI)**
- Full control over payment UI
- Requires Stripe.js for PCI compliance
- More complex implementation
- Better customization options

**Payment Links (No-Code)**
- Shareable payment URLs
- No code required
- Good for simple products

### 2. Webhooks

**Critical Events:**
- `checkout.session.completed`: Checkout completed
- `payment_intent.succeeded`: Payment completed
- `payment_intent.payment_failed`: Payment failed
- `customer.subscription.updated`: Subscription changed
- `customer.subscription.deleted`: Subscription canceled
- `invoice.paid`: Subscription invoice paid
- `charge.refunded`: Refund processed

### 3. Products & Prices

**Products** represent what you're selling.
**Prices** define how much and how often to charge.

```javascript
// One-time price (for credits)
const price = await stripe.prices.create({
  product: productId,
  unit_amount: 500, // $5.00 in cents
  currency: 'usd',
});

// Recurring price (for subscriptions)
const recurringPrice = await stripe.prices.create({
  product: productId,
  unit_amount: 1999, // $19.99/month
  currency: 'usd',
  recurring: { interval: 'month' }
});
```

---

## Quick Start (Next.js + TypeScript)

### Checkout Session

```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId, userId, credits } = await req.json();

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: {
      user_id: userId,
      credits: credits.toString()
    }
  });

  return Response.json({ url: session.url });
}
```

### Payment Link

```typescript
const paymentLink = await stripe.paymentLinks.create({
  line_items: [{ price: priceId, quantity: 1 }],
  metadata: { product_type: 'credits' }
});
// Share paymentLink.url
```

---

## Webhook Handling (Next.js)

```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency check
  const eventId = event.id;
  if (await isEventProcessed(eventId)) {
    return new Response('Already processed', { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }
    }

    await markEventProcessed(eventId);
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const credits = parseInt(session.metadata?.credits || '0');

  if (session.mode === 'payment' && credits > 0) {
    // Add credits to user
    await addCreditsToUser(userId, credits, session.payment_intent as string);
  }
}
```

---

## Credits System (Supabase Integration)

### Database Schema

```sql
-- User credits balance
create table user_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null unique,
  balance integer not null default 0,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Credit transactions audit trail
create table credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  amount integer not null, -- positive = add, negative = use
  type text not null, -- 'purchase', 'usage', 'refund', 'subscription'
  description text,
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table user_credits enable row level security;
alter table credit_transactions enable row level security;

-- Policies
create policy "Users can view own credits"
  on user_credits for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can view own transactions"
  on credit_transactions for select to authenticated
  using (auth.uid() = user_id);
```

### PostgreSQL Functions

```sql
-- Add credits (after purchase)
create or replace function add_credits(
  p_user_id uuid,
  p_amount integer,
  p_type text,
  p_stripe_payment_id text default null
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_credits (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id) do update set
    balance = public.user_credits.balance + p_amount,
    updated_at = now();

  insert into public.credit_transactions (user_id, amount, type, stripe_payment_id)
  values (p_user_id, p_amount, p_type, p_stripe_payment_id);
end;
$$;

-- Use credits (with balance check)
create or replace function use_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_balance integer;
begin
  select balance into v_balance
  from public.user_credits where user_id = p_user_id for update;

  if v_balance is null or v_balance < p_amount then
    return false;
  end if;

  update public.user_credits
  set balance = balance - p_amount, updated_at = now()
  where user_id = p_user_id;

  insert into public.credit_transactions (user_id, amount, type, description)
  values (p_user_id, -p_amount, 'usage', p_description);

  return true;
end;
$$;
```

---

## Customer Management

```typescript
// Create customer and link to Supabase user
async function createStripeCustomer(user: User) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { supabase_user_id: user.id }
  });

  // Store in Supabase
  await supabase
    .from('user_credits')
    .upsert({ user_id: user.id, stripe_customer_id: customer.id });

  return customer;
}

// Customer Portal (manage subscriptions)
async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/account`,
  });
  return session.url;
}
```

---

## Refund Handling

```typescript
async function createRefund(
  paymentIntentId: string,
  amount?: number, // partial refund in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // omit for full refund
    reason
  });

  // Deduct credits if applicable
  if (refund.status === 'succeeded') {
    // Handle credit reversal in your database
  }

  return refund;
}
```

---

## Testing

### Test Card Numbers

| Card | Number | Use Case |
|------|--------|----------|
| Success | `4242424242424242` | Successful payment |
| Declined | `4000000000000002` | Generic decline |
| 3D Secure | `4000002500003155` | Requires authentication |
| Insufficient Funds | `4000000000009995` | Insufficient funds |

### Local Webhook Testing

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
```

---

## MCP Tools Available

The Stripe MCP provides these tools:

| Tool | Description |
|------|-------------|
| `create_product` | Create a new product |
| `list_products` | List all products |
| `create_price` | Create a price for a product |
| `list_prices` | List all prices |
| `create_customer` | Create a customer |
| `list_customers` | List customers |
| `create_payment_link` | Create a payment link |
| `list_payment_intents` | List payment intents |
| `create_invoice` | Create an invoice |
| `list_invoices` | List invoices |
| `create_refund` | Create a refund |
| `create_coupon` | Create a coupon |
| `list_coupons` | List coupons |
| `list_subscriptions` | List subscriptions |
| `cancel_subscription` | Cancel a subscription |
| `update_subscription` | Update a subscription |
| `retrieve_balance` | Get account balance |
| `list_disputes` | List disputes |
| `update_dispute` | Update dispute with evidence |

---

## Best Practices

### Security
1. **Always verify webhook signatures** - Never trust unverified events
2. **Use metadata** to link Stripe objects to your database
3. **Never expose secret keys** to the client
4. **Handle PCI compliance** - Use Stripe.js, never raw card data

### Reliability
1. **Implement idempotency** - Handle webhook events exactly once
2. **Don't rely on client-side confirmation** - Always use webhooks
3. **Handle all error cases** gracefully
4. **Log all payment events** for debugging

### User Experience
1. **Use Checkout Sessions** for fastest implementation
2. **Provide Customer Portal** for subscription management
3. **Send email receipts** (Stripe handles this)
4. **Show clear error messages** on payment failures

### Testing
1. **Use test mode keys** during development
2. **Test with Stripe CLI** for webhooks
3. **Test all card scenarios** (success, decline, 3DS)
4. **Test subscription lifecycle** (create, update, cancel)

---

## Pricing Models for cv-optimizer

### Per-Page Credits ($1/page)

| Pack | Credits | Price | Per Credit |
|------|---------|-------|------------|
| Starter | 5 | $5 | $1.00 |
| Basic | 12 | $10 | $0.83 |
| Pro | 30 | $20 | $0.67 |
| Enterprise | 100 | $50 | $0.50 |

### Monthly Subscription (Phase 2)

| Plan | Credits/month | Price | Extras |
|------|---------------|-------|--------|
| Basic | 20 | $15/mo | History |
| Pro | 50 | $30/mo | History + Priority |
| Team | 200 | $99/mo | Multi-user |
