---
name: ai-story-generation
description: igotme's AI core — turning a user's real personal problem into a fictional story narrated by their customized character, plus the premium AI features (AI customization, suggested solutions, regeneration, the personal letter). Uses Gemini Flash via @google/genai, server-only. Use when building any AI feature, prompt, or generation endpoint.
---

# AI story generation (Gemini Flash)

The heart of igotme: a user enters a **real personal problem**, and the app reframes it as a **fictional story** narrated by the user's **customized character** — so they solve "the character's" problem, which is really their own. All AI runs through **Gemini Flash** (`@google/genai`), **server-only** (`GEMINI_API_KEY`). The client never calls Gemini directly.

## Where it runs

AI calls live in Route Handlers under `src/app/api/**/route.ts` (outside `[locale]`, per `api-folder`). One handler per feature; each premium feature deducts points server-side (see `points-payments`) and persists results to Supabase (see `data-model`).

| Endpoint | Feature | Points |
|----------|---------|--------|
| `POST /api/story` | Generate the story from a problem + character | free (or first-per-problem) |
| `POST /api/story/regenerate` | Re-roll the story | **premium** |
| `POST /api/character/suggest` | AI-assisted character customization | **premium** |
| `POST /api/solution/suggest` | AI-suggested solution to the character's dilemma | **premium** |
| `POST /api/letter` | A personal letter to the user | **premium** |

Handler shape: derive the user (`getUser()`), validate input, **deduct points atomically if premium** (refund on failure), call Gemini, **persist**, return the `ItemResponse` envelope.

## The core transform (prompt design)

Use a **system instruction** that fixes the role and the reframing rule, then pass the user's problem + character config as input. Keep the user's problem recognizable but disguised as fiction.

```ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const system = `You are a warm, insightful storyteller for a self-help app.
Take the user's real personal problem and retell it as a SHORT fictional story whose
protagonist is the user's character. Disguise identifying details, keep the emotional
core intact, and end at a decision point so the reader can advise the character.
Match the character's name, tone, and traits. Do not give clinical/medical advice.`;

const res = await ai.models.generateContent({
  model: "gemini-flash-latest",
  config: { systemInstruction: system, responseMimeType: "application/json", responseSchema: STORY_SCHEMA },
  contents: `Problem: ${problem.text}\nCharacter: ${JSON.stringify(character)}`,
});
```

- **Structured output.** Set `responseMimeType: "application/json"` + a `responseSchema` so you get reliable fields, not prose to parse. A story shape: `{ title, narrative, characterDilemma, choicePrompt }` — `choicePrompt` is the question the user answers as if advising the character.
- **Character-driven.** Feed the character config (name, tone, traits, voice) so the narration and the narration-sound system stay consistent.
- **Premium features** reuse this client with different system instructions: `character/suggest` proposes trait sets; `solution/suggest` reflects the user's own submitted solution back as guidance; `letter` writes a short, kind letter tying the fiction back to the user.

## Streaming (optional, for the story)

For perceived speed on the interactive page, stream the narrative with `ai.models.generateContentStream(...)` and render tokens as they arrive in `StoryInteraction`. Persist the final text once complete. If you stream, still deduct points up front and reconcile/refund on stream failure.

## Persistence & flow

1. User submits a problem (`/problems/new`) → create the `problem` row (enforce the **3-active cap** first, see `points-payments`).
2. `POST /api/story` generates + saves a `story` row linked to the problem.
3. `/problems/[id]` (`StoryInteraction`) reads the story via `useGetProblemDetails(id)`, the character narrates it, the user submits their solution.
4. Premium endpoints (regenerate / suggest / letter) spend points and update/append rows.

Components call **data hooks** (`useMutation`) — never `fetch` Gemini or the route directly in JSX (see `conventions-patterns`):

```ts
export const useGenerateStory = () =>
  useMutation({ mutationFn: (input: StoryInput) =>
    new AxiosClient<StoryInput, Story>({ endpoint: "/api/story", baseURL: "/", contentType: "application/json" }).post(input) });
```

## Safety & guardrails (this is an emotional app)

- **Not therapy.** The system prompt forbids clinical/medical/diagnostic advice; the app is reflective self-help, not treatment. Say so in copy where relevant.
- **Crisis handling.** Detect signals of self-harm/abuse/crisis in the user's input (a cheap classifier pass or a prompt instruction) and, when present, **surface real support resources** instead of (or alongside) a story — don't dramatize it into fiction.
- **Privacy.** The problem text is sensitive personal data. Keep it server-side, store it under the user's RLS-protected rows, and don't log raw problem/story content. Send only what's needed to Gemini.
- **Robustness.** Validate/repair malformed JSON output; set sane token limits; handle Gemini errors by refunding points and returning a clean error envelope.

## Checklist

- [ ] All Gemini calls are server-only (`GEMINI_API_KEY`, never `NEXT_PUBLIC_`); client uses data hooks.
- [ ] Premium features deduct points **atomically** and **refund on failure** (see `points-payments`).
- [ ] Structured output via `responseSchema`; output validated before persisting.
- [ ] Character config drives narration; story ends at a decision point.
- [ ] Crisis/self-harm input routes to support resources, not fiction.
- [ ] Problem/story text stays under the user's RLS rows; not logged.
