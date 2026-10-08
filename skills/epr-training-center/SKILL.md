---
name: epr-training-center
description: Build an interactive Hebrew e-learning "training center" website for any EPR system (or any web system) by cloning the proven portel-sifkim template — process circles, screenshots with a pulsing highlight, a talking 3D avatar (HeyGen video or Hebrew neural narration), yellow karaoke captions, a media-player bar, auto-advance, mobile layout, deployed to Cloudflare from GitHub. Use this skill whenever someone wants to create a guided tutorial, onboarding/training site, "מרכז הדרכה", "הדרכה אינטראקטיבית", "סרטון הדרכה", step-by-step walkthrough with an avatar, or a training like the Central Elections Committee's guided tutorial — for suppliers, residents, employees or customers — even if they don't mention the template, React, or HeyGen. Also use it to add modules/steps, screenshots or avatar videos to an existing training center built this way.
---

# EPR Training Center (מרכז הדרכה אינטראקטיבי)

This skill reproduces a training site that already exists and works:
**https://portel-sifkim.choreshchana.workers.dev** (source: **https://github.com/mimran2207-EPR/portel-sifkim**, public).
It guides a user through a real system screen by screen: an avatar explains each step, the relevant
area on a screenshot pulses, the spoken word glows yellow in the caption, and the site moves on by itself.

The whole point is *not to rebuild*. The engine (React components, player, narration, karaoke, mobile
layout, tests, video processing scripts, deploy config) is generic. A new training center = the same
engine + new **content** (`src/content/lessons.ts`), new **screenshots**, new **narration/videos**,
new **branding**. Spend your effort there.

Talk to the user in Hebrew (the end users are Hebrew speakers and so is the team); keep code and
commit messages in English.

## The workflow

Work through these phases in order. Each phase ends with something the user can see, so check in
with them at the end of each phase rather than racing to the end.

### 1. Set up the project from the template

1. Ask for: the system's name and URL, the audience (ספקים / תושבים / עובדים…), the new GitHub repo
   URL (the user creates an empty repo), and who the presenter is (a person avatar or "העוזר הדיגיטלי").
2. Clone the template into a new folder, point `origin` to the new repo, and reset the content:
   ```bash
   git clone https://github.com/mimran2207-EPR/portel-sifkim.git <new-name>
   cd <new-name> && git remote set-url origin <new-repo-url>
   npm install
   ```
   Then remove the old content files (keep the folders): `public/screens/*.jpg`,
   `public/narration/*.mp3`, `public/avatar/<step>.mp4|webm`, and the HeyGen progress table in
   `docs/heygen-scripts.md`. Keep `public/avatar/fig-*.webp` only until the new avatar stills exist.
3. Rebrand — see `references/architecture.md` → "Branding checklist" (title, header subtitle,
   gradient colors, localStorage key prefix `muni-training-*`, avatar alt text, `wrangler.jsonc` name).
4. `npm test` must pass before you continue (the tests are generic; fix any that hard-code old text).

### 2. Map the system and write the content

Read `references/content-authoring.md` before writing a single script — it holds the schema and the
style rules that made the original read naturally when spoken aloud.

1. Walk the real system with the user (they log in themselves — see "Safety" below) and list the
   processes. Group them into 5–8 **modules** (topics), each with 2–9 **steps** (one screen/action each),
   plus a welcome module `0` with step `0.1`.
2. Also collect the *rules and common errors* (what gets rejected and why). These become their own
   module and `warning` fields — users value them most.
3. Write `src/content/lessons.ts`. Show the user the module/step outline first, then the scripts.
4. Optional but valued: export a Word transcript of all scripts for a product manager to review
   (use the hebrew-document-generator / docx skill; one heading per module, step title + script).

### 3. Screenshots and highlights

Follow `references/screenshots.md`: capture each step's screen at a consistent window size, mask
real personal/business data in the DOM first (`scripts/mask.js`), save as `public/screens/<id>.jpg`,
and measure the highlight rectangle as percentages with `__rect()`. Verify in the dev server that
every ring sits on the right control.

### 4. Voice and avatar

Follow `references/narration-and-avatar.md`.
- Always generate the MP3 narration first (free, instant, all steps): `python scripts/build-narration.py`.
  The site works fully with it.
- Then, if the user has a HeyGen plan, record one avatar video per step and process each one with
  `python scripts/process-video.py <id>` (transparent WebM + small MP4). Steps without a video fall back
  to the narration automatically — the list of existing videos regenerates on every build.

### 5. Deploy

Follow `references/deploy.md` (GitHub → Cloudflare Workers Builds). After every change: run tests,
commit, push, and confirm the Cloudflare check-run succeeded before telling the user it's live.

## Safety and privacy (these came from real mistakes — keep them)

- **The repo is public.** Never commit real screenshots, unmasked data, the presenter's original photo,
  HD video originals, or notes about the live system. Those go in `private/` (already gitignored).
- **Never type credentials or verification codes** into the system. The user logs in in the browser;
  you take over after they say they're in.
- **Don't submit anything in a live system** (no "שלח", "הגש", "אישור"). Screens up to the final
  confirmation are enough; ask the user to click if a screen behind a submit is needed.
- **HeyGen costs credits.** Stop once the voice preview is loaded and let the user click
  "Generate video". HeyGen's wizard changes; a "Continue" on one screen may already start generation,
  so check the page heading (via JS) before every click and never click a button you haven't identified.
- Don't put personal phone numbers, IDs, or company numbers in scripts — use the term
  "מספר החברה או העוסק" rather than "ח.פ" in spoken text (it reads badly aloud).

## Reference files

| File | Read it when |
|---|---|
| `references/architecture.md` | Setting up, rebranding, or changing any behavior of the site |
| `references/content-authoring.md` | Writing modules, steps, scripts, tips, warnings |
| `references/screenshots.md` | Capturing screens, masking data, placing highlights |
| `references/narration-and-avatar.md` | Narration MP3s, HeyGen videos, avatar stills, processing |
| `references/deploy.md` | GitHub + Cloudflare setup and every deploy |
| `scripts/mask.js` | Paste into the live system's console before each screenshot |
