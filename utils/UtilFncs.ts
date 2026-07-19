// errorUtils.ts

import { LoyaltyRedeemType, PriceTypeEnum } from "@/generated/graphql";
import { FetchCartDetails } from "./types";
import { Modifier, ModifierGroup } from "@/components/account/TabBar";

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

/**
 * The server appends this to every error caused by the cart changing under the
 * customer (prices moved, items removed, promo no longer qualifies) — see the
 * createOrder / createOrderWithoutPayment throws in order.service.ts. Those get
 * routed to the cart review modal instead of being shown as a payment failure.
 */
export const CART_MISMATCH_MESSAGE_SENTINEL =
  "Please review your cart before continuing with your order";

// Appended by the server to a PRICE-ONLY change error (createOrderFixed /
// createOrderWithoutPayment). Stripped for display like the mismatch sentinel.
export const PRICE_UPDATED_RETRY_SENTINEL =
  "Please review the updated total and place your order again";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isCartPriceMismatchError = (error: any): boolean =>
  extractErrorMessage(error).includes(CART_MISMATCH_MESSAGE_SENTINEL);


// Trim the server's appended "next action" instructions from an error before
// showing it, so the customer only sees the actual reason (the sync message).
export const stripCartMismatchSentinel = (message: string): string => {
  let cleaned = message;
  for (const sentinel of [
    CART_MISMATCH_MESSAGE_SENTINEL,
    PRICE_UPDATED_RETRY_SENTINEL,
  ]) {
    const idx = cleaned.indexOf(sentinel);
    if (idx !== -1) cleaned = cleaned.slice(0, idx);
  }
  return cleaned.replace(/\s+/g, " ").trim();
};

export const extractFreeDiscountItemDetails = (
  message: string,
): { name: string; price: string } | null => {
  // Regex for the first type of message: "You got Mango Smoothie worth $4.75 for free"
  const pattern1 = /^You got (.+) worth \$([\d,]+(?:\.\d{1,2})?) for free$/;

  // Regex for the second type of message: "You just redeemed a free Mango Smoothie worth 4.75$"
  const pattern2 =
    /^You just redeemed a free (.+) worth \$([\d,]+(?:\.\d{1,2})?)$/;

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
  cartDetails: FetchCartDetails | null,
  itemName?: string | null,
): boolean {
  if (!cartDetails) return false;
  const baseMatch =
    cartDetails.loyaltyRedeemPoints === points &&
    cartDetails.loyaltyType === type;
  if (!baseMatch) return false;
  if (type === LoyaltyRedeemType.Item && itemName) {
    return (cartDetails.discountString ?? "")
      .toLowerCase()
      .includes(itemName.toLowerCase());
  }
  return true;
}

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

const getOrderNestedContribution = (modifier: Modifier): number =>
  (modifier.selectedNestedGroups ?? []).reduce((acc, nmgSel) =>
    acc + nmgSel.selectedNestedModifiers.reduce(
      (t, nm) => t + nm.nestedModifierPrice * nm.qty, 0
    ), 0);

export const calculateTotalModifiersPrice = (modifierGroups: ModifierGroup[]): number => {
  return modifierGroups.reduce((total, group) => {
    return total + group.selectedModifiers.reduce((modTotal, modifier) => {
      const nestedTotal = (modifier.selectedNestedGroups ?? []).reduce(
        (nestedSum, nestedGroup) =>
          nestedSum +
          nestedGroup.selectedNestedModifiers.reduce(
            (nmSum, nm) => nmSum + nm.nestedModifierPrice * nm.qty,
            0,
          ),
        0,
      );
      return modTotal + modifier.modifierPrice * modifier.qty + nestedTotal;
    }, 0);
  }, 0);
};

export const formatGiftCardCode = (c: string) => {
  let maskedCode = c;
  const parts = c.split("-");
  if (parts.length === 2) {
    const prefix = parts[0];
    const suffix = parts[1];
    const visiblePart = suffix.substring(0, 2);
    const maskedPart = "X".repeat(suffix.length - 2);
    maskedCode = `${prefix}-${visiblePart}${maskedPart}`;
  }
  return maskedCode;
};