const envApi = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "");
const fallbackApi =
  typeof window !== "undefined" && window.location.origin
    ? `${window.location.origin}/api/v1`
    : "/api/v1";

const normalizedApi = envApi?.endsWith("/api/v1")
  ? envApi
  : envApi
    ? `${envApi}/api/v1`
    : fallbackApi;

export const baseApiURL = normalizedApi;
