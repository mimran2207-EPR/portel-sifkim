# Training Center — Phase 1 (Skeleton + Text Content) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deployable Hebrew RTL training site for the Muni supplier portal, with all ~28 steps as text, avatar placeholder, progress tracking, ready for screenshots and HeyGen videos to be dropped in.

**Architecture:** Static React SPA built by Vite, served by Cloudflare Worker `portel-sifkim` via Static Assets. All lesson content lives in one typed data file; UI components render it. Media is looked up by step id (`/screens/<id>.png`, `/avatar/<id>.mp4`) with graceful fallback.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest + Testing Library, Wrangler.

**Spec:** `docs/specs/2026-10-05-training-center-design.md`

## Global Constraints

- All UI text Hebrew, `<html lang="he" dir="rtl">`.
- Repo is PUBLIC: never commit the original photo, real screenshots, real names / ח.פ / phones / amounts. Demo data only (e.g. "ספק לדוגמה בע״מ", ח.פ 999999999).
- `localStorage` access always wrapped in try/catch; app must work without it.
- Files under 500 lines.
- No `Co-Authored-By` trailer in commits (CLAUDE.md rule).
- Worker name: `portel-sifkim`; deploy from branch `main`.

---

## File Structure

```
package.json, vite.config.ts, tsconfig.json, wrangler.jsonc, index.html
src/main.tsx                 — React entry
src/styles.css               — Tailwind import + Muni theme tokens
src/content/types.ts         — Module / Step / Highlight types
src/content/lessons.ts       — all modules & steps (data only)
src/lib/progress.ts          — localStorage-safe progress store
src/lib/media.ts             — media URL helpers
src/App.tsx                  — state: current step, navigation
src/components/ModuleNav.tsx — right-side module/step list with ✓
src/components/StepStage.tsx — screenshot + highlight overlay (or placeholder card)
src/components/AvatarPanel.tsx — video if available, else avatar image + speech bubble
src/components/Controls.tsx  — prev / replay / next + progress bar
scripts/build-heygen-scripts.ts — generates docs/heygen-scripts.md from lessons
tests/*.test.ts(x)
public/avatar/avatar.png     — stylized avatar (added when user supplies it; placeholder SVG until then)
```

---

### Task 1: Scaffold + deploy config

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `wrangler.jsonc`, `index.html`, `src/main.tsx`, `src/styles.css`, `src/App.tsx` (temporary "שלום")

