// Media locations (files live under /public).
// Same pose with closed / half-open / open mouth; swapped by voice level for lip movement.
export const TALK_FRAMES = ["/avatar/fig-0.webp", "/avatar/fig-1.webp", "/avatar/fig-2.webp"];

export function screenUrl(id: string): string {
  return `/screens/${id}.jpg`;
}

export function moduleIntroUrl(moduleId: string): string {
  return `/avatar/m${moduleId}.mp4`;
}

// Transparent-background WebM (VP9 alpha) where supported; Safari gets the MP4 (black background).
function preferWebm(): boolean {
  if (typeof document === "undefined" || typeof navigator === "undefined") return false;
  if (/Apple/.test(navigator.vendor ?? "")) return false;
  try {
    return document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
  } catch {
    return false;
  }
}

export function avatarVideoUrl(id: string): string {
  if (preferWebm()) return `/avatar/${id}.webm`;
  return `/avatar/${id}.mp4`;
}
