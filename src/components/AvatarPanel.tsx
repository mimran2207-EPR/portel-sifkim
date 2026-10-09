import { useEffect, useRef, useState } from "react";
import type { Step } from "../content/types";
import { TALK_FRAMES, avatarVideoUrl, hasStepVideo } from "../lib/media";
import { narrate as startNarration, type NarrationControl } from "../lib/narration";
import { stopSpeaking } from "../lib/speech";
import { wordAtProgress } from "../lib/words";

interface Props {
  step: Step;
  /** Module opening video, played first on the module's first step. */
  introUrl?: string;
  /** What the opening video says (drives the subtitles while it plays). */
  introText?: string;
  /** The opening video started (true) or ended (false). */
  onIntro?: (playing: boolean) => void;
  narrate: boolean;
  onWord?: (index: number) => void;
  /** Narration ended; `completed` is false when it was stopped or blocked. */
  onFinished?: (completed: boolean) => void;
  /** Player pause: freezes the video or narration where it is. */
  paused?: boolean;
  /** Playback position 0..1 for the player progress bar. */
  onProgress?: (fraction: number) => void;
}

// Playback order: the module opening video (first step of a module) → the step's own
// recorded video, or narration of the script when the step has no video.
type Phase = "step-video" | "intro-video" | "narration";

// Mouth frame for a 0..1 voice level: closed / half-open / open.
function mouthFor(level: number): "0" | "1" | "2" {
  return level < 0.12 ? "0" : level < 0.34 ? "1" : "2";
}

// Floating 3D presenter card that sits on the screenshot. While narrating, the voice
// level swaps between closed/half/open mouth frames (lip movement) and drives a glow.
// Remount (via `key`) to restart playback for a step.
export default function AvatarPanel({ step, introUrl, introText, onIntro, narrate, onWord, onFinished, paused = false, onProgress }: Props) {
  // Only request videos that exist: a missing one would load the SPA page instead.
  const afterIntro: Phase = hasStepVideo(step.id) ? "step-video" : "narration";
  const [phase, setPhase] = useState<Phase>(() => (introUrl ? "intro-video" : afterIntro));
  const [videoReady, setVideoReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlRef = useRef<NarrationControl | null>(null);
  const handlersRef = useRef({ onWord, onFinished, onProgress, onIntro });
  handlersRef.current = { onWord, onFinished, onProgress, onIntro };

  const videoSrc = phase === "step-video" ? avatarVideoUrl(step.id) : phase === "intro-video" ? introUrl : undefined;

  function videoFailed() {
    setVideoReady(false);
    setPhase(phase === "intro-video" ? afterIntro : "narration");
  }

  // Tell the page while the opening video plays, so the subtitles show its text.
  useEffect(() => {
    handlersRef.current.onIntro?.(phase === "intro-video");
  }, [phase]);

  useEffect(() => {
    if (phase !== "narration" || !narrate) return;
    const ctl = startNarration(step.id, step.script, {
      onProgress: (f) => handlersRef.current.onProgress?.(f),
      onStart: () => setSpeaking(true),
      onEnd: (completed) => {
        setSpeaking(false);
        handlersRef.current.onFinished?.(completed);
      },
      onWord: (i) => handlersRef.current.onWord?.(i),
      onLevel: (v) => {
        const el = cardRef.current;
        if (!el) return;
        el.style.setProperty("--lvl", v.toFixed(3));
        el.dataset.mouth = mouthFor(v);
      },
    });
    controlRef.current = ctl;
    return () => {
      controlRef.current = null;
      ctl();
    };
  }, [phase, narrate, step.id, step.script]);

  // Player pause / resume for whichever is playing (video or narration).
  useEffect(() => {
    const v = videoRef.current;
    if (v && videoReady) {
      if (paused) v.pause();
      else void (v.play() as Promise<void> | undefined)?.catch?.(() => {});
    } else if (controlRef.current) {
      if (paused) controlRef.current.pause?.();
      else controlRef.current.resume?.();
    }
  }, [paused, videoReady]);

  useEffect(() => () => stopSpeaking(), []);

  const status = paused ? "⏸ מושהה" : videoReady ? "▶ מציג סרטון" : speaking ? "🔊 מסביר…" : narrate ? "מוכן" : "🔇 קריינות כבויה";

  return (
    <aside aria-label="אוהד מנקין, המדריך" className="avatar-stage">
      <div ref={cardRef} data-mouth="0" className={`avatar-3d ${speaking ? "is-speaking" : ""}`}>
        {videoSrc && (
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            autoPlay
            playsInline
            preload="auto"
            aria-label={phase === "intro-video" ? "סרטון פתיחה של הנושא" : `סרטון הסבר: ${step.title}`}
            className={videoReady ? "avatar-media" : "hidden"}
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onError={videoFailed}
            onTimeUpdate={(e) => {
              // The video speaks the script (or the module opening): drive the subtitles from it.
              const v = e.currentTarget;
              if (v.duration > 0) handlersRef.current.onProgress?.(v.currentTime / v.duration);
              const spoken = phase === "step-video" ? step.script : introText;
              if (spoken && v.duration > 0) handlersRef.current.onWord?.(wordAtProgress(spoken, v.currentTime / v.duration));
            }}
            onEnded={() => {
              if (phase === "intro-video") {
                setVideoReady(false);
                handlersRef.current.onWord?.(-1);
                setPhase(afterIntro);
              } else {
                handlersRef.current.onFinished?.(true);
              }
            }}
          />
        )}
        {!videoReady && (
          <div className="avatar-face">
            {TALK_FRAMES.map((src, i) =>
              i === 0 ? (
                <img key={src} src={src} alt="אוהד מנקין, EPR מערכות" data-speaking={speaking ? "true" : "false"} className="avatar-frame" />
              ) : (
                <img key={src} src={src} alt="" aria-hidden="true" className={`avatar-frame mouth-${i}`} />
              ),
            )}
          </div>
        )}
        <div className="avatar-tag">
          <span className="font-bold">אוהד מנקין</span>
          <span className="text-[0.7em] opacity-90">{status}</span>
        </div>
      </div>
    </aside>
  );
}