- [ ] Step 1: `npm create vite@latest . -- --template react-ts` equivalent by hand; add deps `tailwindcss @tailwindcss/vite`, dev deps `vitest jsdom @testing-library/react @testing-library/jest-dom wrangler tsx`.
- [ ] Step 2: `wrangler.jsonc`:
```jsonc
{
  "name": "portel-sifkim",
  "compatibility_date": "2026-10-01",
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
}
```
- [ ] Step 3: scripts: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"test": "vitest run"`, `"deploy": "wrangler deploy"`, `"heygen": "tsx scripts/build-heygen-scripts.ts"`.
- [ ] Step 4: Run `npm run build` → `dist/index.html` exists.
- [ ] Step 5: Commit `chore: scaffold vite react app with cloudflare worker config`.

### Task 2: Content model + lessons

**Files:** Create `src/content/types.ts`, `src/content/lessons.ts`, `tests/lessons.test.ts`

**Produces:**
```ts
export interface Highlight { x: number; y: number; w: number; h: number } // percentages 0-100
export interface Step { id: string; title: string; script: string; highlight?: Highlight; tip?: string; warning?: string }
export interface Module { id: string; title: string; icon: string; steps: Step[] }
export const modules: Module[]
export const allSteps: Step[]                       // flattened, in order
export function findStep(id: string): { module: Module; step: Step; index: number } | undefined
```

- [ ] Step 1: Failing test:
```ts
import { modules, allSteps, findStep } from "../src/content/lessons";
test("ids unique and match N.M", () => {
  const ids = allSteps.map(s => s.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^\d+\.\d+$/));
});
test("every step has a Hebrew script of 20-90 words", () => {
  allSteps.forEach(s => {
    const words = s.script.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(20);
    expect(words).toBeLessThanOrEqual(90);
    expect(s.script).toMatch(/[֐-׿]/);
  });
});
test("8 modules, findStep works", () => {
  expect(modules).toHaveLength(8);
  expect(findStep("4.5")?.module.id).toBe("4");
  expect(findStep("9.9")).toBeUndefined();
});
```
- [ ] Step 2: Run `npm test` → FAIL (module not found).
- [ ] Step 3: Write `lessons.ts` with the exact module/step list from the spec table (modules 0–7, steps 0.1 … 7.2). Scripts: first person as Yehuda, spoken Hebrew, plural address ("לחצו", "בחרו"), 20–90 words (~20–40 sec), name the exact on-screen label in quotes. Steps 1.4, 4.1, 5.x get `warning` with the exact portal message where known (5.1: "ח.פ על החשבונית אינו תואם למספר העוסק שלך. לא ניתן להגיש חשבונית זו.").
- [ ] Step 4: Run `npm test` → PASS.
- [ ] Step 5: Commit `feat: add lesson content model and all module scripts`.

### Task 3: Progress store

**Files:** Create `src/lib/progress.ts`, `tests/progress.test.ts`

**Produces:**
```ts
export function loadProgress(): { done: string[]; last?: string }
export function markDone(id: string): void
export function setLast(id: string): void
export function resetProgress(): void
```
- [ ] Step 1: Failing tests: markDone persists & dedupes; corrupt JSON → empty; `localStorage.getItem` throwing → returns `{ done: [] }` without throwing.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement with key `muni-training-progress-v1`, every access in try/catch.
- [ ] Step 4: Run → PASS.
- [ ] Step 5: Commit `feat: add localStorage-safe progress store`.

### Task 4: UI

**Files:** Create `src/lib/media.ts`, `src/components/*.tsx`, modify `src/App.tsx`, `src/styles.css`; test `tests/app.test.tsx`

**Consumes:** `modules`, `allSteps`, `findStep`, progress functions.
**Produces:** `screenUrl(id) => "/screens/<id>.png"`, `avatarVideoUrl(id) => "/avatar/<id>.mp4"`.

- [ ] Step 1: Failing test: render `<App/>` → shows "ברוכים הבאים" title & step 0.1 script; click "הבא" → shows step 1.1 title; click step 4.5 in nav → shows its title; "הקודם" disabled on first step.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement:
  - Layout: header (Muni-style teal gradient `#0e7c9b → #4fd1b5`, title "מרכז ההדרכה לספקים", progress `X/N`), right `ModuleNav`, main `StepStage`, `AvatarPanel` bottom-left (RTL), `Controls` bottom.
  - `StepStage`: `<img src=screenUrl>`; `onError` → placeholder card showing step title; highlight = absolutely positioned pulsing ring in % coordinates; `warning` renders red callout, `tip` renders teal callout.
  - `AvatarPanel`: `<video src=avatarVideoUrl autoplay controls>`; `onError` → `/avatar/avatar.png` (fallback SVG initials "י") + speech bubble with script. Caption under stage always shows script.
  - Keyboard: ArrowLeft = next, ArrowRight = prev (RTL).
  - Mobile (<768px): nav becomes drawer toggled by ☰, avatar above stage.
  - Restore `last` step on load; `markDone` on next.
- [ ] Step 4: Run tests → PASS; `npm run build` → OK; open `npm run dev` and check visually at desktop & 375px.
- [ ] Step 5: Commit `feat: training center UI with avatar placeholder and navigation`.

### Task 5: HeyGen scripts export

**Files:** Create `scripts/build-heygen-scripts.ts`, `docs/heygen-scripts.md` (generated); test `tests/heygen.test.ts`

- [ ] Step 1: Failing test: `renderHeygenMarkdown(modules)` contains `## 4.5` and the 4.5 script verbatim, and the filename hint `4.5.mp4`.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implement `renderHeygenMarkdown` (exported from `scripts/heygen.ts`), CLI writes `docs/heygen-scripts.md`. Header explains: one HeyGen video per step, 16:9 or 1:1, export MP4, name `<id>.mp4`, place in `public/avatar/`.
- [ ] Step 4: Run tests → PASS; `npm run heygen` → file generated.
- [ ] Step 5: Commit `feat: generate HeyGen script sheet from lessons`.

### Task 6: Publish

- [ ] Step 1: `npm run build && npm test` → all green.
- [ ] Step 2: Verify no private files staged: `git ls-files | grep -Ei "whatsapp|צילום"` → empty.
- [ ] Step 3: `git push -u origin main`.
- [ ] Step 4: User connects repo in Cloudflare → Worker `portel-sifkim` → Settings → Builds: build `npm run build`, deploy `npx wrangler deploy`. Verify live URL loads.

---

## Phase 2 (separate plan, after Phase 1 is live)
Demo-data screenshots + highlight coordinates per step; stylized avatar image; HeyGen MP4s → `public/avatar/` (or R2 if > ~25 MB total).
