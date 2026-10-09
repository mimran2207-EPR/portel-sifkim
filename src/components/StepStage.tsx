import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Module, Step } from "../content/types";
import { screenUrl } from "../lib/media";
import KaraokeText from "./KaraokeText";
import { stepLabel } from "../content/label";
import { sentenceRange } from "../lib/words";

interface Props {
  module: Module;
  step: Step;
  focusTitle?: boolean;
  /** Word being narrated; highlighted in the caption. */
  activeWord?: number;
  /** Text being spoken now when it is not the step script (the module opening video). */
  captionText?: string;
  /** Floating presenter (avatar) drawn over a corner of the screenshot. */
  presenter?: ReactNode;
  /** Side arrows on the screenshot (previous / next screen). */
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
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

// Phones: true below the md breakpoint (768px).
function useIsMobile(): boolean {
  const query = "(max-width: 767px)";
  const get = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  const [mobile, setMobile] = useState(get);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(query);
    const on = () => setMobile(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return mobile;
}

// On phones the screenshot is zoomed onto the highlighted area so it is readable;
// returns the frame height and the zoomed image box (px), or null when not zooming.
function useZoom(step: Step, enabled: boolean, frameRef: React.RefObject<HTMLDivElement | null>, ratio: number | null) {
  const [box, setBox] = useState<{ frameH: number; w: number; left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    const h = step.highlight;
    const el = frameRef.current;
    if (!enabled || !h || !el || !ratio) return setBox(null);
    const calc = () => {
      const W = el.clientWidth;
      const zoom = Math.min(3, Math.max(1.5, 75 / h.w));
      const w = W * zoom;
      const innerH = w / ratio;
      const frameH = Math.min(W * 0.8, innerH);
      const cx = ((h.x + h.w / 2) / 100) * w;
      const cy = ((h.y + h.h / 2) / 100) * innerH;
      const left = Math.min(0, Math.max(W - w, W / 2 - cx));
      const top = Math.min(0, Math.max(frameH - innerH, frameH / 2 - cy));
      setBox({ frameH, w, left, top });
    };
    calc();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(calc) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [step, enabled, frameRef, ratio]);
  return box;
}

const arrow =
  "absolute top-[16%] z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-2xl text-[#0e7c9b] shadow-lg ring-1 ring-slate-200 backdrop-blur transition hover:scale-110 hover:bg-white focus-visible:outline-2 focus-visible:outline-[#0e7c9b] disabled:pointer-events-none disabled:opacity-0 md:h-14 md:w-14";

export default function StepStage({ module, step, focusTitle = false, activeWord = -1, captionText, presenter, onPrev, onNext, canPrev = true, canNext = true }: Props) {
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);
  const showImage = failed !== step.id;
  const isMobile = useIsMobile();
  const [ratio, setRatio] = useState<number | null>(null);
  const [fullView, setFullView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const zoom = useZoom(step, isMobile && !fullView && showImage, frameRef, ratio);
  const spoken = captionText ?? step.script;

  return (
    <section aria-labelledby="step-title" className="rounded-2xl bg-white p-3 shadow-sm md:px-3 md:py-2">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 md:mb-1.5">
        <span className="rounded-full bg-[#0e7c9b]/10 px-3 py-0.5 text-xs font-medium text-[#0e7c9b]">
          {module.icon} {module.title} · שלב {stepLabel(step.id)}
        </span>
        <h2 id="step-title" ref={titleRef} tabIndex={-1} className="text-xl focus:outline-none font-bold text-slate-800 md:text-lg">
          {step.title}
        </h2>
      </div>

      {/* Width is capped from viewport height so image + ring scale together (keeps % coords exact). */}
      <div className={`stage-fit relative mx-auto w-full ${step.tip || step.warning ? "has-notes" : ""}`}>
        {showImage ? (
          <div ref={frameRef} className="relative overflow-hidden rounded-xl border border-slate-100" style={zoom ? { height: zoom.frameH } : undefined}>
            <div
              className={zoom ? "absolute transition-[left,top] duration-500" : "relative"}
              style={zoom ? { width: zoom.w, left: zoom.left, top: zoom.top } : undefined}
            >
              <img
                key={step.id}
                data-role="screen"
                src={screenUrl(step.id)}
                alt={`צילום מסך: ${step.title}`}
                className={`block w-full ${loaded === step.id ? "" : "invisible"}`}
                onLoad={(e) => {
                  setLoaded(step.id);
                  const im = e.currentTarget;
                  if (im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight);
                }}
                onError={() => setFailed(step.id)}
              />
              <HighlightRing step={step} />
            </div>
            {isMobile && step.highlight && (
              <button
                type="button"
                onClick={() => setFullView((v) => !v)}
                className="absolute right-2 top-2 z-30 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#0e7c9b] shadow ring-1 ring-slate-200"
              >
                {fullView ? "🔍 התמקד באזור" : "⤢ מסך מלא"}
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <Placeholder module={module} step={step} />
            <HighlightRing step={step} />
          </div>
        )}
        {/* RTL: previous screen on the right edge, next screen on the left edge */}
        {onPrev && (
          <button type="button" aria-label="המסך הקודם" onClick={onPrev} disabled={!canPrev} className={`${arrow} right-1 max-md:hidden md:-right-5`}>
            <span aria-hidden="true">›</span>
          </button>
        )}
        {onNext && (
          <button type="button" aria-label="המסך הבא" onClick={onNext} disabled={!canNext} className={`${arrow} left-1 max-md:hidden md:-left-5`}>
            <span aria-hidden="true">‹</span>
          </button>
        )}
        {presenter && (
          // Always the same corner (bottom-left) so the presenter never jumps between steps.
          <div
            data-testid="presenter-slot"
            style={{ ["--tilt" as string]: -1 }}
            className="presenter-slot absolute bottom-2 left-2 z-20 w-16 md:bottom-0 md:left-1 md:w-[clamp(56px,10%,150px)] md:translate-y-[4%] md:-translate-x-[34%]"
          >
            {presenter}
          </div>
        )}
      </div>

      {/* Subtitles: the sentence being spoken, like a video's captions. Fixed height, so nothing jumps. */}
      <div data-testid="caption" className="subtitles">
        <p>
          <KaraokeText text={spoken} active={activeWord} range={sentenceRange(spoken, Math.max(activeWord, 0))} />
        </p>
      </div>

      {(step.warning || step.tip) && (
        <div className="mt-2 flex flex-col gap-1.5">
          {step.warning && (
            <p role="note" className="note note-warn">
              <span aria-hidden="true">⚠️</span> <strong>שימו לב:</strong> {step.warning}
            </p>
          )}
          {step.tip && (
            <p className="note note-tip">
              <span aria-hidden="true">💡</span> <strong>טיפ:</strong> {step.tip}
            </p>
          )}
        </div>
      )}

      <details className="transcript mt-2">
        <summary>התמלול המלא של השלב</summary>
        <p data-testid="transcript">
          <KaraokeText text={step.script} active={captionText ? -1 : activeWord} />
        </p>
      </details>
    </section>
  );
}
