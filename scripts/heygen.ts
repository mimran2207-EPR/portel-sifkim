import type { Module } from "../src/content/types";

const WORDS_PER_SECOND = 2.5;

function estimateSeconds(script: string): number {
  const words = script.trim().split(/\s+/).filter(Boolean).length;
  return Math.round(words / WORDS_PER_SECOND);
}

const HEADER = `# תסריטים להקלטה ב-HeyGen

## הוראות

- מקליטים סרטון אחד לכל שלב (step) באתר.
- אווטאר: האווטאר הסגנוני המאושר של יהודה.
- קול: קול בעברית.
- ייצוא: מומלץ יחס 1:1 (ריבוע), כי האתר מציג את האווטאר בתוך עיגול.
- פורמט: MP4.
- שם הקובץ: \`<id>.mp4\` (למשל \`4.5.mp4\`).
- מיקום: מניחים את הקבצים בתיקייה \`public/avatar/\`.

הטקסט בציטוט הוא התסריט להדבקה ב-HeyGen, מילה במילה.
`;

export function renderHeygenMarkdown(modules: Module[]): string {
  const parts: string[] = [HEADER];
  for (const m of modules) {
    parts.push(`# ${m.icon} ${m.title}\n`);
    for (const s of m.steps) {
      const quote = s.script
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
      parts.push(
        `## ${s.id} — ${s.title}\n\nקובץ: \`${s.id}.mp4\`\n\n${quote}\n\nאורך משוער: ≈ ${estimateSeconds(s.script)} שניות\n`,
      );
    }
  }
  return parts.join("\n");
}
