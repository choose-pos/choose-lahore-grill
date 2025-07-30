import { cookieKeys } from "@/constants";

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

export const getOrCreateUserHash = (): string => {
  const COOKIE_NAME = cookieKeys.userHash;
  const FIFTEEN_DAY_IN_SECONDS = 60 * 60 * 24 * 15;

  // Helper function to read a cookie by name
  const getCookie = (name: string): string | null => {
    const cookieMatch = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`));
    return cookieMatch ? cookieMatch.split("=")[1] : null;
  };

  // Helper function to set a cookie
  const setCookie = (name: string, value: string, maxAge: number): void => {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  };

  // Try to get the existing user hash from cookies
  const existingHash = getCookie(COOKIE_NAME);
  if (existingHash) {
    return existingHash; // Return if already exists
  }

  // Generate a new UUID as the user hash
  const newHash = crypto.randomUUID();

  // Save the new hash in a cookie
  setCookie(COOKIE_NAME, newHash, FIFTEEN_DAY_IN_SECONDS);

  return newHash;
};
