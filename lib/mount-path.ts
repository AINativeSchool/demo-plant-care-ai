/** Normalizes a mount path: leading slash, no trailing slash; empty means domain root. */
export function normalizeMountPath(raw?: string): string {
  const value = raw?.trim() ?? "";
  if (!value || value === "/") {
    return "";
  }

  const withLeading = value.startsWith("/") ? value : `/${value}`;
  return withLeading.endsWith("/") ? withLeading.slice(0, -1) : withLeading;
}
