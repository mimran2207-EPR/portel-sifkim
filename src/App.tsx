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

  const step = allSteps[index];
  const found = findStep(step.id)!;
  const isFirst = index === 0;
  const isLast = index === allSteps.length - 1;

  useEffect(() => {
    setLast(step.id);
  }, [step.id]);

  const goNext = useCallback(() => {
    markDone(allSteps[index].id);
    setDone(loadProgress().done);
    if (index < allSteps.length - 1) setIndex(index + 1);
  }, [index]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(index - 1);
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return setNavOpen(false);
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag && SKIP_KEYS_IN.has(tag)) return;
      if (e.key === "ArrowLeft") goNext();
      else if (e.key === "ArrowRight") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  function select(id: string) {
    const f = findStep(id);
    if (f) setIndex(f.index);
    setNavOpen(false);
  }

  function reset() {
    resetProgress();
    setDone([]);
    setIndex(0);
    setNavOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header done={done.length} total={allSteps.length} navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)} />
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
        {/* Mobile: avatar → stage → controls. Tablet: stage → avatar → controls.
            Desktop (lg): stage on top; controls (right) + avatar (left) below. */}
        <main className="flex min-w-0 flex-1 flex-col gap-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)] lg:content-start lg:items-end">
          <div className="order-2 md:order-1 lg:order-none lg:col-span-2">
            <StepStage key={step.id} module={found.module} step={step} />
          </div>
          <div className="order-3 max-md:sticky max-md:bottom-0 max-md:-mx-3 max-md:bg-white/95 max-md:px-3 max-md:py-2 max-md:shadow-[0_-4px_12px_rgba(0,0,0,0.06)] max-md:backdrop-blur lg:order-none">
            <Controls
              isFirst={isFirst}
              isLast={isLast}
              finished={done.includes(step.id)}
              onPrev={goPrev}
              onNext={goNext}
              onReplay={() => setReplay((r) => r + 1)}
            />
          </div>
          <div className="order-1 md:order-2 lg:order-none">
            <AvatarPanel key={`${step.id}-${replay}`} step={step} />
          </div>
        </main>
      </div>
    </div>
  );
}
