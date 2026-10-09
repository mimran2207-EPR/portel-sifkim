import type { Module } from "../content/types";
import { stepLabel } from "../content/label";

interface Props {
  modules: Module[];
  currentId: string;
  done: string[];
  onSelect: (stepId: string) => void;
}

type State = "done" | "current" | "todo";

function moduleState(m: Module, currentId: string, done: Set<string>): State {
  if (m.steps.some((s) => s.id === currentId)) return "current";
  return m.steps.every((s) => done.has(s.id)) ? "done" : "todo";
}

const circle: Record<State, string> = {
  done: "bg-[#4fd1b5] text-white border-[#4fd1b5]",
  current: "muni-gradient text-white border-transparent ring-4 ring-[#4fd1b5]/30 scale-110",
  todo: "bg-white text-slate-400 border-slate-300",
};

// E-learning style progress: one numbered circle per topic (process) with a connecting
// line, then the steps of the current topic as smaller circles. Every circle jumps there.
export default function ProcessStepper({ modules, currentId, done, onSelect }: Props) {
  const doneSet = new Set(done);
  const current = modules.find((m) => m.steps.some((s) => s.id === currentId)) ?? modules[0];
  const stepIndex = current.steps.findIndex((s) => s.id === currentId);

  return (
    <nav aria-label="תהליכי ההדרכה" className="rounded-2xl bg-white px-3 py-2.5 shadow-sm md:flex md:items-center md:gap-3 md:px-4 md:py-1.5">
      <ol className="flex items-start overflow-x-auto pb-1 md:flex-1 md:pb-0" data-testid="process-stepper">
        {modules.map((m, i) => {
          const st = moduleState(m, currentId, doneSet);
          return (
            <li key={m.id} className="flex min-w-[2.6rem] flex-1 items-start md:min-w-[2.2rem]">
              <button
                type="button"
                onClick={() => onSelect(m.steps[0].id)}
                aria-current={st === "current" ? "step" : undefined}
                aria-label={`נושא ${i + 1}: ${m.title}${st === "done" ? " (הושלם)" : ""}`}
                className="group flex w-full flex-col items-center gap-1 focus:outline-none"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-[#0e7c9b]/40 md:h-7 md:w-7 md:text-xs ${circle[st]}`}
                >
                  {st === "done" ? "✓" : i + 1}
                </span>
                <span className={`text-center text-[0.68rem] leading-tight md:text-xs ${st === "current" ? "font-bold text-[#0e7c9b] max-md:whitespace-nowrap" : "text-slate-500 max-md:hidden"} md:hidden`}>
                  {m.title}
                </span>
              </button>
              {i < modules.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mt-[1rem] h-0.5 min-w-2 flex-1 md:mt-[0.85rem] ${st === "done" ? "bg-[#4fd1b5]" : "bg-slate-200"}`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-2 md:mt-0 md:flex-nowrap md:border-t-0 md:border-r md:pt-0 md:pr-3" data-testid="step-dots">
        <span className="text-xs text-slate-500 md:hidden">
          {current.icon} {current.title} · שלב {stepIndex + 1} מתוך {current.steps.length}
        </span>
        <ol className="flex flex-wrap items-center gap-1.5">
          {current.steps.map((s, i) => {
            const isCur = s.id === currentId;
            const isDone = doneSet.has(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  aria-current={isCur ? "step" : undefined}
                  aria-label={`שלב ${stepLabel(s.id)}: ${s.title}`}
                  title={s.title}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold md:h-6 md:w-6 md:text-[0.7rem] transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#0e7c9b] ${
                    isCur
                      ? "border-[#0e7c9b] bg-[#0e7c9b] text-white"
                      : isDone
                        ? "border-[#4fd1b5] bg-[#4fd1b5]/15 text-[#0b5f77]"
                        : "border-slate-300 bg-white text-slate-500"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
