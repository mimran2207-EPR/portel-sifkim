import { useMemo } from "react";
import { tokenize } from "../lib/words";

interface Props {
  text: string;
  /** Index of the word being spoken now; -1 when idle. */
  active: number;
}

// Script text where the word currently being narrated glows yellow.
export default function KaraokeText({ text, active }: Props) {
  const tokens = useMemo(() => tokenize(text), [text]);
  return (
    <>
      {tokens.map((t, i) =>
        t.word < 0 ? (
          t.text
        ) : (
          <span key={i} data-word={t.word} className={t.word === active ? "word-active" : t.word < active ? "word-spoken" : undefined}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}
