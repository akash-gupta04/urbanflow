/**
 * Base URL for the UrbanFlow FastAPI backend.
 * Override with NEXT_PUBLIC_API_URL (no trailing slash).
 */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://localhost:8000";
  return raw.replace(/\/$/, "");
}
