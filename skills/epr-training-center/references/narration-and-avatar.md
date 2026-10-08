# Narration and the avatar

Playback order for each step (AvatarPanel): **step video** (if it exists) → **module intro video**
(first step of a module, if it exists) → **MP3 narration** → Web Speech fallback.
So the site is complete with MP3s alone; videos are an upgrade per step.

## 1. MP3 narration (always — free)

```bash
pip install edge-tts
python scripts/build-narration.py                 # all steps
python scripts/build-narration.py --only 0.1,2.3  # just these
```
Voice `he-IL-AvriNeural` (male). For a female voice use `--voice he-IL-HilaNeural`. Use one voice for
the whole site — users notice when it changes between steps.

## 2. Avatar stills (lip movement for narration)

`public/avatar/fig-0.webp`, `fig-1.webp`, `fig-2.webp`: the same full-body pose with the mouth closed,
half-open and open, transparent background, ~540×960. The site swaps them by voice level.
Easiest source: three frames from one HeyGen video of the presenter (pick frames with those mouth
shapes, remove the black background as `cutout-video.py` does, export WebP). Until new stills exist,
keep the old ones or the avatar area is empty.

## 3. HeyGen video per step (optional, paid)

Setup once in HeyGen: create the presenter's avatar (a photo → 3D/stylised full-body figure works well),
**black background**, **Portrait** format. Same avatar and voice for every step.

Per step:
1. Open https://app.heygen.com/create-video/new (the user must already be logged in).
2. Insert the step's `script` **exactly**. Typing into HeyGen's textarea drops spaces in Hebrew;
   insert it with JavaScript instead:
   ```js
   const el = document.querySelector('textarea[aria-label="Video script"]');
   el.focus(); el.select(); document.execCommand('insertText', false, TEXT);
   el.value === TEXT   // must be true
   ```
3. Click the button whose text is exactly "Continue" to reach the voice preview
   ("Review voice delivery"). **Stop there** and hand over: the user listens, clicks through and
   clicks **Generate video** (it spends credits — never click it yourself, and re-check the page
   heading before any further click, since the wizard has changed between visits).
4. The user downloads the MP4 and saves it as `public/avatar/<id>.mp4`, then tells you.
5. Process and publish:
   ```bash
   pip install opencv-python-headless imageio-ffmpeg
   python scripts/process-video.py <id>
   # if the background-removal step fails (often a OneDrive file lock), just rerun it:
   python scripts/cutout-video.py private/videos/<id>-hd.mp4 public/avatar/<id>.webm
   git add public/avatar/<id>.mp4 public/avatar/<id>.webm && git commit -m "avatar: step <id> video" && git push
   ```
   The HD original stays in `private/videos/` (not uploaded). Prepare the next step while the user
   generates the current one. Keep a progress table (step / title / status) in `docs/heygen-scripts.md`
   so work can resume another day.

Changing a recorded script means re-recording that video — the voice and lips are baked in.

## Presenter identity

If the presenter is a real person, use their own avatar and their own name in `0.1`. Don't make one
person's face introduce itself with another person's name — create a separate avatar instead.
