---
name: data-model
description: igotme's Supabase/Postgres data model — the core tables (profiles, characters, problems, stories, point_transactions), row-level-security principles, and conventions. Use when designing the schema, adding a table, or writing RLS policies. Kept intentionally thin — the exact columns firm up during build; the principles do not.
---

# Data model (Supabase / Postgres + RLS)

igotme stores its data in Supabase Postgres. This skill is the **principles + a starter schema** — not a frozen spec. Treat the column lists as a sketch to refine while building; treat the **RLS and ownership rules as firm**.

## Principles (firm)

- **Every table is RLS-enabled**, and a user can touch **only their own rows** (`auth.uid() = user_id`). No table is left open.
- **Ownership column.** Every user-owned table has `user_id uuid references auth.users` (or links transitively through one that does). RLS policies key off it.
- **Server-trusted writes bypass RLS via the service role.** Balance credits/debits, points spends, and AI persistence happen in Route Handlers using `SUPABASE_SERVICE_ROLE_KEY` (see `auth-flow`, `points-payments`). Clients never write money/points columns — RLS forbids it even if they try.
- **Keys & timestamps.** `id uuid default gen_random_uuid() primary key`, `created_at timestamptz default now()`, `updated_at timestamptz` (touch via trigger).
- **Status over deletion.** "Active problems" is a `status` enum, not a row count of everything — the free-tier 3-cap counts `status = 'active'`. Prefer archiving to hard-deletes so history/letters survive.
- **Money is integer.** Points are integers; never floats. Balances move only through ledger rows.

## Starter schema (sketch — refine during build)

```
profiles                 -- 1:1 with auth.users; app-level user data
  id            uuid pk references auth.users
  display_name  text
  points_balance int  default 0        -- mutated ONLY by service role
  tier          text default 'free'    -- 'free' | 'premium' (if you add subscriptions)
  created_at / updated_at

characters               -- the user's customizable narrator(s)
  id, user_id
  name          text
  traits        jsonb     -- tone, voice, personality used by the AI prompt
  avatar        text      -- asset key / URL
  created_at / updated_at

problems                 -- the user's real personal problems
  id, user_id
  text          text      -- sensitive; RLS-protected, not logged
  status        text default 'active'   -- 'active' | 'resolved' | 'archived'
  character_id  uuid references characters
  created_at / updated_at

stories                  -- AI-generated fiction for a problem
  id, user_id
  problem_id    uuid references problems
  title         text
  narrative     text
  dilemma       text      -- the character's framed question
  user_solution text      -- what the user advised (their own answer)
  letter        text      -- premium personal letter (nullable)
  created_at / updated_at

point_transactions       -- append-only ledger (audit + idempotency)
  id, user_id
  delta         int       -- +credit / -debit
  reason        text      -- 'purchase' | 'regenerate' | 'suggest_solution' | 'letter' | ...
  ref           text      -- PayPal captureId or request key — UNIQUE for idempotency
  created_at
```

## RLS pattern

Per user-owned table, enable RLS and add owner policies:

```sql
alter table problems enable row level security;

create policy "own rows: select" on problems
  for select using (auth.uid() = user_id);
create policy "own rows: write" on problems
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- `points_balance` and `point_transactions` get **read-only** policies for users (they can *see* their balance/history) and **no client write policy** — those mutate only through the service role in Route Handlers.
- New tables: enable RLS in the **same migration** that creates them. A table without RLS is a leak.

## Atomic points spend (no double-spend)

Wrap check-and-deduct in a Postgres function so concurrent premium requests can't both spend the last points (see `points-payments`):

```sql
create function spend_points(p_user uuid, p_cost int, p_reason text, p_ref text)
returns int language plpgsql as $$
declare new_balance int;
begin
  update profiles set points_balance = points_balance - p_cost
   where id = p_user and points_balance >= p_cost
   returning points_balance into new_balance;
  if not found then raise exception 'INSUFFICIENT_POINTS'; end if;
  insert into point_transactions(user_id, delta, reason, ref)
   values (p_user, -p_cost, p_reason, p_ref) on conflict (ref) do nothing;   -- idempotent
  return new_balance;
end $$;
```

Call it from the service-role client. The `where points_balance >= p_cost` makes the guard atomic; the `unique(ref)` makes retries safe.

## Conventions

- Types mirror tables in `lib/types/*.d.ts` ambient modules (`problems`, `character`, `points` — see `lib-folder`); keep them in sync as columns firm up.
- Generate TS types from the live schema (`supabase gen types typescript`) and reconcile with the ambient modules.
- Keep migrations in the repo (Supabase CLI) so the schema is reproducible.

> Thin by design: add columns/tables as features land, but never relax the RLS-on + owner-only + service-role-for-money rules. The schema + ambient types staying a sketch (kept in sync via `supabase gen types`) is a deliberate choice — rationale in `DECISIONS.md`.
