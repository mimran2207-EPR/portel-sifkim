import { useEffect, useState } from "react";
import type { Step } from "../content/types";
import { AVATAR_FALLBACK, PRESENTER_IMAGE, avatarVideoUrl } from "../lib/media";
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

// Layout: below lg a compact strip (round face + speech bubble); on lg+ a tall
// presenter card (3:4 portrait, name, status) that lives in its own left column.
// Remount (via `key`) to restart playback for a step. Until a clip has data we
// show the still avatar, so a missing clip never flashes an empty black player.
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

  const status = videoReady ? "▶ מציג סרטון" : speaking ? "🔊 מסביר עכשיו…" : narrate ? "מוכן להסביר" : "🔇 קריינות כבויה";

  return (
    <aside
      aria-label="יהודה, המדריך"
      className="flex w-full items-end gap-3 lg:flex-col lg:items-stretch lg:gap-3 lg:rounded-2xl lg:bg-white lg:p-3 lg:shadow-sm"
    >
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
              ? "aspect-square w-36 shrink-0 rounded-full bg-slate-100 object-cover shadow-md ring-4 ring-[#4fd1b5]/30 md:w-44 lg:aspect-[3/4] lg:w-full lg:rounded-xl lg:ring-0"
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
        <picture className="shrink-0 lg:block">
          <source media="(min-width: 1024px)" srcSet={PRESENTER_IMAGE} />
          <img
            src={AVATAR_FALLBACK}
            alt="יהודה, מנהל הדיגיטל"
            data-speaking={speaking ? "true" : "false"}
            className={`h-24 w-24 rounded-full bg-white object-cover shadow-md ring-4 md:h-28 md:w-28 lg:aspect-[3/4] lg:h-auto lg:w-full lg:rounded-xl ${
              speaking ? "avatar-speaking ring-[#4fd1b5]" : "ring-[#4fd1b5]/30"
            }`}
          />
        </picture>
      )}

      {/* Desktop presenter caption */}
      <div className="hidden text-center lg:block">
        <p className="font-bold text-slate-800">יהודה</p>
        <p className="text-sm text-slate-500">מנהל הדיגיטל, EPR</p>
        <p
          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
            speaking || videoReady ? "bg-[#4fd1b5]/20 text-[#0e7c9b]" : "bg-slate-100 text-slate-500"
          }`}
        >
          {status}
        </p>
      </div>

      {/* Mobile/tablet speech bubble (desktop shows the script under the screenshot) */}
      {!videoReady && (
        <div
          data-testid="speech-bubble"
          className="relative mb-2 max-h-28 min-w-0 flex-1 overflow-y-auto rounded-2xl rounded-es-none bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm lg:hidden"
        >
          <p className="mb-1 text-xs font-bold text-[#0e7c9b]">
            יהודה, מנהל הדיגיטל של EPR {speaking && <span aria-hidden="true">🔊</span>}
          </p>
          <p>{step.script}</p>
        </div>
      )}
    </aside>
  );
}
