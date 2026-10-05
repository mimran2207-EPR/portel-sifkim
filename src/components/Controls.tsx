interface Props {
  isFirst: boolean;
  isLast: boolean;
  finished: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReplay: () => void;
}

const base =
  "rounded-2xl px-5 py-2.5 font-medium shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7c9b] disabled:cursor-not-allowed disabled:opacity-40";

export default function Controls({ isFirst, isLast, finished, onPrev, onNext, onReplay }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`${base} bg-white text-slate-700 hover:bg-slate-50`} onClick={onPrev} disabled={isFirst}>
          <span aria-hidden="true">→ </span>הקודם
        </button>
        <button type="button" className={`${base} bg-white text-[#0e7c9b] hover:bg-slate-50`} onClick={onReplay}>
          <span aria-hidden="true">↻ </span>השמע שוב
        </button>
        <button type="button" className={`${base} muni-gradient text-white hover:brightness-105`} onClick={onNext}>
          {isLast ? (
            <>
              סיום ההדרכה <span aria-hidden="true">🎉</span>
            </>
          ) : (
            <>
              הבא<span aria-hidden="true"> ←</span>
            </>
          )}
        </button>
      </div>
      {isLast && finished && (
        <p role="status" className="text-sm font-medium text-[#0e7c9b]">
          כל הכבוד! סיימתם את ההדרכה.
        </p>
      )}
      <p className="hidden text-xs text-slate-400 md:block">אפשר לנווט גם עם מקשי החצים במקלדת</p>
    </div>
  );
}
