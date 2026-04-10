"use client";

import { Env } from "@/env";
import ToastStore from "@/store/toast";
import meCustomerStore from "@/store/meCustomer";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { isContrastOkay } from "@/utils/isContrastOkay";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import { GiftCardDesign } from "@/generated/graphql";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { DatePicker } from "@/components/ui/date-picker";
import StarIcon from "@/components/common/StarIcon";
import { useSidebarStore } from "@/store/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/utils/motion";
import GiftCardPaymentStatus from "./GiftCardPaymentStatus";
import CustomerVerification from "@/components/checkout/CustomerVerification";
import useGiftCardStore from "@/store/giftCard";

const PRESET_AMOUNTS = [25, 75, 150];

interface GiftCardFormData {
  design: GiftCardDesign;
  amount: string;
  isCustomAmount: boolean;
  senderFirstName: string;
  senderLastName: string;
  senderEmail: string;
  senderPhone: string;
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;
  recipientPhone: string;
  sendToSelf: boolean;
  note: string;
  deliveryTiming: "now" | "later";
  scheduledSendAt: string;
}

const initialFormData: GiftCardFormData = {
  design: GiftCardDesign.GiftCard,
  amount: "75",
  isCustomAmount: false,
  senderFirstName: "",
  senderLastName: "",
  senderEmail: "",
  senderPhone: "",
  recipientFirstName: "",
  recipientLastName: "",
  recipientEmail: "",
  recipientPhone: "",
  sendToSelf: true,
  note: "",
  deliveryTiming: "now",
  scheduledSendAt: "",
};

const primaryColor = Env.NEXT_PUBLIC_PRIMARY_COLOR;
const bgColor = Env.NEXT_PUBLIC_BACKGROUND_COLOR;
const textColor = Env.NEXT_PUBLIC_TEXT_COLOR;
const btnTextColor = isContrastOkay(primaryColor, bgColor)
  ? bgColor
  : textColor;

interface GiftCardPurchasePageProps {
  stripeId?: string;
  processingConfig: {
    feePercent: number | null;
    maxFeeAmount: number | null;
  } | null;
  isAccountView?: boolean;
  loyaltyRule?: any;
  serverIsLoggedIn?: boolean;
}

function calcGiftCardFees(
  faceValue: number,
  processingConfig: GiftCardPurchasePageProps["processingConfig"],
) {
  const feePercent = processingConfig?.feePercent ?? 0;
  const maxFeeAmount = processingConfig?.maxFeeAmount ?? null;
  let platformFeeAmt = parseFloat(((feePercent / 100) * faceValue).toFixed(2));
  if (maxFeeAmount != null && platformFeeAmt > maxFeeAmount)
    platformFeeAmt = maxFeeAmount;
  return {
    platformFeeAmt,
    total: parseFloat((faceValue + platformFeeAmt).toFixed(2)),
  };
}

type FieldErrors = Partial<Record<keyof GiftCardFormData, string>>;

/** Input field styled to match CustomerVerification component */
function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  disabled,
}: {
  label?: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="block text-sm font-body-oo font-semibold text-gray-700 capitalize">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full font-body-oo border rounded-md shadow-sm py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-[15px] transition-colors ${
          disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"
        } ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && <p className="text-red-500 text-xs font-body-oo">{error}</p>}
    </div>
  );
}

/** Section heading used throughout the form */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-md font-body-oo font-semibold text-gray-800 capitalize mb-3.5 tracking-wide">
      {children}
    </p>
  );
}

