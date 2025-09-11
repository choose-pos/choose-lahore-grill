"use client";

import { Env } from "@/env";
import { extractUTMParams, getOrCreateUserHash } from "@/utils/analytics";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const TRACKING_URL = `${Env.NEXT_PUBLIC_TRACKING_URL}/track-event`; // Your server's tracking endpoint

let debounceTimer: NodeJS.Timeout | null = null;

const debounce = (callback: () => void, delay: number) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(callback, delay);
};

export const useAnalytics = (
  eventType:
    | "page_view"
    | "item_view"
    | "category_view"
    | "click"
    | "scroll" = "page_view",
  metadata?: {
    [key: string]: any;
  }
) => {
  const pathname = usePathname(); // Get the current page path
  const searchParams = useSearchParams(); // Get query parameters

  useEffect(() => {
    if (pathname.includes("/promotion/")) return;

    debounce(() => {
      const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

      const pageQuery = Object.fromEntries(searchParams.entries()); // Convert query params to an object

      const data = {
        restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
        pagePath: pathname,
        pageQuery: Object.keys(pageQuery).length > 0 ? pageQuery : null, // Include query only if present
        source: document.referrer || "direct", // Fallback to 'direct' if no referrer
        utm: extractUTMParams(pageQuery), // Extract UTM parameters from the query
        userHash, // Attach the user identifier
        eventType,
        metadata: metadata ?? null,
      };

      if (process.env.NODE_ENV === "development") {
        console.log("Analytics data:", data);
      } else {
        sendAnalyticsEvent(data);
      }
    }, 1000);
  }, [eventType, metadata, pathname, searchParams]); // Re-run when the path or query changes
};

export const useItemAnalytics = (metadata?: { [key: string]: any }) => {
  const pathname = usePathname(); // Get the current page path
  const searchParams = useSearchParams(); // Get query parameters

  useEffect(() => {
    const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

    const pageQuery = Object.fromEntries(searchParams.entries()); // Convert query params to an object

    const data = {
      restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
      pagePath: pathname,
      pageQuery: Object.keys(pageQuery).length > 0 ? pageQuery : null, // Include query only if present
      source: document.referrer || "direct", // Fallback to 'direct' if no referrer
      utm: extractUTMParams(pageQuery), // Extract UTM parameters from the query
      userHash, // Attach the user identifier
      eventType: "item_view",
      metadata: metadata ?? null,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Analytics data:", data);
    } else {
      sendAnalyticsEvent(data);
    }
  }, [metadata, pathname, searchParams]); // Re-run when the path or query changes
};

export const useCartAnalytics = (metadata?: { [key: string]: any }) => {
  const pathname = usePathname(); // Get the current page path
  const searchParams = useSearchParams(); // Get query parameters

  useEffect(() => {
    const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

    const pageQuery = Object.fromEntries(searchParams.entries()); // Convert query params to an object

    const data = {
      restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
      pagePath: pathname,
      pageQuery: Object.keys(pageQuery).length > 0 ? pageQuery : null, // Include query only if present
      source: document.referrer || "direct", // Fallback to 'direct' if no referrer
      utm: extractUTMParams(pageQuery), // Extract UTM parameters from the query
      userHash, // Attach the user identifier
      eventType: "cart_view",
      metadata: metadata ?? null,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("Analytics data:", data);
    } else {
      sendAnalyticsEvent(data);
    }
  }, [metadata, pathname, searchParams]); // Re-run when the path or query changes
};

// Send analytics data asynchronously
export const sendAnalyticsEvent = async (data: Record<string, unknown>) => {
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
