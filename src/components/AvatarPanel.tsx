import { useState } from "react";
import type { Step } from "../content/types";
import { AVATAR_FALLBACK, avatarVideoUrl } from "../lib/media";

interface Props {
  step: Step;
}

type VideoState = "loading" | "ready" | "failed";

// Remount (via `key`) to restart playback / retry the video for a step.
// Until the clip has data we show the still avatar + speech bubble, so a missing
// clip never flashes an empty black player.
export default function AvatarPanel({ step }: Props) {
  const [video, setVideo] = useState<VideoState>("loading");

  return (
    <aside aria-label="יהודה, המדריך" className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm">
      {video !== "failed" && (
        <video
          src={avatarVideoUrl(step.id)}
          autoPlay
          controls
          playsInline
          aria-label={`סרטון הסבר: ${step.title}`}
          className={video === "ready" ? "aspect-square w-40 rounded-2xl bg-slate-100 object-cover md:w-48" : "hidden"}
          onLoadedData={() => setVideo("ready")}
          onError={() => setVideo("failed")}
        />
      )}
      {video !== "ready" && (
        <>
          <img
            src={AVATAR_FALLBACK}
            alt="יהודה, מנהל הדיגיטל"
            className="h-16 w-16 shrink-0 rounded-full shadow-md ring-4 ring-[#4fd1b5]/30 md:h-20 md:w-20"
          />
          <div
            data-testid="speech-bubble"
            className="relative max-h-28 flex-1 overflow-y-auto rounded-2xl rounded-ss-none bg-[#0e7c9b]/8 p-3 text-sm leading-relaxed text-slate-700 md:max-h-40"
          >
            <p className="mb-1 text-xs font-bold text-[#0e7c9b]">יהודה, מנהל הדיגיטל של EPR</p>
            <p>{step.script}</p>
          </div>
        </>
      )}
    </aside>
  );
}