/** Card wrapper for right-column sections */
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-gray-200 rounded-xl bg-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.06)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function GiftCardPurchasePageInner({
  processingConfig,
  isAccountView,
  loyaltyRule,
  serverIsLoggedIn,
}: Omit<GiftCardPurchasePageProps, "stripeId">) {
  const { setToastData } = ToastStore();
  const { meCustomerData } = meCustomerStore();
  const { setSignInOpen, setIsSignUpOpen, setRedirectAfterAuth } =
    useSidebarStore();
  const {
    paymentIntentId: storePaymentIntentId,
    paymentIntentClientSecret: storePaymentIntentClientSecret,
    isFromMenu,
    setPaymentIntent,
    clearPaymentIntent,
  } = useGiftCardStore();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const pathname = usePathname();

  const [formData, setFormData] = useState<GiftCardFormData>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [isNoteExpanded, setIsNoteExpanded] = useState(
    !initialFormData.sendToSelf,
  );
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);

  const [showFromModal, setShowFromModal] = useState(false);
  const [showPaymentStatus, setShowPaymentStatus] = useState(
    !!(storePaymentIntentId && storePaymentIntentClientSecret),
  );

  // Verified sender data from CustomerVerification (used when not logged in)
  const [verifiedSender, setVerifiedSender] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    otp: string;
    customerId?: string | null;
  } | null>(null);
  const [guestModalOtpVerified, setGuestModalOtpVerified] = useState(false);
  const setPlaceOrderError = useCallback(() => {}, []) as React.Dispatch<
    React.SetStateAction<string | undefined>
  >;

  const isLoggedIn = !!meCustomerData || !!serverIsLoggedIn;

  // If serverIsLoggedIn but store not hydrated yet, fetch and populate store
  const { setMeCustomerData } = meCustomerStore();
  useEffect(() => {
    if (serverIsLoggedIn && !meCustomerData) {
      fetchWithAuth(() => sdk.meCustomer())
        .then((res) => {
          if (res.meCustomer) setMeCustomerData(res.meCustomer);
        })
        .catch(() => {});
    }
  }, [serverIsLoggedIn]);

  const faceValue = parseFloat(formData.amount || "0");
  const fees =
    !isNaN(faceValue) && faceValue > 0
      ? calcGiftCardFees(faceValue, processingConfig)
      : null;

  // Scroll to top when payment status view is shown
  useEffect(() => {
    if (showPaymentStatus) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showPaymentStatus]);

  const updateField = (
    field: keyof GiftCardFormData,
    value: string | boolean,
  ) => {
    let customError: string | null = null;
    if (field === "amount" && typeof value === "string") {
      const parsedAmt = parseFloat(value);
      if (parsedAmt > 200) {
        customError = "eGift card amount must be less than $200";
      } else if (parsedAmt < 10) {
        customError = "eGift card amount must be at least $10";
      }
    }

    if (field === "deliveryTiming" && value === "now") {
      setFormData((prev) => ({
        ...prev,
        deliveryTiming: "now",
        scheduledSendAt: "",
      }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n.scheduledSendAt;
        return n;
      });
      return;
    }

    if (field === "sendToSelf") {
      setIsNoteExpanded(value === false);
      setFormData((prev) => ({
        ...prev,
        sendToSelf: value as boolean,
        recipientFirstName: "",
        recipientLastName: "",
        recipientEmail: "",
        recipientPhone: "",
        note: "",
        deliveryTiming: "now",
        scheduledSendAt: "",
      }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n.recipientFirstName;
        delete n.recipientLastName;
        delete n.recipientEmail;
        delete n.recipientPhone;
        delete n.scheduledSendAt;
        return n;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (customError) {
      setErrors((prev) => ({ ...prev, [field]: customError }));
    } else if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount < 10)
      newErrors.amount = "Minimum amount is $10";
    else if (amount > 200) newErrors.amount = "Maximum custom amount is $200";
    if (!isLoggedIn && !verifiedSender) {
      if (!formData.senderFirstName.trim())
        newErrors.senderFirstName = "Required";
      if (!formData.senderLastName.trim())
        newErrors.senderLastName = "Required";
      if (
        !formData.senderEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)
      )
        newErrors.senderEmail = "Valid email required";
      if (!formData.senderPhone || formData.senderPhone.length !== 10)
        newErrors.senderPhone = "Valid 10-digit phone required";
    }
    if (!formData.sendToSelf) {
      if (!formData.recipientFirstName.trim())
        newErrors.recipientFirstName = "Required";
      if (!formData.recipientLastName.trim())
        newErrors.recipientLastName = "Required";
      if (
        !formData.recipientEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)
      )
        newErrors.recipientEmail = "Valid email required";
      if (!formData.recipientPhone || formData.recipientPhone.length !== 10)
        newErrors.recipientPhone = "Valid 10-digit phone required";
    }
    if (formData.deliveryTiming === "later") {
      if (!formData.scheduledSendAt) {
        newErrors.scheduledSendAt = "Required";
      } else {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (formData.scheduledSendAt < todayStr) {
          newErrors.scheduledSendAt = "Please select a future date";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInline = (): boolean => {
    const newErrors: FieldErrors = {};
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount < 10)
      newErrors.amount = "Minimum amount is $10";
    else if (amount > 200) newErrors.amount = "Maximum custom amount is $200";
    if (!formData.sendToSelf) {
      if (!formData.recipientFirstName.trim())
        newErrors.recipientFirstName = "Required";
      if (!formData.recipientLastName.trim())
        newErrors.recipientLastName = "Required";
      if (
        !formData.recipientEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)
      )
        newErrors.recipientEmail = "Valid email required";
      if (!formData.recipientPhone || formData.recipientPhone.length !== 10)
        newErrors.recipientPhone = "Valid 10-digit phone required";
    }
    if (!formData.sendToSelf && formData.deliveryTiming === "later") {
      if (!formData.scheduledSendAt) {
        newErrors.scheduledSendAt = "Required";
      } else {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (formData.scheduledSendAt < todayStr) {
          newErrors.scheduledSendAt = "Please select a future date";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = async () => {
    if (!validateInline()) return;

    // Validate stripe fields before proceeding
    if (!stripe || !elements) return;
    setLoading(true);
    const { error: submitError } = await elements.submit();
    setLoading(false);
    if (submitError) {
      setToastData({
        type: "error",
        message:
          submitError.message ??
          "Please complete all payment details correctly",
      });
      return;
    }

    if (isLoggedIn) {
      handlePurchase();
    } else {
      setVerifiedSender(null);
      setGuestModalOtpVerified(false);
      setFormData((prev) => ({
        ...prev,
        senderFirstName: "",
        senderLastName: "",
        senderEmail: "",
        senderPhone: "",
      }));
      setShowFromModal(true);
    }
  };

  const handleCloseFromModal = () => {
    setShowFromModal(false);
    setGuestModalOtpVerified(false);
    setVerifiedSender(null);

    // Clear out guest sender data
    setFormData((prev) => ({
      ...prev,
      senderFirstName: "",
      senderLastName: "",
      senderEmail: "",
      senderPhone: "",
    }));
  };

  const handlePurchase = async () => {
    if (!validate()) return;

    if (!isLoggedIn && !guestModalOtpVerified) {
      setToastData({
        type: "error",
        message: "Please verify your email before purchasing",
      });
      return;
    }

    if (!stripe || !elements) return;

    setLoading(true);
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setToastData({
        type: "error",
        message: submitError.message ?? "Error validating payment",
      });
      setLoading(false);
      return;
    }

    try {
      const senderFirst = isLoggedIn
        ? (meCustomerData?.firstName ?? "")
        : (verifiedSender?.firstName ?? formData.senderFirstName.trim());
      const senderLast = isLoggedIn
        ? (meCustomerData?.lastName ?? "")
        : (verifiedSender?.lastName ?? formData.senderLastName.trim());
      const senderEmail = isLoggedIn
        ? (meCustomerData?.email ?? "")
        : (verifiedSender?.email ?? formData.senderEmail.trim());
      const senderPhone = isLoggedIn
        ? (meCustomerData?.phone ?? "")
        : (verifiedSender?.phone ?? formData.senderPhone.trim());
      const senderOtpValue = isLoggedIn ? undefined : verifiedSender?.otp;

      const giftCardInput = {
        amount: parseFloat(formData.amount),
        design: formData.design,
        senderFirstName: senderFirst,
        senderLastName: senderLast,
        senderEmail: senderEmail,
        senderPhone: senderPhone,
        senderOtp: isLoggedIn ? undefined : senderOtpValue,
        recipientFirstName: formData.sendToSelf
          ? (senderFirst ?? "")
          : formData.recipientFirstName.trim(),
        recipientLastName: formData.sendToSelf
          ? (senderLast ?? "")
          : formData.recipientLastName.trim(),
        recipientEmail: formData.sendToSelf
          ? (senderEmail ?? "")
          : formData.recipientEmail.trim(),
        recipientPhone: formData.sendToSelf
          ? (senderPhone ?? "")
          : formData.recipientPhone.trim() || undefined,
        sendToSelf: formData.sendToSelf,
        note: formData.note.trim() || undefined,
        scheduledSendAt:
          formData.deliveryTiming === "later" && formData.scheduledSendAt
            ? new Date(formData.scheduledSendAt).toISOString()
            : undefined,
      };

      const res = await fetchWithAuth(() =>
        sdk.CreateGiftCardPurchaseIntent({
          input: giftCardInput,
        }),
      );

      const { clientSecret } = res.createGiftCardPurchaseIntent;

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/gift-cards`,
        },
        redirect: "if_required",
      });
      if (error) {
        setToastData({
          type: "error",
          message: error.message ?? "Payment failed. Please try again.",
        });
        setLoading(false);
        return;
      }

      setPaymentIntent(
        res.createGiftCardPurchaseIntent.paymentIntentId,
        clientSecret,
        isAccountView ?? false,
      );

      if (isLoggedIn && isAccountView) {
        router.push("/gift-cards");
      } else {
        setShowPaymentStatus(true);
      }
    } catch (err) {
      setToastData({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  // Show payment status if payment was completed
  if (showPaymentStatus) {
    return (
      <GiftCardPaymentStatus
        paymentIntentId={storePaymentIntentId}
        paymentIntentClientSecret={storePaymentIntentClientSecret}
        isFromMenu={isFromMenu}
        onBack={() => {
          clearPaymentIntent();
          setShowPaymentStatus(false);
          setFormData(initialFormData);
          setErrors({});
          setShowFromModal(false);
          setVerifiedSender(null);
          setGuestModalOtpVerified(false);

          if (isFromMenu) {
            router.push("/menu");
          }
        }}
      />
    );
  }

  const renderPersonalNote = (wrapperClass = "") => (
    <SectionCard className={`transition-all duration-300 ${wrapperClass}`}>
      <div
        className={`flex items-center justify-between cursor-pointer ${
          isNoteExpanded ? "mb-3" : ""
        }`}
        onClick={() => setIsNoteExpanded(!isNoteExpanded)}
      >
        <p className="text-[15px] font-body-oo font-semibold text-gray-800 capitalize tracking-wide leading-none">
          Personal Note{" "}
          <span className="font-normal text-gray-400 normal-case text-xs">
            (optional)
          </span>
        </p>
        <FiChevronDown
          className={`text-gray-400 transition-transform duration-300 ${
            isNoteExpanded ? "rotate-180" : ""
          }`}
          size={20}
        />
      </div>
      <AnimatePresence>
        {isNoteExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <textarea
              placeholder="Write a short message..."
              value={formData.note}
              onChange={(e) => updateField("note", e.target.value)}
              maxLength={250}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-md font-body-oo text-base sm:text-sm focus:outline-none focus:border-gray-400 resize-none h-24 bg-gray-50 placeholder:text-gray-400 transition-colors"
            />
            <p className="text-[12px] text-gray-400 font-body-oo text-right mt-1.5">
              {formData.note.length}/250
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );

  return (
    <div
      className={
        isAccountView
          ? "py-4 sm:py-0 -mt-10 lg:px-12 xl:px-20 max-w-full"
          : "max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 py-24"
      }
    >
      {!pathname.includes("my-account") ? (
        <div className={isAccountView ? "mb-6 w-full" : "mb-10 w-full"}>
          <h1
            className={
              isAccountView
                ? "text-3xl font-secondary text-bg1 leading-tight"
                : "text-4xl font-secondary text-bg1 leading-tight"
            }
          >
            {/* Give the Perfect Gift */}
            Treat someone with a gift
          </h1>
          <p className="mt-3 text-bg1/60 font-primary text-base">
            Share a delicious experience with someone you love.
          </p>
        </div>
      ) : (
        <div className="pt-8"></div>
      )}
      <div
        className={`grid grid-cols-1 ${
          isAccountView
            ? "xl:grid-cols-[1fr_380px] gap-6"
            : "xl:grid-cols-[1fr_440px] gap-10 xl:gap-16"
        }`}
      >
        {/* ════════════════════════════════════
            LEFT COLUMN — Amount + Stay in Touch
        ════════════════════════════════════ */}
        <div className="space-y-6">
          {/* ── Gift Card Amount ─────────────────── */}
          <SectionCard>
            <SectionHeading>Gift Card Amount</SectionHeading>
            <div className="grid grid-cols-4 gap-1 sm:gap-2 lg:gap-3 mb-3 pb-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected =
                  !formData.isCustomAmount && formData.amount === String(amt);
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      updateField("amount", String(amt));
                      updateField("isCustomAmount", false);
                    }}
                    className="w-full min-w-0 overflow-hidden py-2 sm:py-2.5 px-0 rounded-lg font-body-oo  text-base sm:text-base lg:text-[15px] font-medium border transition-all duration-150"
                    style={
                      isSelected
                        ? {
                            backgroundColor: primaryColor,
                            color: btnTextColor,
                            borderColor: primaryColor,
                          }
                        : {
                            backgroundColor: "transparent",
                            color: primaryColor,
                            borderColor: `${primaryColor}30`,
                          }
                    }
                  >
                    ${amt}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    isCustomAmount: true,
                    amount: "",
                  }))
                }
                className="w-full min-w-0 overflow-hidden py-2 sm:py-2.5 px-0 rounded-lg font-body-oo text-base sm:text-base lg:text-[15px] font-medium border transition-all duration-150"
                style={
                  formData.isCustomAmount
                    ? {
                        backgroundColor: primaryColor,
                        color: btnTextColor,
                        borderColor: primaryColor,
                      }
                    : {
                        backgroundColor: "transparent",
                        color: primaryColor,
                        borderColor: `${primaryColor}30`,
                      }
                }
              >
                Custom
              </button>
            </div>
            {formData.isCustomAmount && (
              <>
                <div className="relative max-w-xs mt-3">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-body-oo text-gray-500 text-[15px] pointer-events-none">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => {
                      let val = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = val.split(".");
                      if (parts.length > 2) {
                        val = parts[0] + "." + parts.slice(1).join("");
                      }
                      const finalParts = val.split(".");
                      if (finalParts.length === 2 && finalParts[1].length > 2) {
                        val = finalParts[0] + "." + finalParts[1].slice(0, 2);
                      }
                      updateField("amount", val);
                    }}
                    className={`mt-1 block w-full font-body-oo border rounded-lg shadow-sm py-2.5 pl-8 pr-3.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-[15px] ${
                      errors.amount ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                </div>
                {!errors.amount && (
                  <p className="text-gray-500 text-[13px] font-body-oo mt-2">
                    eGift card amount should be between $10 and $200.
                  </p>
                )}
              </>
            )}
            {errors.amount && (
              <p className="text-red-500 text-[13px] font-body-oo mt-2">
                {errors.amount}
              </p>
            )}
          </SectionCard>

          {/* ── Personal Note ────────────────────── */}
          {!formData.sendToSelf && renderPersonalNote("hidden xl:block")}

          {/* ── Stay in Touch (guest only) ────────── */}
          {!isLoggedIn && loyaltyRule && (
            <SectionCard className="!p-0 overflow-hidden">
              <div className="p-5 pb-0">
                <SectionHeading>Stay in Touch</SectionHeading>
              </div>
              <div className="flex flex-col gap-3 px-5 py-3">
                <div className="flex items-start gap-2">
                  <StarIcon
                    size={18}
                    className="mt-[1px] text-[#344054] flex-shrink-0"
                  />
                  <p className="text-[14px] leading-snug font-medium font-body-oo text-[#344054]">
                    Already a member? Sign In and earn{" "}
                    {Math.round(faceValue) * 10} {loyaltyRule?.name} on this
                    purchase.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <StarIcon
                    size={18}
                    className="mt-[1px] text-[#344054] flex-shrink-0"
                  />
                  <p className="text-[14px] leading-snug font-medium font-body-oo text-[#344054]">
                    Not a member? Sign Up and earn{" "}
                    {loyaltyRule.signUpValue ?? 0} {loyaltyRule?.name}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex">
                <div
                  className="flex-1 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center rounded-bl-xl border-r border-gray-200"
                  onClick={() => {
                    setRedirectAfterAuth("/menu/my-account?tab=giftcards");
                    setSignInOpen(true);
                    router.push("/menu");
                  }}
                >
                  <p className="text-[14px] font-subheading-oo font-bold text-[#344054]">
                    Sign in
                  </p>
                </div>
                <div
                  className="flex-1 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-br-xl transition-colors flex items-center justify-center"
                  onClick={() => {
                    setRedirectAfterAuth("/menu/my-account?tab=giftcards");
                    setSignInOpen(true);
                    setIsSignUpOpen(true);
                    router.push("/menu");
                  }}
                >
                  <p className="text-[14px] font-subheading-oo font-bold text-[#344054]">
                    Sign up
                  </p>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ════════════════════════════════════
            RIGHT COLUMN — From, To, When, Pay
        ════════════════════════════════════ */}
        <div className="relative">
          <div className="xl:sticky xl:top-28 space-y-5">
            {/* ── For Yourself or as a Gift? ───────── */}
            <div>
              <div className="grid grid-cols-2 gap-3">
                {/* For Myself card */}
                <button
                  type="button"
                  onClick={() => updateField("sendToSelf", true)}
                  className="relative text-left px-4 py-3 rounded-md border  focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-150 bg-white flex items-center gap-3"
                  style={
                    formData.sendToSelf
                      ? {
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }
                      : { borderColor: "#e5e7eb" }
                  }
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <circle cx="12" cy="11" r="2" />
                      <path d="M8 18c0-2.2 1.8-4 4-4s4 1.8 4 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body-oo font-semibold text-md text-gray-800 leading-tight">
                      For Myself
                    </p>
                    <p className="font-body-oo text-[11px] text-gray-600 leading-snug mt-0.5">
                      Receive via email
                    </p>
                  </div>
                </button>

                {/* Buy as a Gift card */}
                <button
                  type="button"
                  onClick={() => updateField("sendToSelf", false)}
                  className="relative text-left px-4 py-3 rounded-md border  focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-150 bg-white flex items-center gap-3"
                  style={
                    !formData.sendToSelf
                      ? {
                          borderColor: primaryColor,
                          boxShadow: `0 0 0 1px ${primaryColor}`,
                        }
                      : { borderColor: "#e5e7eb" }
                  }
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 12 20 22 4 22 4 12" />
                      <rect x="2" y="7" width="20" height="5" />
                      <line x1="12" y1="22" x2="12" y2="7" />
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body-oo font-semibold text-md text-gray-800 leading-tight">
                      Buy as a Gift
                    </p>
                    <p className="font-body-oo text-[11px] text-gray-600 leading-snug mt-0.5">
                      Send as a Gift
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* ── To — only shown when Buy as a Gift ── */}
            {!formData.sendToSelf && (
              <SectionCard>
                <div className="mb-3.5">
                  <SectionHeading>Recipient Details</SectionHeading>
                  <p className="text-sm font-body-oo  text-gray-600 ">
                    The gift card will be sent to this email and phone number.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="First Name"
                      placeholder="Alex"
                      value={formData.recipientFirstName}
                      onChange={(v) => updateField("recipientFirstName", v)}
                      error={errors.recipientFirstName}
                      required
                    />
                    <InputField
                      label="Last Name"
                      placeholder="D"
                      value={formData.recipientLastName}
                      onChange={(v) => updateField("recipientLastName", v)}
                      error={errors.recipientLastName}
                      required
                    />
                  </div>
                  <InputField
                    label="Email"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.recipientEmail}
                    onChange={(v) => updateField("recipientEmail", v)}
                    error={errors.recipientEmail}
                    required
                  />
                  <InputField
                    label="Phone"
                    type="tel"
                    placeholder="800-555-0175"
                    value={formData.recipientPhone}
                    onChange={(v) =>
                      updateField(
                        "recipientPhone",
                        v.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    error={errors.recipientPhone}
                    required
                  />
                </div>
              </SectionCard>
            )}

            {/* ── Personal Note (Mobile only) ─────── */}
            {!formData.sendToSelf && renderPersonalNote("xl:hidden")}

            {/* ── When Should We Send — hidden when For Myself ── */}
            {!formData.sendToSelf && (
              <SectionCard className="transition-all duration-300">
                <div
                  className={`flex items-center justify-between cursor-pointer ${
                    isDeliveryExpanded ? "mb-4" : ""
                  }`}
                  onClick={() => setIsDeliveryExpanded(!isDeliveryExpanded)}
                >
                  <p className="text-[15px] font-body-oo font-semibold text-gray-800 capitalize tracking-wide leading-none">
                    When Should We Send It?{" "}
                    {formData.deliveryTiming === "now" && (
                      <span className=" text-gray-500 font-normal normal-case">
                        (Now)
                      </span>
                    )}
                    {formData.deliveryTiming === "later" && (
                      <span className=" text-gray-500 font-normal normal-case">
                        (Schedule for later)
                      </span>
                    )}
                  </p>
                  <FiChevronDown
                    className={`text-gray-400 transition-transform duration-300 ${
                      isDeliveryExpanded ? "rotate-180" : ""
                    }`}
                    size={20}
                  />
                </div>
                <AnimatePresence>
                  {isDeliveryExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-8">
                        {[
                          { label: "Now", value: "now" },
                          { label: "Schedule for later", value: "later" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <div className="relative flex-shrink-0 w-5 h-5 cursor-pointer">
                              <input
                                type="radio"
                                name="deliveryTiming"
                                value={option.value}
                                checked={
                                  formData.deliveryTiming === option.value
                                }
                                onChange={() =>
                                  updateField("deliveryTiming", option.value)
                                }
                                className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200 pointer-events-none ${
                                  formData.deliveryTiming === option.value
                                    ? "border-primary"
                                    : "border-gray-300 peer-hover:border-gray-400"
                                }`}
                                style={{
                                  borderWidth: "1.5px",
                                  borderColor:
                                    formData.deliveryTiming === option.value
                                      ? primaryColor
                                      : undefined,
                                }}
                              >
                                <div
                                  className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 ${
                                    formData.deliveryTiming === option.value
                                      ? "scale-100"
                                      : "scale-0"
                                  }`}
                                  style={{
                                    backgroundColor: primaryColor,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="font-body-oo text-[15px] font-medium text-gray-700 leading-none">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {formData.deliveryTiming === "later" && (
                        <div className="w-full pt-2">
                          <DatePicker
                            selectedDate={
                              formData.scheduledSendAt
                                ? new Date(formData.scheduledSendAt)
                                : null
                            }
                            setDateFn={(date) => {
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1,
                              ).padStart(2, "0");
                              const day = String(date.getDate()).padStart(
                                2,
                                "0",
                              );
                              updateField(
                                "scheduledSendAt",
                                `${year}-${month}-${day}`,
                              );
                            }}
                            startYear={new Date().getFullYear()}
                            endYear={new Date(
                              new Date().setMonth(new Date().getMonth() + 3),
                            ).getFullYear()}
                            disabledDates={{
                              before: new Date(
                                new Date().setDate(new Date().getDate() + 1)
                              ),
                              after: new Date(
                                new Date().setMonth(new Date().getMonth() + 3)
                              ),
                            }}
                          />
                          {formData.scheduledSendAt && !errors.scheduledSendAt && (
                            <p className="text-gray-600 text-[13px] font-body-oo mt-2">
                              eGift card will be delivered on{" "}
                              {new Intl.DateTimeFormat('en-US', {
                                day: 'numeric',
                                month: 'long'
                              }).format(new Date(formData.scheduledSendAt))}{" "}
                              at 12 am
                            </p>
                          )}
                          {errors.scheduledSendAt && (
                            <p className="text-red-500 text-[13px] font-body-oo mt-1.5">
                              {errors.scheduledSendAt}
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </SectionCard>
            )}

            {/* ── Payment Breakdown + Pay Now ───────── */}
            <SectionCard className="!p-0 overflow-hidden">
              <div className="p-5 space-y-2.5">
                <SectionHeading>Payment Breakdown</SectionHeading>
                <div className="flex justify-between text-[15px] font-body-oo text-gray-600">
                  <span>Gift Card Value</span>
                  <span>${faceValue > 0 ? faceValue.toFixed(2) : "0.00"}</span>
                </div>
                {fees && fees.platformFeeAmt > 0 && (
                  <div className="flex justify-between text-[15px] font-body-oo text-gray-600">
                    <span>Fees</span>
                    <span>${fees.platformFeeAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] font-body-oo font-bold text-gray-800 pt-2.5 border-t border-gray-100">
                  <span>Total</span>
                  <span>
                    $
                    {fees
                      ? fees.total.toFixed(2)
                      : faceValue > 0
                        ? faceValue.toFixed(2)
                        : "0.00"}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 p-5 space-y-3">
                <PaymentElement />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={!stripe || !elements || (isLoggedIn && loading)}
                    className="w-full py-3 rounded-lg font-body-oo font-semibold text-[15px] transition-opacity hover:opacity-85 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: primaryColor,
                      color: btnTextColor,
                    }}
                  >
                    {isLoggedIn && loading && (
                      <AiOutlineLoading3Quarters
                        className="animate-spin"
                        size={15}
                      />
                    )}
                    {isLoggedIn && loading ? "Processing..." : "Pay Now"}
                  </button>
                  {Object.keys(errors).length > 0 && (
                    <p className="text-red-500 text-sm font-body-oo text-left">
                      Please enter all the details to continue with the order.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Guest Details Bottom Sheet / Modal */}
      <AnimatePresence>
        {showFromModal && !isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4"
            onClick={handleCloseFromModal}
          >
            <motion.div
              variants={fadeIn("up", "tween", 0, 0.25)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white w-full sm:max-w-xl rounded-t-md sm:rounded-md max-h-[90vh] overflow-y-auto shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b shrink-0">
                <h2 className="font-subheading-oo font-semibold text-xl capitalize">
                  Guest Details
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloseFromModal}
                    className="hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                    aria-label="Close modal"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 pb-6 sm:pb-6 pt-4 overflow-y-auto">
                <CustomerVerification
                  hideHeading
                  verifyMode="giftcard"
                  isOtpVerified={guestModalOtpVerified}
                  setIsOtpVerified={setGuestModalOtpVerified}
                  setPlaceOrderError={setPlaceOrderError}
                  amounts={null}
                  loyaltyRule={loyaltyRule ?? null}
                  refreshData={() => {}}
                  onVerified={(data) => {
                    setVerifiedSender(data);
                    setErrors({});
                  }}
                  onProceedBtn={handlePurchase}
                  proceedLoading={loading}
                  proceedBtnText="Pay Now"
                  afterVerifiedContent={
                    verifiedSender?.customerId &&
                    loyaltyRule &&
                    faceValue > 0 ? (
                      <div className="rounded-lg p-3 mb-3 bg-green-50 border border-green-200">
                        <p className="text-[13px] text-green-800 font-body-oo">
                          Great news! We&apos;ve found an existing account for{" "}
                          {verifiedSender.phone}, we will credit{" "}
                          <span className="font-semibold">
                            {Math.round(faceValue) * 10} {loyaltyRule.name}
                          </span>{" "}
                          to your loyalty wallet for this purchase.
                        </p>
                      </div>
                    ) : null
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GiftCardPurchasePage({
  stripeId,
  processingConfig,
  isAccountView,
  loyaltyRule,
  serverIsLoggedIn,
}: GiftCardPurchasePageProps) {
  if (!stripeId) {
    return (
      <div className="flex items-center justify-center min-h-screen font-body-oo">
        <p className="text-lg">
          Unable to load payment. Please try again later.
        </p>
      </div>
    );
  }

  const stripePromise = loadStripe(Env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: stripeId,
  });

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: 100,
        currency: "usd",
        appearance: {
          variables: {
            colorPrimary: isContrastOkay(
              "#ffffff",
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
            )
              ? Env.NEXT_PUBLIC_PRIMARY_COLOR
              : "#000000",
          },
        },
      }}
    >
      <GiftCardPurchasePageInner
        processingConfig={processingConfig}
        isAccountView={isAccountView}
        loyaltyRule={loyaltyRule}
        serverIsLoggedIn={serverIsLoggedIn}
      />
    </Elements>
  );
}