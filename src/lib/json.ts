/**
 * Safe JSON parsing for data read back from storage (DB columns, etc).
 *
 * Campaign JSON columns are trusted at write time but read unconditionally
 * on every list/detail fetch — a single corrupted or truncated value must
 * not take down the whole response.
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
