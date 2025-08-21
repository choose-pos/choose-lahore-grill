// errorUtils.ts

import { LoyaltyRedeemType } from "@/generated/graphql";
import { FetchCartDetails } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractErrorMessage = (error: any): string => {
  const errorJson = JSON.parse(JSON.stringify(error));
  if (
    errorJson &&
    errorJson.response &&
    errorJson.response.errors &&
    errorJson.response.errors[0].message
  ) {
    return errorJson.response.errors[0].message
      .toString()
      .replace("Error: ", "");
  } else {
    return error.toString();
  }
};

export const extractFreeDiscountItemDetails = (
  message: string
): { name: string; price: string } | null => {
  // Regex for the first type of message: "You got Mango Smoothie worth $4.75 for free"
  const pattern1 = /^You got (.+) worth \$(\d+\.\d{1,2}) for free$/;

  // Regex for the second type of message: "You just redeemed a free Mango Smoothie worth 4.75$"
  const pattern2 = /^You just redeemed a free (.+) worth \$(\d+\.\d{1,2})$/;

  let match = message.match(pattern1);
  if (match) {
    return { name: match[1], price: match[2] };
  }

  match = message.match(pattern2);
  if (match) {
    return { name: match[1], price: match[2] };
  }

  return null; // Return null if the message doesn't match any pattern
};

export const isCrawlerUserAgent = (userAgent: string) => {
  // Lowercase for consistent comparison
  const ua = userAgent.toLowerCase();

  // List of known substrings for SEO + OG bots
  const botSubstrings = [
    // Search engines
    "googlebot",
    "bingbot",
    "slurp", // Yahoo
    "yandex",
    "baiduspider",
    "duckduckbot",
    "applebot",

    // Social / link-preview
    "facebot",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "pinterestbot",
    "slackbot",
    "discordbot",
    "whatsapp",
    "telegrambot",
    "redditbot",
    "vercel",
  ];

  // Check if the user-agent contains any known bot substring
  return botSubstrings.some((bot) => ua.includes(bot));
};

export const formattedNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return cleaned;
};

export function formatUSAPhoneNumber(phoneNumber: number | string): string {
  // Convert to string and remove any non-digit characters
  const digits = phoneNumber.toString().replace(/\D/g, "");

  // Check if we have exactly 10 digits
  if (digits.length !== 10) {
    return phoneNumber.toString();
  }

  // Format as +1 (XXX)-XXX-XXXX
  const areaCode = digits.substring(0, 3);
  const prefix = digits.substring(3, 6);
  const lineNumber = digits.substring(6, 10);

  return `+1 (${areaCode})-${prefix}-${lineNumber}`;
}

export function isRewardApplied(
  points: number,
  type: LoyaltyRedeemType,
  cartDetails: FetchCartDetails | null
): boolean {
  if (!cartDetails) return false;
  return (
    cartDetails.loyaltyRedeemPoints === points &&
    cartDetails.loyaltyType === type
  );
}

export const processButtonLink = (link: string | null) => {
  if (!link) return "";

  // If it's a full URL (starts with http:// or https://), return as is
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }

  // If it starts with #, it's an anchor link - convert to full URL for external handling
  if (link.startsWith("#")) {
    console.log("Anchor link detected, converting to full URL");
    const currentOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    console.log("Current origin:", currentOrigin);
    console.log("Anchor link:", link);
    console.log("Converted link:", `${currentOrigin}${link}`);
    return `${currentOrigin}/${link}`;
  }

  // If it starts with /, it's a relative path - keep it as is
  if (link.startsWith("/")) {
    return link;
  }

  // For any other case, treat as relative path and prepend with /
  return `/${link}`;
};

export function setCookie(name: string, value: string, ttlSeconds: number) {
  const d = new Date();
  d.setTime(d.getTime() + ttlSeconds * 1000);
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/`;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}
