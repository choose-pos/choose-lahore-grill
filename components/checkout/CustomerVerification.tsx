import { Env } from "@/env";
import { AccountPreference } from "@/generated/graphql";
import CustomerDataStore from "@/store/customerData";
import { useCartStore } from "@/store/cart";
import PromoCodeStore from "@/store/promocode";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { TAmounts } from "@/utils/types";
import { extractErrorMessage, formatUSAPhoneNumber } from "@/utils/UtilFncs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import StarIcon from "../common/StarIcon";
import { FiInfo } from "react-icons/fi";

const CustomerVerification = ({
  isOtpVerified,
  setIsOtpVerified,
  setPlaceOrderError,
  amounts,
  loyaltyRule,
  refreshData,
}: {
  isOtpVerified: boolean;
  setIsOtpVerified: React.Dispatch<React.SetStateAction<boolean>>;
  setPlaceOrderError: React.Dispatch<React.SetStateAction<string | undefined>>;
  amounts: TAmounts | null;
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  refreshData: () => void;
}) => {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    firstName: "",
    lastName: "",
    otp: "",
  });
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [promoCodeMessage, setPromoCodeMessage] = useState("");

  const { setToastData } = ToastStore();
  const { setCustomerData, customerData, signUpToggle, setSignUpToggle } =
    CustomerDataStore();
  const { restaurantData } = RestaurantStore();
  const { setPromo } = PromoCodeStore();
  const { cartDetails } = useCartStore();
  const hasPromo = !!cartDetails?.discountString;

  const [existingCustomer, setExistingCustomer] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  useEffect(() => {
    const verifyOtp = async () => {
      if (!formData.otp || formData.otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      try {
        const res = await fetchWithAuth(() =>
          sdk.verifyOTPGuestOrder({
            verify: {
              phone: formData.phone,
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName,
              otp: formData.otp,
              accountPreferences: {
                email: true,
                sms: true,
              },
            },
          }),
        );
        if (res.verifyOTPGuestOrder.success) {
          const foundExistingCustomer = res.verifyOTPGuestOrder.customer
            ? {
                email: res.verifyOTPGuestOrder.customer.email ?? "",
                phone: res.verifyOTPGuestOrder.customer.phone ?? "",
                firstName: res.verifyOTPGuestOrder.customer.firstName ?? "",
                lastName: res.verifyOTPGuestOrder.customer.lastName ?? "",
              }
            : null;

          if (foundExistingCustomer) {
            setExistingCustomer(foundExistingCustomer);
          }
          setCustomerData({
            phone: formData.phone,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            otp: formData.otp,
            accountPreferences: {
              email: true,
              sms: true,
            },
            signUp: foundExistingCustomer ? false : hasPromo || signUpToggle,
          });

          if (res.verifyOTPGuestOrder.promoCodeMessage) {
            setPromo(null);
            setPromoCodeMessage(res.verifyOTPGuestOrder.promoCodeMessage);
            setToastData({
              message: res.verifyOTPGuestOrder.promoCodeMessage,
              type: "error",
            });
            refreshData();
          } else {
            setPromoCodeMessage("");
          }

          setToastData({
            message: "OTP verified! You may now proceed to place your order.",
            type: "success",
          });

          setIsOtpVerified(true);
          setError("");
        }
      } catch (err) {
        setTimer(60);
        setIsOtpVerified(false);
        setCustomerData(null);
        setError(
          "Invalid OTP. Please check your code or wait a few seconds to request a new one.",
        );
        setToastData({
          type: "error",
          message: extractErrorMessage(err),
        });
      }
    };

    if (formData.otp.length === 6) {
      verifyOtp();
    }
  }, [
    formData.email,
    formData.firstName,
    formData.lastName,
    formData.otp,
    formData.phone,
    setCustomerData,
    setIsOtpVerified,
    setToastData,
  ]);

  const validateForm = () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!formData.firstName.trim()) {
      setError("Please enter your first name.");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Please enter your last name.");
      return false;
    }
    return true;
  };

  const generateOtp = async () => {
    setExistingCustomer(null);
    if (!validateForm()) return;

    try {
      const accountPreferences: AccountPreference = {
        email: true,
        sms: true,
      };
      const response = await fetchWithAuth(() =>
        sdk.sendOTPGuestOrder({
          verify: {
            phone: formData.phone,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            accountPreferences,
          },
        })
      );
      if (response.sendOTPGuestOrder) {
        setShowOtp(true);
        setError("");
        setTimer(60);
        setIsOtpVerified(false);
        setToastData({
          type: "success",
          message: "OTP sent for verification.",
        });
        setFormData((p) => ({ ...p, otp: "" }));
        setPlaceOrderError(undefined);
      } else {
        throw new Error("Failed to generate OTP");
      }
    } catch (err) {
      setError("Failed to send an OTP. Please try again.");
      setToastData({
        type: "error",
        message: extractErrorMessage(err),
      });
    }
  };

  return (
    <form
      className="w-full max-w-4xl mx-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* <h2 className="mb-4 font-online-ordering text-xl capitalize">
        Guest Details
      </h2> */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-subheading-oo font-semibold text-xl capitalize">
          Guest Details
        </h2>
        {showOtp && (
          <button
            type="button"
            onClick={() => {
              setIsOtpVerified(false);
              setShowOtp(false);
              setFormData((prev) => ({ ...prev, otp: "" }));
            }}
            className="text-black hover:underline text-sm font-body-oo font-medium"
          >
            Edit
          </button>
        )}
      </div>
      <div className="space-y-4 mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-body-oo font-semibold text-gray-700 capitalize"
            >
              First Name
            </label>
            <input
              required
              type="text"
              id="firstName"
              disabled={showOtp}
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full font-body-oo border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="Alex"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-body-oo font-semibold text-gray-700 capitalize"
            >
              Last Name
            </label>
            <input
              required
              type="text"
              id="lastName"
              disabled={showOtp}
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full font-body-oo border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="D"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-body-oo font-semibold text-gray-700 capitalize"
          >
            Phone
          </label>
          <input
            required
            type="tel"
            id="phone"
            disabled={showOtp}
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full font-body-oo  border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="800-555-0175"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-body-oo font-semibold  text-gray-700 capitalize"
          >
            Email
          </label>
          <input
            required
            type="email"
            id="email"
            disabled={showOtp}
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full font-body-oo border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="alex@example.com"
          />
        </div>
        <p className="text-xs font-body-oo text-gray-500">
          {`By verifying your OTP, you agree to receive promotional and transactional emails and SMS from ${restaurantData?.name} and our technology partner Choose, and accept our`}{" "}
          <Link
            href={"https://www.choosepos.com/terms-conditions"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold">{`Terms`}</span>
          </Link>{" "}
          {`and`}{" "}
          <Link
            href={"https://www.choosepos.com/privacy-policy"}
            passHref
            className="inline-block"
          >
            <span className="underline font-semibold">{`Privacy Policy`}</span>
          </Link>
          {`. You can opt out of promotional communications at any time from your profile.`}
        </p>

        {showOtp ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block font-body-oo text-sm font-semibold text-gray-700 capitalize"
              >
                OTP
              </label>
              <input
                required
                inputMode="numeric"
                type="text"
                id="otp"
                value={formData.otp}
                onChange={handleChange}
                className="mt-1 block w-full font-body-oo  border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Enter 6 digit OTP"
                maxLength={6}
              />
              {!isOtpVerified && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={generateOtp}
                    disabled={timer > 0}
                    className="text-sm font-body-oo font-semibold text-black  disabled:cursor-not-allowed"
                  >
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </button>
                </div>
              )}
            </div>
            {isOtpVerified && customerData?.otp && (
              <p className="text-green-600 font-body-oo text-sm">
                OTP verified! You may now proceed to place your order.
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm font-body-oo">{error}</p>
            )}
            {promoCodeMessage && (
              <p className="text-red-600 text-sm font-body-oo">
                {promoCodeMessage}
              </p>
            )}
          </div>
        ) : (
          <button
            type="submit"
            onClick={generateOtp}
            className="w-full md:w-[40%] bg-primary font-subheading-oo font-semibold text-white !text-base py-2 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary capitalize"
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR,
              )
                ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                : Env.NEXT_PUBLIC_TEXT_COLOR,
            }}
          >
            Send OTP
          </button>
        )}

        {showOtp && existingCustomer && (
          <div className="rounded-lg p-3 mb-4 relative bg-green-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-black"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 font-body-oo">
                  Great news! {`We've`} found an existing account for{" "}
                  {formatUSAPhoneNumber(existingCustomer.phone)}, we will credit{" "}
                  <span className="font-semibold">
                    {Math.round(amounts?.netAmt ?? 0) * 10} {loyaltyRule?.name}
                  </span>{" "}
                  to your loyalty wallet for this order.
                </p>
              </div>
            </div>
          </div>
        )}

        {showOtp &&
          isOtpVerified &&
          !existingCustomer &&
          !!cartDetails?.discountString &&
          !promoCodeMessage && (
            <div className="flex items-center">
              <p className="text-sm font-body-oo text-gray-500">
                Thank you for applying the promo code. Since you are using this
                promotion, we will create a new account using{" "}
                {formatUSAPhoneNumber(formData.phone)} to complete your order.
              </p>
            </div>
          )}

        {/* Stay in touch section */}
        {!existingCustomer && !hasPromo && (
          <>
            <hr className="my-4" />
            <div>
              <h3 className="font-subheading-oo font-semibold text-lg mb-3">
                Stay in touch
              </h3>
              <div className="rounded-xl border bg-gray-50 overflow-hidden">
                {/* Loyalty info row */}
                <div className="flex items-start gap-3 px-4 py-3 border-b">
                  <div className="mt-0.5 flex-shrink-0 text-gray-700">
                    <StarIcon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-body-oo text-gray-800">
                      Sign up and earn {loyaltyRule?.signUpValue}{" "}
                      {loyaltyRule?.name ?? "loyalty points"} with every order.
                    </p>
                  </div>
                </div>

                {/* Sign up toggle row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={hasPromo || signUpToggle}
                    disabled={hasPromo}
                    onClick={() => {
                      if (hasPromo) return;
                      const newVal = !signUpToggle;
                      setSignUpToggle(newVal);
                      if (customerData) {
                        setCustomerData({ ...customerData, signUp: newVal });
                      }
                    }}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      hasPromo || signUpToggle ? "bg-primary" : "bg-gray-300"
                    } ${hasPromo ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        hasPromo || signUpToggle
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-sm font-body-oo font-semibold text-gray-800">
                    Sign up
                  </span>
                </div>
              </div>

              {/* {(hasPromo || signUpToggle) && (
                <p className="text-xs font-body-oo text-gray-400 mt-2">
                  By signing up, you agree to receive marketing texts and
                  Loyalty messages.
                </p>
              )} */}

                {!signUpToggle && !hasPromo && loyaltyRule && (
                <div className="mt-2 flex gap-2 bg-primary/10 border items-center border-primary/30 rounded-md px-3 py-2">
                  <p className="text-sm font-body-oo text-gray-800">
                    You&apos;ll miss out on{" "}
                    <span className="font-semibold">
                      {loyaltyRule.signUpValue +
                        Math.round(amounts?.netAmt ?? 0) * 10}{" "}
                      {loyaltyRule.name}
                    </span>{" "}
                    by not signing up.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default CustomerVerification;
