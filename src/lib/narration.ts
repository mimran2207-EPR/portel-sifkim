// Step narration: plays the pre-recorded neural-voice MP3 (`/narration/<id>.mp3`,
// built by scripts/build-narration.py). If the file is missing or can't be decoded,
// falls back to the browser's own Hebrew text-to-speech.
import { speak, stopSpeaking, type SpeakHandlers } from "./speech";

export function narrationUrl(id: string): string {
  return `/narration/${id}.mp3`;
}

/** Starts narrating a step; returns a function that stops it. */
export function narrate(id: string, text: string, handlers: SpeakHandlers = {}): () => void {
  let stopped = false;
  let audio: HTMLAudioElement | undefined;
  const fallback = () => {
    if (!stopped) speak(text, handlers);
  };

  try {
    audio = new Audio(narrationUrl(id));
  } catch {
    fallback();
    return () => {
      stopped = true;
      stopSpeaking();
    };
  }

  audio.onplaying = () => handlers.onStart?.();
  audio.onended = () => handlers.onEnd?.();
  audio.onerror = () => {
    handlers.onEnd?.();
    fallback();
  };
  // Older engines (and jsdom) don't return a promise from play().
  const playing = audio.play() as Promise<void> | undefined;
  playing?.catch?.((err: unknown) => {
    // Autoplay blocked until the user interacts: stay silent, "השמע שוב" retries.
    if (err instanceof DOMException && err.name === "NotAllowedError") handlers.onEnd?.();
  });

  return () => {
    stopped = true;
    audio?.pause();
    stopSpeaking();
    handlers.onEnd?.();
  };
}
