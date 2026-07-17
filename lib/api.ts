import { normalizeMountPath } from "./mount-path";

/** Returns the configured app basePath with no trailing slash. */
function getBasePath(): string {
  return normalizeMountPath(process.env.NEXT_PUBLIC_BASE_PATH);
}

/** Builds an absolute in-app URL for an API route, honoring basePath when set. */
export function apiUrl(path: string): string {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

/** fetch wrapper for internal API routes that respects basePath. */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
