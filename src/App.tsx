import { useCallback, useEffect, useState } from "react";
import { allSteps, findStep, modules } from "./content/lessons";
import { loadProgress, markDone, resetProgress, setLast } from "./lib/progress";
import Header from "./components/Header";
import ModuleNav from "./components/ModuleNav";
import StepStage from "./components/StepStage";
import AvatarPanel from "./components/AvatarPanel";
import Controls from "./components/Controls";

function initialIndex(): number {
  const last = loadProgress().last;
  return (last && findStep(last)?.index) || 0;
}

const SKIP_KEYS_IN = new Set(["INPUT", "TEXTAREA", "SELECT", "VIDEO"]);

export default function App() {
  const [index, setIndex] = useState(initialIndex);
  const [done, setDone] = useState<string[]>(() => loadProgress().done);
  const [navOpen, setNavOpen] = useState(false);
  const [replay, setReplay] = useState(0);
  const [navigated, setNavigated] = useState(false);

  const step = allSteps[index];
  const found = findStep(step.id)!;
  const isFirst = index === 0;
  const isLast = index === allSteps.length - 1;
  const validIds = new Set(allSteps.map((s) => s.id));
  const doneCount = done.filter((id) => validIds.has(id)).length;

  useEffect(() => {
    setLast(step.id);
  }, [step.id]);

  const goNext = useCallback(() => {
    markDone(allSteps[index].id);
    setDone(loadProgress().done);
    if (index < allSteps.length - 1) {
      setIndex(index + 1);
      setNavigated(true);
    }
  }, [index]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
      setNavigated(true);
    }
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return setNavOpen(false);
      if (navOpen || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable || (target?.tagName && SKIP_KEYS_IN.has(target.tagName))) return;
      if (e.key === "ArrowLeft") goNext();
      else if (e.key === "ArrowRight") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, navOpen]);

  function select(id: string) {
    const f = findStep(id);
    if (f) {
      setIndex(f.index);
      setNavigated(true);
    }
    setNavOpen(false);
  }

  function reset() {
    if (!window.confirm("לאפס את ההתקדמות?")) return;
    resetProgress();
    setDone([]);
    setIndex(0);
    setNavOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div aria-live="polite" className="sr-only">
        {`שלב ${index + 1} מתוך ${allSteps.length}: ${step.title}`}
      </div>
      <Header done={doneCount} total={allSteps.length} navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-4 p-3 md:gap-6 md:p-6">
        <ModuleNav
          modules={modules}
          currentId={step.id}
          done={done}
          open={navOpen}
          onSelect={select}
          onReset={reset}
          onClose={() => setNavOpen(false)}
        />
        {/* Mobile: avatar → stage → sticky controls. Tablet: stage → avatar → controls.
            Desktop (lg): stage, then a sticky dock with controls (right) + round avatar (left).
            Below lg the dock is `display: contents`, so its children take part in main's ordering. */}
        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="order-2 md:order-1 lg:order-none">
            <StepStage key={step.id} module={found.module} step={step} focusTitle={navigated} />
          </div>
          <div className="contents lg:sticky lg:bottom-0 lg:z-10 lg:-mx-2 lg:flex lg:items-end lg:justify-between lg:gap-4 lg:rounded-2xl lg:bg-[#f1f6f8]/95 lg:p-2 lg:backdrop-blur">
            <div className="order-3 max-md:sticky max-md:bottom-0 max-md:-mx-3 max-md:bg-white/95 max-md:px-3 max-md:py-2 max-md:shadow-[0_-4px_12px_rgba(0,0,0,0.06)] max-md:backdrop-blur lg:order-none lg:shrink-0">
              <Controls
                isFirst={isFirst}
                isLast={isLast}
                finished={done.includes(step.id)}
                onPrev={goPrev}
                onNext={goNext}
                onReplay={() => setReplay((r) => r + 1)}
              />
            </div>
            <div className="order-1 md:order-2 lg:order-none lg:min-w-0 lg:max-w-md">
              <AvatarPanel key={`${step.id}-${replay}`} step={step} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
