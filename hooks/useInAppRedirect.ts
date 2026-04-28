"use client";

import { useEffect, useRef } from "react";

export type Platform =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "linkedin"
  | null;

export interface InAppRedirectState {
  isInApp: boolean;
  isIOS: boolean;
  platform: Platform;
  redirectToNativeBrowser: () => void;
  copyLinkToClipboard: () => Promise<boolean>;
}

function detectPlatform(ua: string): Platform {
  const u = ua.toLowerCase();
  if (u.includes("fban") || u.includes("fbav")) return "facebook";
  if (u.includes("instagram")) return "instagram";
  if (
    u.includes("bytedancewebview") ||
    u.includes("musical_ly") ||
    u.includes("tiktok")
  )
    return "tiktok";
  if (u.includes("twitterandroid") || u.includes("twitteriphone"))
    return "twitter";
  if (u.includes("linkedinapp")) return "linkedin";
  return null;
}

function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return detectPlatform(navigator.userAgent) !== null;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function buildNativeUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("utm_source_redirect", "inapp-choose");
  url.searchParams.set("redirectInApp", "true");
  return url.toString();
}

function doRedirect() {
  const targetUrl = buildNativeUrl();
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOSDevice = /iphone|ipad|ipod/i.test(ua);

  if (isAndroid) {
    const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    window.location.href = intentUrl;
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 1000);
  } else if (isIOSDevice) {
    // Attempt to open in Chrome on iOS using the Chrome URL scheme.
    // If Chrome is not installed or the in-app webview blocks the scheme,
    // the banner remains visible so the user can copy the link manually.
    const chromeUrl = targetUrl
      .replace(/^https:\/\//, "googlechromes://")
      .replace(/^http:\/\//, "googlechrome://");
    window.location.href = chromeUrl;
  } else {
    window.location.href = targetUrl;
  }
}

function fireMetaPixel() {
  try {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  } catch (_) {}
}

function fireTikTokPixel() {
  try {
    if (typeof window !== "undefined" && (window as any).ttq) {
      (window as any).ttq.track("ViewContent");
    }
  } catch (_) {}
}

const CONSENT_KEY = "inapp_redirect_consented";

export function useInAppRedirect(): InAppRedirectState {
  const firedRef = useRef(false);

  const inApp = typeof window !== "undefined" ? isInAppBrowser() : false;
  const platform =
    typeof window !== "undefined" ? detectPlatform(navigator.userAgent) : null;
  const isIOS = typeof window !== "undefined" ? detectIOS() : false;

  useEffect(() => {
    if (!inApp || firedRef.current) return;
    firedRef.current = true;

    fireMetaPixel();
    fireTikTokPixel();
  }, [inApp]);

  const redirectToNativeBrowser = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch (_) {}
    doRedirect();
  };

  const copyLinkToClipboard = async (): Promise<boolean> => {
    try {
      const url = buildNativeUrl();
      await navigator.clipboard.writeText(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  return {
    isInApp: inApp,
    isIOS,
    platform,
    redirectToNativeBrowser,
    copyLinkToClipboard,
  };
}
