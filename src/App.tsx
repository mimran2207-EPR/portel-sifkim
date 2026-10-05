import { useCallback, useEffect, useState } from "react";
import { allSteps, findStep, modules } from "./content/lessons";
import { loadProgress, markDone, resetProgress, setLast } from "./lib/progress";
import Header from "./components/Header";
import ModuleNav from "./components/ModuleNav";
import StepStage from "./components/StepStage";
import AvatarPanel from "./components/AvatarPanel";
import Controls from "./components/Controls";
import { moduleIntroUrl } from "./lib/media";
import { isNarrationEnabled, setNarrationEnabled, stopSpeaking } from "./lib/speech";

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
  const [narrate, setNarrate] = useState(isNarrationEnabled);

  const step = allSteps[index];
  const found = findStep(step.id)!;
  const isFirst = index === 0;
  const isLast = index === allSteps.length - 1;
  const validIds = new Set(allSteps.map((s) => s.id));
  const doneCount = done.filter((id) => validIds.has(id)).length;
  const isModuleStart = found.module.steps[0].id === step.id;
  const introUrl = isModuleStart && found.module.intro ? moduleIntroUrl(found.module.id) : undefined;

  function toggleNarrate() {
    const next = !narrate;
    if (!next) stopSpeaking();
    setNarrationEnabled(next);
    setNarrate(next);
  }

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
      {/* Grid (RTL, columns fill right → left):
            mobile: presenter strip → stage → sticky controls (nav is a drawer)
            md:     nav | presenter strip above stage
            lg:     nav | stage | presenter column (left) */}
      <div className="mx-auto grid w-full max-w-[96rem] flex-1 grid-cols-1 content-start gap-4 p-3 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-6 md:p-6 lg:grid-cols-[20rem_minmax(0,1fr)_16rem] xl:grid-cols-[20rem_minmax(0,1fr)_19rem]">
        <div className="md:col-start-1 md:row-span-2 md:row-start-1 lg:row-span-1">
          <ModuleNav
            modules={modules}
            currentId={step.id}
            done={done}
            open={navOpen}
            onSelect={select}
            onReset={reset}
            onClose={() => setNavOpen(false)}
          />
        </div>
        <div className="md:col-start-2 md:row-start-1 lg:sticky lg:top-6 lg:col-start-3 lg:self-start">
          <AvatarPanel key={`${step.id}-${replay}`} step={step} introUrl={introUrl} narrate={narrate} />
        </div>
        <main className="flex min-w-0 flex-col gap-4 md:col-start-2 md:row-start-2 lg:row-start-1">
          <StepStage key={step.id} module={found.module} step={step} focusTitle={navigated} />
          <div className="sticky bottom-0 z-10 -mx-3 bg-white/95 px-3 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur md:mx-0 md:rounded-2xl md:bg-[#f1f6f8]/95 md:shadow-none">
            <Controls
              isFirst={isFirst}
              isLast={isLast}
              finished={done.includes(step.id)}
              onPrev={goPrev}
              onNext={goNext}
              onReplay={() => setReplay((r) => r + 1)}
              narrate={narrate}
              onToggleNarrate={toggleNarrate}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
