import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Module, Step } from "../content/types";
import { screenUrl } from "../lib/media";
import KaraokeText from "./KaraokeText";
import { sentenceRange } from "../lib/words";

interface Props {
  module: Module;
  step: Step;
  focusTitle?: boolean;
  /** Word being narrated; highlighted in the caption. */
  activeWord?: number;
  /** Floating presenter (avatar) drawn over a corner of the screenshot. */
  presenter?: ReactNode;
}

function HighlightRing({ step }: { step: Step }) {
  const h = step.highlight;
  if (!h) return null;
  return (
    <div
      data-testid="highlight"
      className="highlight-ring spotlight pointer-events-none absolute"
      style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
      aria-hidden="true"
    />
  );
}

function Placeholder({ module, step }: Props) {
  return (
    <div
      data-testid="screen-placeholder"
      className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-[#0e7c9b]/10 to-[#4fd1b5]/15 p-6 text-center"
    >
      <span className="text-5xl" aria-hidden="true">
        {module.icon}
      </span>
      <p className="text-xl font-bold text-[#0e7c9b] md:text-2xl">{step.title}</p>
      <p className="text-sm text-slate-500">צילום המסך לשלב זה יתווסף בקרוב</p>
    </div>
  );
}

// Put the presenter on the side away from the highlighted area so it never hides it.
function presenterSide(step: Step): "left" | "right" {
  const h = step.highlight;
  if (!h) return "left";
  return h.x + h.w / 2 < 45 ? "right" : "left";
}

export default function StepStage({ module, step, focusTitle = false, activeWord = -1, presenter }: Props) {
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);
  const showImage = failed !== step.id;

  return (
    <section aria-labelledby="step-title" className="rounded-2xl bg-white p-3 shadow-sm md:p-4">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="rounded-full bg-[#0e7c9b]/10 px-3 py-0.5 text-xs font-medium text-[#0e7c9b]">
          {module.icon} {module.title} · שלב {step.id}
        </span>
        <h2 id="step-title" ref={titleRef} tabIndex={-1} className="text-xl focus:outline-none font-bold text-slate-800 md:text-2xl">
          {step.title}
        </h2>
      </div>

      {/* Width is capped from viewport height so image + ring scale together (keeps % coords exact). */}
      <div className="relative mx-auto w-full max-w-[max(18rem,calc((100vh-10rem)*2.05))]">
        {showImage ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-100">
            <img
              key={step.id}
              data-role="screen"
              src={screenUrl(step.id)}
              alt={`צילום מסך: ${step.title}`}
              className={`block w-full ${loaded === step.id ? "" : "invisible"}`}
              onLoad={() => setLoaded(step.id)}
              onError={() => setFailed(step.id)}
            />
            <HighlightRing step={step} />
          </div>
        ) : (
          <div className="relative">
            <Placeholder module={module} step={step} />
            <HighlightRing step={step} />
          </div>
        )}
        {activeWord >= 0 && (
          <p
            data-testid="subtitle"
            data-variant="dark"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[6%] left-1/2 z-10 hidden w-max md:block max-w-[62%] -translate-x-1/2 rounded-xl bg-slate-900/80 px-4 py-2 text-center text-sm leading-relaxed text-white shadow-lg backdrop-blur-sm md:text-lg"
          >
            <KaraokeText text={step.script} active={activeWord} range={sentenceRange(step.script, activeWord)} />
          </p>
        )}
        {presenter && (
          <div
            data-testid="presenter-slot"
            style={{ ["--tilt" as string]: presenterSide(step) === "left" ? -1 : 1 }}
            className={`absolute bottom-0 z-10 w-[clamp(64px,17%,220px)] translate-y-[8%] ${
              presenterSide(step) === "left" ? "left-1 md:-translate-x-[22%]" : "right-1 md:translate-x-[22%]"
            }`}
          >
            {presenter}
          </div>
        )}
      </div>

      {step.warning && (
        <div role="note" className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <span aria-hidden="true">⚠️</span>
          <p>
            <strong>שימו לב: </strong>
            {step.warning}
          </p>
        </div>
      )}
      {step.tip && (
        <div className="mt-4 flex gap-2 rounded-xl border border-[#4fd1b5]/50 bg-[#4fd1b5]/10 p-3 text-sm text-[#0b5f77]">
          <span aria-hidden="true">💡</span>
          <p>
            <strong>טיפ: </strong>
            {step.tip}
          </p>
        </div>
      )}

      <p data-testid="caption" className="mt-4 rounded-xl bg-slate-50 p-3 leading-relaxed text-slate-700 md:text-lg">
        <KaraokeText text={step.script} active={activeWord} />
      </p>
    </section>
  );
}
