// Media locations (files live under /public). Swap AVATAR_FALLBACK to a .png when the real photo arrives.
export const AVATAR_FALLBACK = "/avatar/avatar.svg";

export function screenUrl(id: string): string {
  return `/screens/${id}.png`;
}

export function avatarVideoUrl(id: string): string {
  return `/avatar/${id}.mp4`;
}
