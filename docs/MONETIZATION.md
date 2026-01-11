# CV Optimizer — Monetization Model

## Philosophy

**Credits-based, not subscription.**

- User pays for what they use
- No recurring charges they forget about
- Transparent: see cost BEFORE action
- Fair: heavy users pay more, light users pay less

---

## Credit Operations

| Operation | Credits | When Used |
|-----------|---------|-----------|
| **Create Master CV** | 5 | First-time AI optimization of uploaded CV |
| **New Branch** | 3 | Tailoring Master CV to specific JD |
| **Re-generate** | 1 | New attempt with same inputs (not happy with result) |
| **Refine** | 2 | User provides feedback, AI makes targeted edits |

### Why These Numbers?

- **Master CV (5):** Heavy lift, analyzes entire CV, restructures, optimizes. One-time per CV.
- **Branch (3):** JD analysis + tailoring. Main recurring operation.
- **Re-generate (1):** Low cost to encourage iteration without fear.
- **Refine (2):** More than re-gen (uses feedback), less than new branch.

---

## Credit Packs

| Pack | Credits | Price | Per Credit | Savings |
|------|---------|-------|------------|---------|
| Starter | 10 | $10 | $1.00 | — |
| Basic | 25 | $20 | $0.80 | 20% |
| Pro | 60 | $40 | $0.67 | 33% |
| Enterprise | 150 | $75 | $0.50 | 50% |

### Pack Design Rationale

**Starter (10 credits / $10):**
- Entry point, low commitment
- Enough for: 1 Master + 1 Branch + 1 Re-gen (7 credits)
- Or: 3 Branches if they already have Master elsewhere

**Basic (25 credits / $20):**
- Serious job seeker
- Enough for: 1 Master + 6 Branches (23 credits)
- Sweet spot for most users

**Pro (60 credits / $40):**
- Power user, multiple job searches
- Enough for: 2 Masters + 15 Branches + iterations

**Enterprise (150 credits / $75):**
- Career coaches, agencies
- Bulk discount for high volume

---

## Free Tier

**Option A: No free credits**
- Pros: No abuse, clear value proposition
- Cons: Higher friction to try

**Option B: Welcome bonus (3 credits)**
- Enough for 1 Branch (to see value)
- Not enough for full flow (must buy to create Master)
- Pros: Try before buy
- Cons: Potential abuse with multiple accounts

**Recommendation:** Start with Option A, add welcome bonus later if conversion is low.

---

## User Experience

### Before Operation
```
┌─────────────────────────────────────────┐
│  Create Tailored CV for "Google SWE"    │
│                                         │
│  This will cost 3 credits.              │
│  Your balance: 12 credits               │
│                                         │
│  [Cancel]              [Create Branch]  │
└─────────────────────────────────────────┘
```

### Insufficient Credits
```
┌─────────────────────────────────────────┐
│  Create Tailored CV for "Google SWE"    │
│                                         │
│  This requires 3 credits.               │
│  Your balance: 1 credit                 │
│                                         │
│  [Buy Credits]           [Cancel]       │
└─────────────────────────────────────────┘
```

### After Purchase
```
┌─────────────────────────────────────────┐
│  ✓ Payment successful!                  │
│                                         │
│  25 credits added to your account.      │
│  New balance: 26 credits                │
│                                         │
│  [Continue to CV Lab]                   │
└─────────────────────────────────────────┘
```

---

## Stripe Integration

### Products (in Stripe)
```
- cv_optimizer_starter    → 10 credits
- cv_optimizer_basic      → 25 credits
- cv_optimizer_pro        → 60 credits
- cv_optimizer_enterprise → 150 credits
```

### Flow
1. User clicks "Buy Credits" → selects pack
2. Frontend calls `/api/checkout` with pack ID
3. Backend creates Stripe Checkout Session
4. User redirected to Stripe
5. After payment → Stripe webhook fires
6. Webhook handler adds credits to `user_balances`
7. User redirected back to app with success message

### Webhook Events to Handle
- `checkout.session.completed` → Add credits
- `charge.refunded` → Remove credits (manual review)

---

## Future Considerations

### Phase 2: Subscriptions
If users want predictable monthly costs:

| Plan | Credits/month | Price | Extras |
|------|---------------|-------|--------|
| Basic | 20 | $15/mo | Roll-over unused |
| Pro | 50 | $30/mo | Priority processing |
| Team | 200 | $99/mo | Multi-user |

### Price Adjustments
If AI costs change significantly:
- **DO NOT** change credit prices mid-pack
- **DO** adjust pack prices for new purchases
- **DO** communicate changes in advance
- Credits already purchased = locked value

---

## Analytics to Track

- Conversion: Free → First purchase
- Pack distribution: Which packs sell most
- Credit usage patterns: Which operations used
- Churn: Users who don't return after credits depleted
- LTV: Total spend per user over time
