# Architecture of the template

Stack: React 19 + Vite + TypeScript + Tailwind v4 (`@tailwindcss/vite`), Vitest (jsdom).
Static site served by Cloudflare Workers Static Assets (SPA fallback). No backend, no database —
progress lives in the visitor's `localStorage`.

## Files

```
src/
  content/
    types.ts        Module / Step / Highlight types
    lessons.ts      ALL the training content (the main file you edit)
    videos.ts       GENERATED list of existing avatar videos — don't edit (scripts/list-videos.mjs)
  App.tsx           State: current step, done steps, pause, narration on/off, auto-advance, karaoke word
  components/
    Header.tsx        Gradient header, overall progress, menu button
    ModuleNav.tsx     Side menu of modules/steps (drawer below xl, docked on the right at xl)
    ProcessStepper.tsx Topic circles (✓ done / current / todo) + step dots of the current topic
    StepStage.tsx     Step title, screenshot + pulsing highlight + spotlight, side arrows,
                      presenter slot (avatar, bottom-left), tip / warning boxes, karaoke caption.
                      On phones it zooms onto the highlight, with a "מסך מלא" toggle.
    AvatarPanel.tsx   Plays: step video → module intro video → MP3 narration (first that exists).
                      Lip movement for narration: swaps fig-0/1/2.webp by voice level.
    Controls.tsx      Media-player bar: progress, replay, sound, prev / play-pause / next, auto toggle
    KaraokeText.tsx   Caption with the spoken word highlighted (.word-active, yellow glow)
  lib/
    media.ts        URLs: screens/<id>.jpg, avatar/<id>.webm|mp4 (WebM unless Safari), hasStepVideo
    narration.ts    Plays narration/<id>.mp3 with an analyser (mouth level) → falls back to Web Speech
    speech.ts       Web Speech fallback, pinned Hebrew voice, narration on/off preference
    words.ts        Word timing estimate from text length + punctuation (karaoke)
    progress.ts     localStorage progress (done steps, last step)
  styles.css        Theme gradient, highlight ring, spotlight, avatar 3D/mobile bubble, karaoke
public/
  screens/<id>.jpg      one screenshot per step
  narration/<id>.mp3    one narration per step
  avatar/<id>.mp4|webm  optional avatar video per step; fig-0/1/2.webp avatar stills (mouth closed/half/open)
scripts/
  build-narration.py    edge-tts → public/narration/*.mp3 (voice he-IL-AvriNeural)
  process-video.py      HeyGen download → 540px MP4 + transparent WebM; original → private/videos
  cutout-video.py       black background → alpha (used by process-video)
  list-videos.mjs       writes src/content/videos.ts (runs automatically before dev/build)
  build-heygen-scripts.ts  writes docs/heygen-scripts.md from lessons.ts
tests/                  ~100 tests (flow, player, stepper, avatar, narration, words, progress…)
private/                gitignored: raw screenshots, HD videos, notes about the live system
```

## Behavior worth knowing

- **Auto-advance**: when narration/video finishes completely, the next step starts after 1.5 s
  (toggle "אוטומטי/ידני" in the player bar, remembered in localStorage).
- **Only existing videos are requested.** The host answers missing files with the SPA page, and some
  browsers (Safari) never reject that — playback would stall. `videos.ts` prevents it; it's regenerated
  by `predev`/`prebuild`, so adding an MP4+WebM pair is enough.
- **Highlight coordinates are percentages of the screenshot** (x, y, w, h). The image width is capped
  from the viewport height so image and ring scale together — keep screenshots the same aspect ratio.
- **RTL**: "previous" is on the right, "next" on the left; icons are mirrored.
- **Mobile (<768px)**: screenshot zooms onto the highlight, side arrows hidden, avatar becomes a round
  face bubble, stepper shows only the current topic label.

## Branding checklist

| Where | What to change |
|---|---|
| `index.html` `<title>` | `מרכז ההדרכה ל<קהל> \| <מערכת>` |
| `src/components/Header.tsx` | Title and subtitle line (`פורטל הספקים Muni · הדרכה צעד אחר צעד`) |
| `src/styles.css` `.muni-gradient` + `#0e7c9b` / `#4fd1b5` across components | Brand colors (search-replace both hex values) |
| `src/lib/progress.ts`, `src/lib/speech.ts`, `src/App.tsx` | localStorage keys `muni-training-*` → a new prefix, so two training sites on one browser don't share progress |
| `src/components/AvatarPanel.tsx` | `aria-label`, avatar `alt`, and the tag text "העוזר הדיגיטלי" (presenter's name/role) |
| `wrangler.jsonc` | `"name"` = the new Cloudflare Worker name |
| `package.json` | `"name"` |
| tests | Strings that assert the old alt text or titles |

Keep the class name `muni-gradient` unless you want to rename it everywhere — it's only a name.
