// Media locations (files live under /public).
export const AVATAR_FALLBACK = "/avatar/avatar.jpg"; // round face crop (mobile/tablet)
export const PRESENTER_IMAGE = "/avatar/presenter.jpg"; // 3:4 half-body (desktop presenter column)

export function screenUrl(id: string): string {
  return `/screens/${id}.png`;
}

export function moduleIntroUrl(moduleId: string): string {
  return `/avatar/m${moduleId}.mp4`;
}

export function avatarVideoUrl(id: string): string {
  return `/avatar/${id}.mp4`;
}
