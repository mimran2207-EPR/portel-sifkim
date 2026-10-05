import { useEffect, useState } from "react";
import type { Step } from "../content/types";
import { AVATAR_FALLBACK, avatarVideoUrl } from "../lib/media";
import { speak, stopSpeaking } from "../lib/speech";

interface Props {
  step: Step;
  /** Module opening video, played before narration on the module's first step. */
  introUrl?: string;
  narrate: boolean;
}

// Playback order: the step's own recorded video → the module intro video (first
// step only) followed by narration → browser narration of the script.
type Phase = "step-video" | "intro-video" | "narration";

// Remount (via `key`) to restart playback for a step.
// Until a clip has data we show the still avatar + speech bubble, so a missing
// clip never flashes an empty black player.
export default function AvatarPanel({ step, introUrl, narrate }: Props) {
  const [phase, setPhase] = useState<Phase>("step-video");
  const [videoReady, setVideoReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const videoSrc = phase === "step-video" ? avatarVideoUrl(step.id) : phase === "intro-video" ? introUrl : undefined;

  function videoFailed() {
    setVideoReady(false);
    setPhase(phase === "step-video" && introUrl ? "intro-video" : "narration");
  }

  useEffect(() => {
    if (phase !== "narration" || !narrate) return;
    speak(step.script, { onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false) });
    return () => stopSpeaking();
  }, [phase, narrate, step.script]);

  useEffect(() => () => stopSpeaking(), []);

  return (
    <aside aria-label="יהודה, המדריך" className="flex w-full items-end gap-3 lg:w-fit">
      {videoSrc && (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          controls
          playsInline
          preload="auto"
          aria-label={phase === "intro-video" ? "סרטון פתיחה של הנושא" : `סרטון הסבר: ${step.title}`}
          className={
            videoReady
              ? "aspect-square w-36 shrink-0 rounded-full bg-slate-100 object-cover shadow-md ring-4 ring-[#4fd1b5]/30 md:w-44"
              : "hidden"
          }
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
        <>
          <img
            src={AVATAR_FALLBACK}
            alt="יהודה, מנהל הדיגיטל"
            data-speaking={speaking ? "true" : "false"}
            className={`h-24 w-24 shrink-0 rounded-full bg-white object-cover shadow-md ring-4 md:h-28 md:w-28 lg:h-32 lg:w-32 ${
              speaking ? "avatar-speaking ring-[#4fd1b5]" : "ring-[#4fd1b5]/30"
            }`}
          />
          <div
            data-testid="speech-bubble"
            className="relative mb-2 max-h-28 min-w-0 flex-1 overflow-y-auto rounded-2xl rounded-es-none bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm lg:w-80 lg:flex-none"
          >
            <p className="mb-1 text-xs font-bold text-[#0e7c9b]">
              יהודה, מנהל הדיגיטל של EPR {speaking && <span aria-hidden="true">🔊</span>}
            </p>
            <p>{step.script}</p>
          </div>
        </>
      )}
    </aside>
  );
}
