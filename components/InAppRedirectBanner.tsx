"use client";

import { useState, useEffect, useRef } from "react";
import { useInAppRedirect } from "@/hooks/useInAppRedirect";
import { X } from "lucide-react";

const DISMISS_KEY = "inapp_redirect_dismissed";
const AUTO_REDIRECT_KEY = "inapp_auto_redirected";

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
};

export function InAppRedirectBanner() {
  const {
    isInApp,
    isIOS,
    platform,
    redirectToNativeBrowser,
    copyLinkToClipboard,
  } = useInAppRedirect();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isInApp) return;
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) setVisible(true);
    } catch (_) {
      setVisible(true);
    }
  }, [isInApp]);

  // Auto-trigger redirect once when banner becomes visible.
  // Android: opens via intent URL → Chrome.
  // iOS: opens via googlechromes:// scheme → Chrome (if installed).
  // The banner stays visible as a fallback in case the redirect doesn't take.
  useEffect(() => {
    if (!visible || autoTriggeredRef.current) return;

    let alreadyTried = false;
    try {
      alreadyTried = !!sessionStorage.getItem(AUTO_REDIRECT_KEY);
    } catch (_) {}

    if (alreadyTried) {
      autoTriggeredRef.current = true;
      return;
    }

    autoTriggeredRef.current = true;
    try {
      sessionStorage.setItem(AUTO_REDIRECT_KEY, "1");
    } catch (_) {}

    // Small delay so the banner paints before the redirect attempt fires.
    const timer = setTimeout(() => {
      redirectToNativeBrowser();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const appName = platform ? platformLabels[platform] : "this app";

  const handleOpenBrowser = () => {
    setVisible(false);
    redirectToNativeBrowser();
  };

  const handleCopyLink = async () => {
    const success = await copyLinkToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch (_) {}
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-col gap-3 border-t border-white/10 bg-black/85 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md font-[system-ui,sans-serif]">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {isIOS ? (
        <>
          <div className="text-[15px] leading-relaxed text-white">
            <strong className="mb-1 block text-base pr-8">
              Open in default browser for a better experience
            </strong>
            Open in Safari or Chrome to use autofill, saved passwords, and
            complete your order faster. You can click the 3 dots on the top
            right to open the website in an external browser, or click{" "}
            <strong>&quot;Copy link&quot;</strong> below and paste it into any
            browser of your choice.
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex-1 cursor-pointer rounded-[10px] border-none bg-white px-3 py-3 text-[15px] font-semibold text-black"
            >
              {copied ? "Link copied!" : "Copy link"}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 cursor-pointer rounded-[10px] border border-white/20 bg-transparent px-4 py-3 text-[15px] text-white/60"
            >
              Stay here
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-[15px] leading-relaxed text-white">
            <strong className="mb-1 block text-base pr-8">
              Open in your browser for a better experience
            </strong>
            You&apos;re viewing this in the {appName} browser. Open in Chrome to
            use autofill, saved passwords, and complete your order faster.
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleOpenBrowser}
              className="flex-1 cursor-pointer rounded-[10px] border-none bg-white px-3 py-3 text-[15px] font-semibold text-black"
            >
              Open in browser
            </button>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 cursor-pointer rounded-[10px] border border-white/20 bg-transparent px-4 py-3 text-[15px] text-white/60"
            >
              Stay here
            </button>
          </div>
        </>
      )}
    </div>
  );
}
