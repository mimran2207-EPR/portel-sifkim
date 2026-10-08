# Writing the content (`src/content/lessons.ts`)

## Schema

```ts
interface Highlight { x: number; y: number; w: number; h: number } // % of the screenshot, 0-100
interface Step {
  id: string;          // "<module>.<n>", e.g. "4.3" — also the file name of screen/mp3/video
  title: string;       // short, shown as the step heading and in the menu
  script: string;      // what the presenter SAYS (also the caption)
  highlight?: Highlight;
  tip?: string;        // 💡 green box
  warning?: string;    // ⚠️ red box — rules, rejections, common errors
}
interface Module { id: string; title: string; icon: string; intro?: string; steps: Step[] }
```

`id`s must be unique and match the files in `public/`. Module `0` is the welcome (one step, `0.1`).

## Structure that worked

The supplier portal had 8 modules / 31 steps:
0 ברוכים הבאים · 1 כניסה (choose authority, ID + phone/mail, OTP code, closed cards) ·
2 שולחן העבודה (business card, shortcuts, switching authority) · 3 the main list (statuses, details,
search & filter, Excel export) · 4 the main action — a wizard, one step per wizard screen ·
5 כללים ושגיאות נפוצות · 6 tracking what was submitted · 7 account ledger.

Pattern to copy: **login → home → lists → the main action (wizard) → rules & errors → tracking →
reports**. A dedicated rules/errors module is worth it: amount mismatches, duplicates, documents that
aren't the user's, closed records — say what the system will reject and what to do instead.

## Script style (they are read aloud — this matters more than anything)

- **Spoken Hebrew, plural address**: "לחצו", "בחרו", "תוכלו". First person for the presenter
  ("אני אלווה אתכם"). 2–4 sentences, ~15–25 seconds (≈ 250–350 characters).
- **Quote on-screen labels exactly** in double quotes: לחצו על "החלף רשות". The user looks for that text.
- Say *where* on the screen ("בתפריט הצד", "בראש הרשימה") — the ring shows it, the voice confirms it.
- End with the "why" or what happens next ("כך תוכלו…", "ועברו לשלב הבא").
- **No abbreviations that read badly**: write "מספר החברה או העוסק", not "ח.פ"; "שקלים", not "₪";
  spell out acronyms the TTS can't pronounce. Exception: exact system error messages in `warning`
  stay verbatim.
- No personal data, no real company names, numbers or phone numbers.
- Welcome step `0.1`: who the presenter is, what the system lets you do (one sentence of benefits),
  and that you can replay or skip at any time.

Example:
```ts
{
  id: "2.3",
  title: "החלפת רשות או כרטיס",
  highlight: { x: 78, y: 18, w: 20, h: 9 },
  script:
    'בתפריט הצד מוצגות הרשות והחברה שאיתן אתם מחוברים כרגע. אם אתם עובדים מול כמה רשויות, לחצו על "החלף רשות" ובחרו את הרשות הרצויה. כך תוכלו לעבור בין הרשויות בכניסה אחת, בלי להתחבר מחדש.',
  tip: "החלפת רשות לא מנתקת אתכם מהמערכת.",
}
```

## After editing content

1. `npm test` (the lessons test checks ids, uniqueness and required fields).
2. Regenerate narration for changed steps: `python scripts/build-narration.py --only 2.3,2.4`.
3. If a step already has an avatar video and its script changed, the video must be re-recorded
   (the voice is baked in) — tell the user; until then the old video plays.
4. `npm run heygen` refreshes `docs/heygen-scripts.md`.
