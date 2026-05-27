"use client";

import { Env } from "@/env";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ResolveResult = {
  success?: boolean;
  alreadyPaid?: boolean;
  cancelled?: boolean;
  expired?: boolean;
  orderId?: string;
  cartId?: string;
  restaurantId?: string;
  phoneOrderId?: string;
  customerPhone?: string;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  specialRemark?: string | null;
};

type PageState =
  | "loading"
  | "redirecting"
  | "expired"
  | "otp_sent"
  | "link_regenerated"
  | "maxed_out"
  | "already_paid"
  | "cancelled"
  | "error";

const OTP_LENGTH = 6;

const PhoneOrderClient = () => {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolveData, setResolveData] = useState<ResolveResult | null>(null);

  // OTP flow state
  const [maskedPhone, setMaskedPhone] = useState<string>("");
  const [otpValues, setOtpValues] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  // Resend cooldown: seconds remaining (0 = can resend)
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Styles ────────────────────────────────────────────────────────────────
  const primaryColor = Env.NEXT_PUBLIC_PRIMARY_COLOR;
  const bgColor = Env.NEXT_PUBLIC_BACKGROUND_COLOR;
  const textColor = Env.NEXT_PUBLIC_TEXT_COLOR;
  const buttonTextColor = isContrastOkay(primaryColor, bgColor)
    ? bgColor
    : textColor;

  // ── Resend countdown ticker ───────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ── Resolve token on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setPageState("error");
      setErrorMessage("Invalid link — no token provided.");
      return;
    }

    const resolveToken = async () => {
      try {
        const response = await fetch(
          `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/api/phone-order/resolve`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            credentials: "include",
          },
        );

        if (!response.ok) throw new Error("Failed to resolve phone order link");

        const data: ResolveResult = await response.json();
        setResolveData(data);

        if (data.alreadyPaid) {
          if (data.orderId) {
            setPageState("redirecting");
            router.replace(
              `/menu/redirect/payment-status?orderId=${encodeURIComponent(data.orderId)}&phone-order=true`,
            );
            return;
          }
          setPageState("already_paid");
          return;
        }

        if (data.cancelled) {
          setPageState("cancelled");
          return;
        }
        if (data.expired) {
          setPageState("expired");
          return;
        }

        if (data.success && data.cartId && data.restaurantId) {
          sessionStorage.setItem(
            "phone_order_prefill",
            JSON.stringify({
              firstName: data.customerFirstName ?? "",
              lastName: data.customerLastName ?? "",
              email: data.customerEmail ?? "",
              phone: data.customerPhone ?? "",
              specialRemark: data.specialRemark ?? "",
              expiresAt: Date.now() + 45 * 60 * 1000,
            }),
          );
          setPageState("redirecting");
          router.replace("/menu/cart");
          return;
        }

        setPageState("error");
        setErrorMessage("Unable to process your order link. Please try again.");
      } catch (err: any) {
        setPageState("error");
        setErrorMessage(
          err?.message ||
            "Something went wrong. Please close this tab and try again.",
        );
      }
    };

    resolveToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── OTP helpers ───────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!resolveData?.phoneOrderId) return;
    setSendingOtp(true);
    setOtpError(null);
    try {
      const res = await fetch(
        `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/api/phone-order/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneOrderId: resolveData.phoneOrderId }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.error || "Failed to send OTP");
      setMaskedPhone(data.maskedPhone ?? "");
      setOtpValues(Array(OTP_LENGTH).fill(""));
      setResendCooldown(90); // start 1m30s cooldown
      setPageState("otp_sent");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setOtpError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpValues];
    next[index] = value.slice(-1);
    setOtpValues(next);
    setOtpError(null);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtpValues(next);
    setOtpError(null);
    // Focus the last filled box (or last box if all filled)
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setTimeout(() => inputRefs.current[focusIdx]?.focus(), 0);
  };

  const handleVerifyOtp = async () => {
    const otp = otpValues.join("");
    if (otp.length < OTP_LENGTH) {
      setOtpError("Please enter the full 6-digit code.");
      return;
    }
    if (!resolveData?.phoneOrderId) return;

    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await fetch(
        `${Env.NEXT_PUBLIC_SERVER_BASE_URL}/api/phone-order/customer-regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneOrderId: resolveData.phoneOrderId, otp }),
        },
      );
      const data = await res.json();
      if (data.maxedOut) {
        setPageState("maxed_out");
        return;
      }
      if (!res.ok || !data.success)
        throw new Error(data.error || "Verification failed");
      setPageState("link_regenerated");
    } catch (err: any) {
      setOtpError(err.message || "Invalid code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Spinner ───────────────────────────────────────────────────────────────
  const Spinner = () => (
    <div
      className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto"
      style={{ borderColor: primaryColor, borderTopColor: "transparent" }}
    />
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-4">
        <Spinner />
        <p className="text-lg" style={{ color: textColor }}>
          Loading your order...
        </p>
      </div>
    );
  }

  // ── Redirecting ───────────────────────────────────────────────────────────
  if (pageState === "redirecting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-4">
        <Spinner />
        <p className="text-lg" style={{ color: textColor }}>
          Preparing your order...
        </p>
      </div>
    );
  }

  // ── Already Paid ──────────────────────────────────────────────────────────
  if (pageState === "already_paid") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-4 px-6 text-center">
        <div className="text-5xl">✅</div>
        <h1
          className="text-2xl font-semibold font-subheading-oo"
          style={{ color: textColor }}
        >
          Order Already Paid
        </h1>
        <p className="text-base opacity-80" style={{ color: textColor }}>
          This phone order has already been completed. Thank you for your
          payment!
        </p>
        {resolveData?.orderId && (
          <p className="text-sm opacity-60" style={{ color: textColor }}>
            Order ID: {resolveData.orderId}
          </p>
        )}
      </div>
    );
  }

  // ── Cancelled ─────────────────────────────────────────────────────────────
  if (pageState === "cancelled") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-4 px-6 text-center">
        <div className="text-5xl">❌</div>
        <h1
          className="text-2xl font-semibold font-subheading-oo"
          style={{ color: textColor }}
        >
          Order Cancelled
        </h1>
        <p className="text-base opacity-80" style={{ color: textColor }}>
          This phone order has been cancelled by the restaurant. If you believe
          this is an error, please contact the restaurant directly.
        </p>
      </div>
    );
  }

  // ── Maxed Out ─────────────────────────────────────────────────────────────
  if (pageState === "maxed_out") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-4 px-6 text-center">
        <div className="text-5xl">🚫</div>
        <h1
          className="text-2xl font-semibold font-subheading-oo"
          style={{ color: textColor }}
        >
          Maximum Attempts Reached
        </h1>
        <p
          className="text-base opacity-80 max-w-sm"
          style={{ color: textColor }}
        >
          {`You've used all 3 link regeneration attempts. Please contact the restaurant directly and they'll create a new payment link for you.`}
        </p>
      </div>
    );
  }

  // ── Link Regenerated ──────────────────────────────────────────────────────
  if (pageState === "link_regenerated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-4 px-6 text-center">
        <div className="text-5xl">📱</div>
        <h1
          className="text-2xl font-semibold font-subheading-oo"
          style={{ color: textColor }}
        >
          New Link Sent!
        </h1>
        <p
          className="text-base opacity-80 max-w-sm"
          style={{ color: textColor }}
        >
          A fresh payment link has been sent to your phone
          {resolveData?.customerEmail ? " and email" : ""}. Check your messages
          and click the new link to complete your order.
        </p>
      </div>
    );
  }

  // ── OTP Sent ──────────────────────────────────────────────────────────────
  if (pageState === "otp_sent") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h1
              className="text-2xl font-semibold font-subheading-oo mb-2"
              style={{ color: textColor }}
            >
              Enter Verification Code
            </h1>
            <p className="text-sm opacity-70" style={{ color: textColor }}>
              We sent a 6-digit code to{" "}
              <span className="font-semibold">{maskedPhone}</span>
            </p>
          </div>

          {/* OTP input boxes */}
          <div className="flex justify-center gap-2 mb-4">
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={handleOtpPaste}
                className="w-11 h-14 text-center text-xl font-bold border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: val ? primaryColor : "#d1d5db",
                  color: textColor,
                }}
              />
            ))}
          </div>

          {otpError && (
            <p className="text-center text-sm text-red-500 mb-3">{otpError}</p>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading || otpValues.join("").length < OTP_LENGTH}
            className="w-full py-3 rounded-lg font-semibold text-base transition-opacity disabled:opacity-50"
            style={{ backgroundColor: primaryColor, color: buttonTextColor }}
          >
            {otpLoading ? "Verifying..." : "Verify & Get New Link"}
          </button>

          <button
            onClick={() => setPageState("expired")}
            className="w-full mt-3 py-2 text-sm opacity-60 hover:opacity-80 transition-opacity"
            style={{ color: textColor }}
          >
            ← Back
          </button>

          <p
            className="text-center text-xs opacity-50 mt-4"
            style={{ color: textColor }}
          >
            {`Didn't receive the code? `}
            <button
              onClick={() => {
                handleSendOtp();
              }}
              disabled={sendingOtp || resendCooldown > 0}
              className="underline disabled:opacity-40 transition-opacity"
              style={{ color: resendCooldown > 0 ? textColor : primaryColor }}
            >
              {sendingOtp
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend in ${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, "0")}`
                  : "Resend"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Expired (with "Request New Link" CTA) ─────────────────────────────────
  if (pageState === "expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-body-oo gap-5 px-6 text-center">
        <div className="text-5xl">⏰</div>
        <div>
          <h1
            className="text-2xl font-semibold font-subheading-oo mb-2"
            style={{ color: textColor }}
          >
            Your Payment Link Has Expired
          </h1>
          <p
            className="text-base opacity-70 max-w-sm"
            style={{ color: textColor }}
          >
            {`This link was only valid for 45 minutes. You can request a new one below — we'll verify it's you first.`}
          </p>
        </div>

        {otpError && <p className="text-sm text-red-500">{otpError}</p>}

        {resolveData?.phoneOrderId ? (
          <button
            onClick={handleSendOtp}
            disabled={sendingOtp}
            className="px-8 py-3 rounded-lg font-semibold text-base transition-opacity disabled:opacity-50"
            style={{ backgroundColor: primaryColor, color: buttonTextColor }}
          >
            {sendingOtp ? "Sending code..." : "Request a New Link"}
          </button>
        ) : (
          <p className="text-sm opacity-60" style={{ color: textColor }}>
            Please contact the restaurant to get a new payment link.
          </p>
        )}

        {/* {resolveData?.phoneOrderId && (
          <p className="text-xs opacity-40 mt-1" style={{ color: textColor }}>
            Ref: {resolveData.phoneOrderId}
          </p>
        )} */}
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] font-subheading-oo gap-4 px-6 text-center">
      <h2 className="text-2xl font-medium" style={{ color: textColor }}>
        Something went wrong!
      </h2>
      {errorMessage && (
        <p className="text-sm opacity-70" style={{ color: textColor }}>
          {errorMessage}
        </p>
      )}
      <button
        style={{ backgroundColor: primaryColor, color: buttonTextColor }}
        className="px-6 py-2.5 rounded-md font-medium mt-2"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );
};

export default PhoneOrderClient;
