// Media locations (files live under /public).
export const AVATAR_FALLBACK = "/avatar/avatar.png";

export function screenUrl(id: string): string {
  return `/screens/${id}.png`;
}

export function moduleIntroUrl(moduleId: string): string {
  return `/avatar/m${moduleId}.mp4`;
}

export function avatarVideoUrl(id: string): string {
  return `/avatar/${id}.mp4`;
}
