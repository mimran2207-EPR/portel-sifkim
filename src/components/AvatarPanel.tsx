import { useEffect, useRef, useState } from "react";
import type { Step } from "../content/types";
import { TALK_FRAMES, avatarVideoUrl } from "../lib/media";
import { narrate as startNarration } from "../lib/narration";
import { stopSpeaking } from "../lib/speech";

interface Props {
  step: Step;
  /** Module opening video, played before narration on the module's first step. */
  introUrl?: string;
  narrate: boolean;
  onWord?: (index: number) => void;
  /** Narration ended; `completed` is false when it was stopped or blocked. */
  onFinished?: (completed: boolean) => void;
}

// Playback order: the step's own recorded video → the module intro video (first
// step only) followed by narration → narration of the script.
type Phase = "step-video" | "intro-video" | "narration";

// Mouth frame for a 0..1 voice level: closed / half-open / open.
function mouthFor(level: number): "0" | "1" | "2" {
  return level < 0.12 ? "0" : level < 0.34 ? "1" : "2";
}

// Floating 3D presenter card that sits on the screenshot. While narrating, the voice
// level swaps between closed/half/open mouth frames (lip movement) and drives a glow.
// Remount (via `key`) to restart playback for a step.
export default function AvatarPanel({ step, introUrl, narrate, onWord, onFinished }: Props) {
  const [phase, setPhase] = useState<Phase>("step-video");
  const [videoReady, setVideoReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef({ onWord, onFinished });
  handlersRef.current = { onWord, onFinished };

  const videoSrc = phase === "step-video" ? avatarVideoUrl(step.id) : phase === "intro-video" ? introUrl : undefined;

  function videoFailed() {
    setVideoReady(false);
    setPhase(phase === "step-video" && introUrl ? "intro-video" : "narration");
  }

  useEffect(() => {
    if (phase !== "narration" || !narrate) return;
    return startNarration(step.id, step.script, {
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
  }, [phase, narrate, step.id, step.script]);

  useEffect(() => () => stopSpeaking(), []);

  const status = videoReady ? "▶ מציג סרטון" : speaking ? "🔊 מסביר…" : narrate ? "מוכן" : "🔇 קריינות כבויה";

  return (
    <aside aria-label="העוזר הדיגיטלי, המדריך" className="avatar-stage">
      <div ref={cardRef} data-mouth="0" className={`avatar-3d ${speaking ? "is-speaking" : ""}`}>
        {videoSrc && (
          <video
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
            onEnded={() => {
              if (phase === "intro-video") {
                setVideoReady(false);
                setPhase("narration");
              }
            }}
          />
        )}
        {!videoReady && (
          <div className="avatar-face">
            {TALK_FRAMES.map((src, i) =>
              i === 0 ? (
                <img key={src} src={src} alt="העוזר הדיגיטלי של EPR מערכות" data-speaking={speaking ? "true" : "false"} className="avatar-frame" />
              ) : (
                <img key={src} src={src} alt="" aria-hidden="true" className={`avatar-frame mouth-${i}`} />
              ),
            )}
          </div>
        )}
        <div className="avatar-tag">
          <span className="font-bold">העוזר הדיגיטלי</span>
          <span className="text-[0.7em] opacity-90">{status}</span>
        </div>
      </div>
    </aside>
  );
}
