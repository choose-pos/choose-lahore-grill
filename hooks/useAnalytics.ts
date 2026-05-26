"use client";

import { Env } from "@/env";
import { extractUTMParams, getOrCreateUserHash } from "@/utils/analytics";
import { trackMetaPixelFromAnalyticsEvent } from "@/utils/metaPixel";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const TRACKING_URL = `${Env.NEXT_PUBLIC_TRACKING_URL}/track-event`;

let debounceTimer: NodeJS.Timeout | null = null;

const debounce = (callback: () => void, delay: number) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, delay);
};

// ---------------------------------------------------------------------------
// FIX 1: Parse UTM params out of a referrer URL.
//
// After the window.location.href hard navigation in cart-session/page.tsx,
// document.referrer on /menu is the full cart-session URL:
//   https://bawarchi.com/cart-session?utm_source=meta&utm_medium=promo&...
//
// extractUTMParams() only reads useSearchParams() (the live URL query), so
// it finds nothing on /menu because UTM is not in the /menu URL itself.
// This function recovers the UTM from the referrer as a second-priority source.
// ---------------------------------------------------------------------------
const extractUTMFromReferrer = (
  referrer: string,
): { campaign?: string; medium?: string; source?: string } | null => {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const source = url.searchParams.get("utm_source");
    if (!source) return null;
    return {
      source,
      medium: url.searchParams.get("utm_medium") ?? undefined,
      campaign: url.searchParams.get("utm_campaign") ?? undefined,
    };
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// FIX 2: Read UTM from the cookies set by middleware.ts.
//
// middleware.ts already sets utm_source, utm_medium, utm_campaign as 30-day
// cookies on every request that carries UTM params. These cookies survive
// ALL client-side navigation steps — /menu → /menu/cart → /menu/checkout →
// payment redirect — so they are the most reliable UTM source across the
// entire funnel.
//
// This is the final fallback and the only source that correctly attributes
// /menu/cart and /menu/checkout events back to the original campaign.
// ---------------------------------------------------------------------------
const readCookie = (name: string): string | undefined => {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : undefined;
};

const readUTMFromCookies = (): {
  campaign?: string;
  medium?: string;
  source?: string;
} | null => {
  const source = readCookie("utm_source");
  if (!source) return null;

  return {
    source,
    medium: readCookie("utm_medium"),
    campaign: readCookie("utm_campaign"),
  };
};

// resolveSource — the value sent to tracking as `source` (becomes pageSources[0]).
//
// Hard navigation through /cart-session clobbers document.referrer with the
// internal cart-session URL, so the original external entry (Instagram, Meta,
// Google, etc.) is lost on every page after the landing. middleware.ts persists
// the first external referrer in the `entry_source` cookie. Here we prefer
// document.referrer when it is external, and fall back to the cookie otherwise.
const resolveSource = (): string => {
  const referrer = typeof document !== "undefined" ? document.referrer : "";
  const refIsExternal = (() => {
    if (!referrer) return false;
    try {
      return new URL(referrer).hostname !== window.location.hostname;
    } catch {
      return false;
    }
  })();

  if (refIsExternal) return referrer;
  return readCookie("entry_source") || referrer || "direct";
};

// ---------------------------------------------------------------------------
// resolveUTM — three-tier priority chain:
//
//   1. URL query string  →  works when UTM is directly in the page URL
//                           (direct links, GMB links, first load after redirect)
//
//   2. Referrer URL      →  works on /menu immediately after the cart-session
//                           hard navigation, where document.referrer contains
//                           the full cart-session?utm_source=... URL
//
//   3. Cookies           →  works on ALL subsequent pages (/menu/cart,
//                           /menu/checkout, payment redirect) where referrer
//                           has already shifted to an internal page and the
//                           URL has no UTM params
//
// The chain stops at the first non-null result, so URL query always wins
// when present (correct for direct attribution), but cookies act as the
// persistent safety net across the entire session funnel.
// ---------------------------------------------------------------------------
export const resolveUTM = (
  pageQuery: Record<string, string>,
): { campaign?: string; medium?: string; source?: string } | null => {
  return (
    extractUTMParams(pageQuery) ??
    extractUTMFromReferrer(document.referrer) ??
    readUTMFromCookies()
  );
};

export const useAnalytics = (
  eventType:
    | "page_view"
    | "item_view"
    | "category_view"
    | "add_to_cart"
    | "click"
    | "popup_view"
    | "popup_close"
    | "popup_cta_click"
    | "scroll"
    | "cart_visited"
    | "checkout_started" = "page_view",

  metadata?: {
    [key: string]: any;
  },
) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Stringify so the effect dep is a stable primitive — avoids the debounce
  // timer being reset on every render due to a new searchParams reference.
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (pathname.includes("/promotion/")) return;

    // Skip analytics for bots and headless browsers (e.g. social preview renderers,
    // headless Chrome used by screenshot services).
    const ua = navigator.userAgent.toLowerCase();
    const botPatterns = [
      "googlebot",
      "bingbot",
      "slurp",
      "yandex",
      "baiduspider",
      "duckduckbot",
      "applebot",
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
      "headlesschrome",
      "phantomjs",
      "puppeteer",
      "playwright",
    ];
    if (botPatterns.some((bot) => ua.includes(bot))) return;

    debounce(() => {
      const userHash = getOrCreateUserHash();
      const pageQuery = Object.fromEntries(
        new URLSearchParams(searchParamsString).entries(),
      );

      const data = {
        restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
        pagePath: pathname,
        pageQuery: Object.keys(pageQuery).length > 0 ? pageQuery : null,
        // Prefer external document.referrer, fall back to entry_source cookie
        // so pageSources keeps the original Instagram/Meta/Google entry across
        // the cart-session hard navigation.
        source: resolveSource(),
        // FIX: use the three-tier resolver instead of extractUTMParams alone
        utm: resolveUTM(pageQuery),
        userHash,
        eventType,
        metadata: metadata ?? null,
      };

      sendAnalyticsEvent(data);
      // if (process.env.NODE_ENV === "development") {
      //   // FIX 3: original code called sendAnalyticsEvent(data) twice in
      //   // production — once before the if/else block and once inside the
      //   // else branch. Removed the duplicate call.
      //   console.log("Analytics data:", data);
      // } else {
      //   sendAnalyticsEvent(data);
      // }
    }, 1000);
  }, [eventType, metadata, pathname, searchParamsString]);
};

export const sendAnalyticsEvent = async (data: Record<string, unknown>) => {
  trackMetaPixelFromAnalyticsEvent(data);

  try {
    await fetch(TRACKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Failed to send analytics event:", error);
  }
};
