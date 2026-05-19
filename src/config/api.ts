/** Base URL for API v1 (override with `VITE_API_BASE_URL` in `.env`) */
export const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
    "http://65.0.31.246/api/v1";
