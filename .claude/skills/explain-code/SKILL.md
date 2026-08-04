---
name: explain-code
description: Explains code with visual diagrams and analogies, grounded in the igotme architecture. Use when explaining how code works, teaching about the codebase, or when the user asks "how does this work?"
---

When explaining code, follow this 4-part structure. **Scale the depth to the question** — use the full structure for a real flow ("how does story generation work?"), but for a one-liner just answer plainly; don't force an analogy and an ASCII diagram onto something trivial.

## 1. Start with an analogy

Compare to something from everyday life. Keep it one sentence.
Tie it to **igotme's domain** where possible (a personal problem, the customizable character, the fictional story, narration, points/PayPal, the personal letter, the 3-active-problems cap).

> Example: "`useGenerateStory` is like a ghostwriter — you hand it your real worry, it pays the fee from your points jar, and a storyteller hands back the same worry dressed up as someone else's tale."

## 2. Draw an ASCII diagram

Show flow, structure, or relationships visually. Label every box and arrow. Use **real igotme pieces** — data hooks, `AxiosClient`, Route Handlers under `src/app/api/`, Supabase, Gemini Flash, the points system.

```
User submits a problem / clicks "Generate story"
      │
      ▼
useGenerateStory()          ← TanStack mutation hook (useMutation)
      │  mutationFn
      ▼
AxiosClient.post()          ← HTTP wrapper; baseURL "/", attaches the Supabase token
      │  POST /api/story
      ▼
Route Handler               ← src/app/api/story/route.ts (server-only)
  /api/story                  validates input, checks the points balance
      │  calls Gemini Flash (@google/genai)
      ▼
Gemini Flash                ← reframes the personal problem as a fictional story
      │  story text
      ▼
deduct points + persist     ← points recomputed SERVER-side; saved via Supabase
      │  { data: Story, status: true, error: null }   ← ItemResponse<Story>
      ▼
onSuccess callback          ← invalidates ["GetProblemDetails", id] + the points query
      │
      ▼
StoryInteraction re-renders ← the character narrates the new story
```

## 3. Walk through the code step by step

Number each step. Reference actual file paths, function names, or line numbers (e.g. `src/lib/hooks/data/problems.ts`, `useGetProblemDetails`). Explain the **WHY**, not just the what — e.g. *why* the points are recomputed on the server (never trust client-sent totals), *why* data goes through a hook instead of `fetch` in the component.

## 4. Highlight one gotcha

End with the non-obvious thing that trips people up. Prefer a real igotme gotcha:

> "Gotcha: a list hook's `query.data` is `ListResponse<Problem>` — the items are in `query.data.data` (the array), **not** `query.data.results`, and pagination is `query.data.pagination`. For infinite lists, let `useInfiniteScrollFetch` flat-map the pages for you instead of digging into `data.pages` by hand."

Other good igotme gotchas to reach for:
- **Next 16 async params:** `params`/`searchParams` are `Promise<…>` — `await` them in Server Components/layouts/handlers; Client Components read them via `useParams()`.
- **The `ID` placeholder:** `Routs`/`Endpoints` members hold a literal `ID` (`"/problems/ID"`) that's swapped at call time via `.replace("ID", id)` or `navigate({ href, replacements })` — it is not a template literal.
- **Secrets are server-only:** `SUPABASE_SERVICE_ROLE_KEY`, `PAYPAL_SECRET`, `GEMINI_API_KEY` exist only inside Route Handlers — referencing them in a component leaks nothing because they're `undefined` there.

---

## Output format

```
**Analogy:** [one sentence]

**How it works:**
[ASCII diagram]

**Step by step:**
1. ...
2. ...
3. ...

**Gotcha:** [the thing that surprises people]
```

Keep it conversational. For complex topics, use multiple analogies. Always tie back to igotme's self-help / story / points domain when relevant.
