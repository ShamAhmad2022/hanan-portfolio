---
name: points-payments
description: igotme's monetization — the points system and PayPal checkout. Use when building point purchases, spending points on premium features, crediting/deducting balances, or enforcing the free-tier 3-active-problems cap. Core rule — points and money are ALWAYS server-authoritative; never trust client-sent totals or prices.
---

# Points & PayPal payments

igotme is monetized with **points**: users buy point bundles via **PayPal**, then spend points on premium features (AI character customization, AI-suggested solutions, story regeneration, the personal letter). Free users are capped at **3 active problems**. This skill is the money path — treat it as security-sensitive.

> **The one rule that prevents every money bug:** the client may *request* an action, but the **server** decides the price, the balance, and whether the spend is allowed. Never trust a point total, bundle price, or "I already paid" flag sent from the browser. Recompute everything server-side.

## Where things live

- **Bundles** (size + price, non-translatable) → `lib/constants/points-bundles.ts`, keyed by a stable `bundleId`. The client shows them; the **server looks up the real price by `bundleId`** at checkout.
- **Balance** → a column on the user's row in Supabase (see `data-model`), mutated **only** by the service-role client inside Route Handlers.
- **Transactions** → a `point_transactions` ledger row per credit/debit (audit + idempotency).
- **Server endpoints** → `src/app/api/**/route.ts` (outside `[locale]`), per `api-folder`.
- **Client** → data hooks in `lib/hooks/data/points.ts` (`useGetPoints`, `useCreateCheckout`, `useCaptureCheckout`); premium-feature spends go through their own feature mutations (see `ai-story-generation`).

## Buying points (PayPal flow)

PayPal is a three-step server-trusted dance. The client renders buttons with `@paypal/react-paypal-js`; the **amount is never set by the client**.

```
[Points page] user picks bundleId
      │  POST /api/checkout            { bundleId }
      ▼
/api/checkout/route.ts            ← look up bundle price by bundleId (server), create PayPal order
      │  { orderId }
      ▼
<PayPalButtons> approves          ← user pays in the PayPal popup
      │  POST /api/checkout/capture   { orderId }
      ▼
/api/checkout/capture/route.ts    ← capture order, VERIFY paid amount == bundle price,
      │                              credit points (service role), write point_transactions
      ▼
onSuccess                         ← invalidate ["GetPoints"]; balance refreshes
```

Route Handlers (all server-only, using `PAYPAL_CLIENT_ID`/`PAYPAL_SECRET`):

- **`/api/checkout`** — derive the user (`getUser()`), look up `bundleId` → price from `points-bundles.ts`, create a PayPal order for that amount, return `orderId`.
- **`/api/checkout/capture`** — capture the order with PayPal, then **verify the captured amount matches the bundle price** before crediting. Credit points + insert a `point_transactions` row **idempotently** (key on PayPal `captureId` so a retried request can't double-credit).
- **`/api/webhooks/paypal`** — verify the PayPal webhook signature, then reconcile (credit if the capture endpoint didn't, using the same idempotency key). Return 2xx fast. Webhooks are the safety net for dropped responses.

## Spending points (premium features)

Every premium action goes through a server endpoint that does the check-and-deduct **atomically**, then performs the work:

1. Derive the user server-side (`getUser()`).
2. Read the feature's cost from a server-side constant (not the request).
3. **Atomically** check `balance >= cost` and deduct — use a Postgres function / RPC or a transaction with row locking so two concurrent requests can't both spend the last points (see `data-model`).
4. Perform the action (e.g. call Gemini — see `ai-story-generation`). **If it fails, refund** the points (or deduct only after success, inside the same transaction).
5. Write a `point_transactions` debit row. Return the new balance in the `ItemResponse` so the client can update.

```ts
// lib/hooks/data/points.ts
export const useGetPoints = () => {
  const { locale } = useLocale();
  const client = new AxiosClient<unknown, PointsBalance>({ endpoint: Endpoints.GET_POINTS, baseURL: "/", locale });
  return useQuery({ queryKey: ["GetPoints"], queryFn: () => client.getItem() });
};
```

Mirror the balance in the Redux `points-slice` for instant UI, but **the server response is the source of truth** — invalidate `["GetPoints"]` after any purchase or spend.

## Free-tier limit (3 active problems)

The cap is **enforced server-side** in the create-problem handler, not in the UI:

- On `POST /api/problems` (create), count the user's problems with `status = 'active'`. If the user is on the free tier and the count is `>= 3`, reject with a clear error the client can surface ("You've reached 3 active problems — resolve or archive one, or upgrade").
- The client may *also* disable the "new problem" button when at the cap (read from `useGetProblems`), but that's UX only — the server is the gate.
- "Active" is a problem `status` (see `data-model`); resolving/archiving a problem frees a slot.

## Security checklist

- [ ] Prices come from server-side constants by `bundleId` — never from the request body.
- [ ] Captured PayPal amount is verified against the expected price before crediting.
- [ ] Credits/debits are **idempotent** (keyed on PayPal `captureId` / a request key) — retries can't double-apply.
- [ ] Balance is mutated only by the **service-role** client inside Route Handlers; RLS blocks client-side balance writes (see `data-model`).
- [ ] Spend is atomic (RPC/transaction + row lock) — no double-spend race; failed actions refund.
- [ ] The 3-active-problems cap is enforced in the create handler, not just the UI.
- [ ] Webhook signature verified; webhook + capture share an idempotency key.
