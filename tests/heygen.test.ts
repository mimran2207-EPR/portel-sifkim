import { modules } from "../src/content/lessons";
import { renderHeygenMarkdown } from "../scripts/heygen";

describe("renderHeygenMarkdown", () => {
  const md = renderHeygenMarkdown(modules);
  const step = modules.flatMap((m) => m.steps).find((s) => s.id === "4.5")!;

  it("has title and per-step heading", () => {
    expect(md).toContain("תסריטים להקלטה ב-HeyGen");
    expect(md).toContain("## 4.5");
  });

  it("includes the script verbatim and the filename hint", () => {
    expect(md).toContain(step.script);
    expect(md).toContain("4.5.mp4");
  });

  it("includes module headings and a duration for every step", () => {
    modules.forEach((m) => expect(md).toContain(`# ${m.icon} ${m.title}`));
    const total = modules.reduce((n, m) => n + m.steps.length, 0);
    expect(md.match(/≈ \d+ שניות/g)).toHaveLength(total);
  });
});
