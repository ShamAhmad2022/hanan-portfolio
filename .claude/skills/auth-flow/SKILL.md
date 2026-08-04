---
name: auth-flow
description: How igotme does authentication with Supabase — browser & server clients, session handling, the (app)/(auth) route guards, attaching the access token to AxiosClient, and the signup / login / forgot-password / reset flows. Use when building auth, protecting routes, or wiring the Supabase session.
---

# Auth flow (Supabase)

igotme uses **Supabase Auth** (email + password) via `@supabase/supabase-js` + `@supabase/ssr`. Sessions live in cookies; the app reads them on the server for route guards and on the client for UI. This skill covers the wiring; the data envelope/route-handler conventions are in `api-folder`, the folder layout in `project-structure`.

## Two Supabase clients (+ middleware)

Add a `src/lib/clients/supabase/` folder alongside `axios/` (see `lib-folder`):

```
lib/clients/supabase/
├── client.ts     # browser client — Client Components
├── server.ts     # server client — Server Components, layouts, Route Handlers
└── (session refresh lives in src/middleware.ts)
```

```ts
// client.ts — browser
import { createBrowserClient } from "@supabase/ssr";
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
```

```ts
// server.ts — Server Components / layouts / Route Handlers
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export const createClient = async () => {
  const cookieStore = await cookies();          // ⚠️ Next 16: cookies() is async
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    } },
  );
};
```

**Middleware does double duty.** `src/middleware.ts` already handles locale redirects (see `dynamic-routes`). It must **also refresh the Supabase session** on every request (so cookies stay valid). Order: run the Supabase `updateSession` (read/refresh auth cookies on the response) **first**, then apply the locale redirect — copying the refreshed auth cookies onto the redirect response so they aren't lost. Keep `/api`, `_next/*`, and static assets excluded via the existing `matcher`.

## Route guards live in the group layouts

Guarding happens once per zone, in the route-group `layout.tsx` (not per page) — see `project-structure`:

```tsx
// (app)/layout.tsx — session-guarded zone
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();   // validates the JWT server-side
if (!user) redirect(`/${locale}/login`);
```

- **(app)/layout.tsx** → no `user` ⇒ redirect to `/login`.
- **(auth)/layout.tsx** → has `user` ⇒ redirect to `/character` (bounce signed-in users out of auth pages).
- ⚠️ **Always use `supabase.auth.getUser()` for authorization** (it verifies the token with Supabase). Do **not** trust `getSession()` for gating — it only reads the cookie and can be stale/spoofed. `getSession()` is fine for non-security UI hints.

## Attaching the token to backend calls

The `AxiosClient` interceptor has a commented-out `Authorization: Bearer <token>` block (see `api-folder`). **This is the hook point.** For authenticated calls to the external REST backend or internal `/api` routes, fetch the current access token from the Supabase client and set the header:

```ts
// in the request interceptor
const { data: { session } } = await supabase.auth.getSession();
if (session) config.headers.Authorization = `Bearer ${session.access_token}`;
```

Inside Route Handlers, instead re-derive the user server-side via `createClient()` + `getUser()` — never trust a user id sent from the client.

## The flows

Build each form with react-hook-form in the route's `_components/` (`LoginForm`, `SignupForm`, `ForgotPasswordForm`); call Supabase from a `useMutation` data hook in `lib/hooks/data/auth.ts`. Strings come from `locales/data/auth.ts` via `useLocale().t`; redirects use locale-prefixed paths (`navigate(...)`).

| Flow | Supabase call | After success |
|------|---------------|---------------|
| **Sign up** | `auth.signUp({ email, password, options: { emailRedirectTo } })` | If email confirmation on: show "check your inbox". Else go to `/character`. |
| **Log in** | `auth.signInWithPassword({ email, password })` | Redirect to `/character` (or the next URL). |
| **Forgot password** | `auth.resetPasswordForEmail(email, { redirectTo: /<locale>/reset })` | Show "reset link sent". |
| **Reset password** | `auth.updateUser({ password })` (on the `/reset` page, after the recovery link sets a session) | Sign in / redirect to app. |
| **Sign out** | `auth.signOut()` | Redirect to `/` or `/login`; clear any auth UI state. |

Add a `reset` route under `(auth)/` for step 4 (the recovery email lands there). Configure the Supabase redirect URLs (site URL + `/*/reset`) in the Supabase dashboard.

## Client-side session + state

- Read the user in Client Components via the browser client and `auth.onAuthStateChange` to keep UI in sync (sign-in/out across tabs).
- Mirror only **minimal** auth UI state in the Redux `auth-slice` (e.g. `isAuthed`, display name) for nav rendering — **Supabase is the source of truth**, not Redux. Don't store tokens in Redux/localStorage; `@supabase/ssr` manages them in cookies.

## Security checklist

- [ ] Server gating uses `getUser()`, never `getSession()`.
- [ ] User identity in Route Handlers is re-derived server-side, never taken from the request body.
- [ ] Middleware refreshes the session on every request and preserves auth cookies through the locale redirect.
- [ ] Tokens live in cookies (managed by `@supabase/ssr`) — not in Redux, localStorage, or the URL.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is used **only** in Route Handlers for trusted writes (see `points-payments`, `data-model`) — never in a Client/Server Component that renders.
