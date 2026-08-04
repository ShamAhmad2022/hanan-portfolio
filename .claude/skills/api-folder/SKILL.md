---
name: api-folder
description: How data access and API routing are structured in this Next.js 16 (Turbopack) app. Use when wiring up backend communication. Key fact — this project is FRONTEND-ONLY (no app/api route handlers); all data flows through a typed Axios client to an external REST backend, called from TanStack Query data hooks. This skill documents that pattern AND the Next.js 16 Route Handler conventions to follow IF you add server routes (e.g. Supabase/PayPal/AI in igotme).
---

# API / data-access layer

**Read this first:** data access has two halves. **Reads** flow through a typed Axios client to an external REST backend — no `app/api/` is involved in the read path. **Server endpoints** (`app/api/**/route.ts`) are added only where secrets or trusted work are required (Supabase service-role, PayPal capture/verification, AI generation). Part A documents the read pattern; Part B gives the **Next.js 16 App Router Route Handler** conventions for the server endpoints.

## Part A — the existing pattern: external backend via Axios + Query

Data access is a three-layer pipeline. Each layer has exactly one job:

```
Endpoints enum  →  AxiosClient (lib/clients/axios)  →  data hook (lib/hooks/data)  →  component
   (where)              (how to fetch)                    (cache + locale)            (render)
```

1. **`src/lib/enums/app.ts` — `Endpoints`**: every backend/API path as an enum member. Detail endpoints carry an `ID` placeholder: `GET_PROBLEM_DETAILS = "/api/problems/ID"`. igotme uses internal `/api/…` routes or Supabase queries.
2. **`lib/clients/axios/client.ts` — `AxiosClient<Req, Res>`**: the single class that issues HTTP. Base URL is `BACKEND_BASE` (`process.env.NEXT_PUBLIC_BACKEND_DOMAIN`); a request interceptor sets `Content-Type` and `Accept-Language: <locale>`. Methods: `getItem`/`getList`/`getPaginated`/`post`/`put`/`delete`, each returning the typed `backend` envelope (`ItemResponse` / `ListResponse` / `ListPaginated`).
3. **`lib/hooks/data/<resource>.ts`**: TanStack Query hooks that read `locale` from `useLocale()`, `new AxiosClient(...)`, and wrap a query. This is the only thing components call. (Full hook conventions are in the `lib-folder` skill.)

```ts
// src/lib/hooks/data/problems.ts — the canonical read
export const useGetProblemDetails = (id: string) => {
  const { locale } = useLocale();
  const client = new AxiosClient<unknown, ProblemDetails>({
    endpoint: Endpoints.GET_PROBLEM_DETAILS.replace("ID", id), locale,
  });
  return useQuery({ queryKey: ["GetProblemDetails", id], queryFn: () => client.getItem() });
};
```

Why this shape: the backend is a separate service, content is localized server-side via `Accept-Language`, and TanStack Query owns caching/retries (`staleTime` 24h, `retry: false`). The component never touches Axios or URLs directly.

### Response envelope (`lib/types/backend.d.ts`)

All backend responses are wrapped. Reproduce these so the client stays typed:

```ts
declare module "backend" {
  type ListResponse<T>   = { data: T[]; status; error; pagination: { count; next; previous } };
  type ListPaginated<T>  = { data: T[]; message?; status; error; pagination: { count; next; previous } };
  type ItemResponse<T>   = { data: T;   message?; status; error; detail };
}
```

### Auth (currently disabled)

The Axios interceptor contains a commented-out `Authorization: Bearer <token>` block — the public site needs no auth. **This is the exact hook point** to attach a token (the Supabase access token in igotme) before requests go out.

## Part B — Next.js 16 Route Handlers (when you DO need `app/api/`)

igotme is **not** frontend-only — it needs server endpoints for Supabase service-role work, PayPal capture/verification, and AI generation (secrets that must never reach the client). Add them as App Router **Route Handlers**. Conventions:

### Location & file
Route Handlers live in `src/app/api/<segment>/route.ts` — **outside** `[locale]` (APIs aren't localized; `middleware.ts` already excludes `/api` from locale redirects via its matcher). One `route.ts` per endpoint; export an async function per HTTP method.

```
src/app/
└── api/
    ├── checkout/route.ts        # POST — create PayPal order
    ├── checkout/capture/route.ts# POST — capture order, credit points (server-trusted)
    ├── story/route.ts           # POST — AI story generation (spends points)
    └── webhooks/paypal/route.ts # POST — PayPal webhook (verify signature)
```

### Handler shape (Next 16)

```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // ...do work (Supabase server client, PayPal, AI)...
  return NextResponse.json({ data, status: true, error: null }, { status: 200 });
}
```

Rules to follow:
- **Async `params`** (Next 16): dynamic API routes type the second arg as `{ params: Promise<{ id: string }> }` and `await` it: `const { id } = await ctx.params;`.
- **Match the existing envelope** so client code stays uniform: return `{ data, status, error }` shaped like `ItemResponse`/`ListResponse`.
- **Server-only secrets**: read `process.env.SUPABASE_SERVICE_ROLE_KEY`, `PAYPAL_SECRET`, `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix) — these are available only inside Route Handlers, never in components.
- **Runtime**: default (Node) runtime for Supabase admin / PayPal SDK / AI SDKs. Only set `export const runtime = "edge"` for lightweight, edge-safe handlers.
- **Validation**: parse and validate the body before trusting it (points spend, payment amount). Never trust client-sent point totals — recompute server-side.
- **Webhooks**: verify the provider signature before acting; return 2xx fast.

### How the frontend calls internal routes
Two options, both fine — keep components calling **data hooks**, not `fetch`/Axios directly:
- Point `AxiosClient` at a relative `baseURL` (`/api`) and add `Endpoints` members for the internal routes; reuse the same hook pattern.
- Or write a dedicated hook using `useMutation` for actions (checkout, generate story, spend points) since those are POSTs with side effects.

```ts
export const useGenerateStory = () =>
  useMutation({ mutationFn: (input: StoryInput) =>
    new AxiosClient<StoryInput, Story>({ endpoint: "/api/story", baseURL: "/", contentType: "application/json" }).post(input) });
```

## Recreation checklist

1. Keep the **3-layer read pattern** (Endpoints → AxiosClient → data hook) for all reads.
2. Reproduce `backend.d.ts` envelopes; have handlers return the same shape.
3. Put server endpoints in `src/app/api/**/route.ts` (outside `[locale]`); one file per endpoint, one exported function per method.
4. Use the disabled interceptor block to attach the Supabase token for authenticated reads.
5. Keep secrets server-side (no `NEXT_PUBLIC_`); validate inputs and recompute money/points on the server.
6. Expose internal routes to components only through hooks (`useQuery`/`useMutation`), never raw `fetch` in JSX.
