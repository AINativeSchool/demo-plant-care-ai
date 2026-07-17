/** Returns the configured app basePath with no trailing slash. */
function getBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!raw || raw === "/") {
    return "";
  }
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
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
