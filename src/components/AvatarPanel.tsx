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
    <aside aria-label="יהודה, המדריך" className="flex w-full items-end gap-3 lg:w-fit">
      {video !== "failed" && (
        <video
          src={avatarVideoUrl(step.id)}
          autoPlay
          controls
          playsInline
          aria-label={`סרטון הסבר: ${step.title}`}
          className={
            video === "ready"
              ? "aspect-square w-36 shrink-0 rounded-full bg-slate-100 object-cover shadow-md ring-4 ring-[#4fd1b5]/30 md:w-44"
              : "hidden"
          }
          onLoadedData={() => setVideo("ready")}
          onError={() => setVideo("failed")}
        />
      )}
      {video !== "ready" && (
        <>
          <img
            src={AVATAR_FALLBACK}
            alt="יהודה, מנהל הדיגיטל"
            className="h-20 w-20 shrink-0 rounded-full bg-white shadow-md ring-4 ring-[#4fd1b5]/30 md:h-24 md:w-24"
          />
          <div
            data-testid="speech-bubble"
            className="relative mb-2 max-h-28 min-w-0 flex-1 overflow-y-auto rounded-2xl rounded-es-none bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm lg:w-80 lg:flex-none"
          >
            <p className="mb-1 text-xs font-bold text-[#0e7c9b]">יהודה, מנהל הדיגיטל של EPR</p>
            <p>{step.script}</p>
          </div>
        </>
      )}
    </aside>
  );
}
