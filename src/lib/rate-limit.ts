const entries = new Map<string, { count: number; start: number }>();
/** Lightweight per-process development guard. Use a shared Redis-backed limiter before deploying multiple instances. */
export function rateAllowed(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const old = entries.get(key);
  if (!old || now - old.start > windowMs) {
    entries.set(key, { count: 1, start: now });
    return true;
  }
  old.count++;
  return old.count <= limit;
}
