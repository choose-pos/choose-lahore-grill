import { cookieKeys } from "@/constants";

// ---------------------------------------------------------------------------
// extractUTMParams
//
// Reads UTM parameters directly from a URL query string object (the output
// of useSearchParams().entries()). Returns null if none of the three standard
// UTM params are present.
//
// NOTE: This function is intentionally kept narrow — it only reads from the
// query string. The broader UTM resolution logic (query → referrer → cookies)
// lives in useAnalytics.ts in the resolveUTM() function. Do not expand this
// function to read cookies or referrer; keep the separation of concerns.
// ---------------------------------------------------------------------------
export const extractUTMParams = (query: {
  [key: string]: string;
}): {
  campaign?: string;
  medium?: string;
  source?: string;
} | null => {
  const { utm_campaign, utm_medium, utm_source } = query;
  return utm_campaign || utm_medium || utm_source
    ? {
        campaign: utm_campaign || undefined,
        medium: utm_medium || undefined,
        source: utm_source || undefined,
      }
    : null;
};

export const extractCampaignId = (query: {
  [key: string]: string;
}): string | null => {
  const { campaignId } = query;
  return campaignId ? campaignId : null;
};

// Server sets this via middleware → /visitor/init.
// Client generation is a fallback only for edge cases.
export const getOrCreateUserHash = (): string => {
  const COOKIE_NAME = cookieKeys.userHash;

  const getCookie = (name: string): string | null => {
    const cookieMatch = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`));
    return cookieMatch ? cookieMatch.split("=")[1] : null;
  };

  const existingHash = getCookie(COOKIE_NAME);
  if (existingHash) {
    return existingHash;
  }

  return crypto.randomUUID();
};
