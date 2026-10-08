# Screenshots and highlights

One JPG per step: `public/screens/<id>.jpg`. Same window size and zoom for all of them so the
layout doesn't jump between steps (the original used a ~1270px wide window at browser zoom 0.8,
≈ 16:9). Use a test/demo account where possible.

## Procedure per screen

1. The user logs in to the system in the browser (you never type credentials or OTP codes).
2. Navigate to the screen for the step. Don't press submit/confirm buttons in a live system.
3. Paste `scripts/mask.js` into the page (javascript tool or DevTools console), then adapt and run:
   ```js
   __mask()   // replaces real names/numbers/addresses in the DOM with demo values; returns count
   ```
   Edit the `exact` list at the top of mask.js first: the real company name, IDs, addresses that
   appear on screen → demo values ("ספק לדוגמה בע״מ", "999999999", "רחוב הדוגמה 1, תל אביב").
   It also scrambles long numbers and amounts but keeps dates. Nothing is saved — it's display only.
   Check the result visually: anything still real gets fixed by hand or blurred later.
4. Measure the highlight while the page is on screen:
   ```js
   __rect('button', 'החלף רשות')   // → { x, y, w, h } in % of the viewport, with a small margin
   ```
   Because the screenshot is the viewport, these percentages go straight into the step's `highlight`.
5. Take the screenshot (browser screenshot of the viewport), save the raw file to `private/raw/`,
   and export a compressed JPG (~60 KB, quality ~80) to `public/screens/<id>.jpg`.

## Verify

Run `npm run dev`, go through every step, and check that each ring sits exactly on the control the
script talks about — on desktop *and* at phone width (375–390px), where the image zooms onto the ring.
Fix percentages by hand when needed (small steps of 0.5–1%).

## Privacy checklist before committing

- No real supplier/customer names, ID or company numbers, phones, emails, addresses, amounts
  that identify a real deal.
- No session tokens or URLs with personal parameters visible in the screenshot.
- Raw (unmasked) captures stay in `private/` only.
