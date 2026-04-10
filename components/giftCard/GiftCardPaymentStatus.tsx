"use client";

import LoadingDots from "@/components/common/LoadingDots";
import { sdk, fetchWithAuth } from "@/utils/graphqlClient";
import { extractErrorMessage, formattedNumber } from "@/utils/UtilFncs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaExclamationCircle } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { PublicGiftCardResult } from "@/generated/graphql";
import meCustomerStore from "@/store/meCustomer";
import useGiftCardStore from "@/store/giftCard";

type RestaurantInfo = {
  name: string;
  address?: string;
  phone?: string;
};

interface GiftCardPaymentStatusProps {
  paymentIntentId: string;
  paymentIntentClientSecret: string;
  isFromMenu: boolean;
  onBack: () => void;
}

const GiftCardPaymentStatus = ({
  paymentIntentId,
  paymentIntentClientSecret,
  isFromMenu,
  onBack,
}: GiftCardPaymentStatusProps) => {
  const { clearPaymentIntent } = useGiftCardStore();

  const [isLoading, setIsLoading] = useState(true);
  const [localGiftCardData, setLocalGiftCardData] =
    useState<PublicGiftCardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(
    null,
  );

  const { meCustomerData } = meCustomerStore();
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await sdk.GetCmsRestaurantDetails();
        const r = res.getCmsRestaurantDetails;
        if (r) {
          const addr = r.address
            ? `${r.address.addressLine1}${r.address.city ? `, ${r.address.city}` : ""}${r.address.state?.stateName ? `, ${r.address.state.stateName}` : ""}${r.address.zipcode ? ` ${r.address.zipcode}` : ""}`
            : undefined;
          setRestaurantInfo({
            name: r.name,
            address: addr,
            phone: r.phone ?? undefined,
          });
        }
      } catch (e) {
        console.error("Error fetching restaurant details:", e);
      }
    };
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!paymentIntentId || !paymentIntentClientSecret) return;
    if (localGiftCardData) return;

    const fetchFunc = async () => {
      try {
        setIsLoading(true);

        const piStatus = await sdk.GetPaymentStatus({
          paymentCs: paymentIntentClientSecret,
          paymentIntentId: paymentIntentId,
        });

        if (piStatus.getPaymentStatus === "canceled") {
          setError("Payment cancelled, please try again later.");
          setPaymentFailed(true);
          setIsLoading(false);
          return;
        } else if (piStatus.getPaymentStatus === "processing") {
          setError(
            "Payment is processing, please check your email for confirmation.",
          );
          setIsLoading(false);
          return;
        } else if (piStatus.getPaymentStatus !== "succeeded") {
          setError("Payment failed, please try again later.");
          setPaymentFailed(true);
          setIsLoading(false);
          return;
        }

        // Retry mechanism for webhook race condition
        let gcData = null;
        let attempts = 0;
        const maxAttempts = 5;
        let lastError = null;

        while (attempts < maxAttempts) {
          try {
            const result = await fetchWithAuth(() =>
              sdk.getGiftCardByCode({ paymentIntent: paymentIntentId }),
            );
            if (result.getGiftCardByCode) {
              gcData = result.getGiftCardByCode;
              break;
            }
          } catch (err: any) {
            lastError = err;
            if (extractErrorMessage(err)?.toLowerCase().includes("not found")) {
              await new Promise((res) => setTimeout(res, 2000));
              attempts++;
              continue;
            } else {
              throw err;
            }
          }
          await new Promise((res) => setTimeout(res, 2000));
          attempts++;
        }

        if (gcData) {
          setLocalGiftCardData(gcData as PublicGiftCardResult);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          clearPaymentIntent();
        } else if (lastError) {
          throw lastError;
        } else {
          setError("Gift card not found. Please check your reference code.");
        }
      } catch (error) {
        console.error("Error fetching gift card:", error);
        setError(
          `Error: ${extractErrorMessage(error) || "Failed to fetch gift card details"}`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunc();
  }, [paymentIntentId, paymentIntentClientSecret]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center font-body-oo">
        <span className="mb-2 text-gray-600">Please wait...</span>
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <FaExclamationCircle className="mx-auto text-3xl mb-2" />
          <p className="text-sm font-body-oo">{error}</p>
        </div>
      </div>
    );
  }

  if (paymentFailed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="rounded-md p-8 text-center flex flex-col items-center justify-center relative">
          <button
            onClick={() =>
              meCustomerData
                ? router.push("/menu/my-account?tab=giftcards")
                : onBack()
            }
            className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-black cursor-pointer"
          >
            <IoMdArrowBack size={16} />
            <p className="ml-2 text-base sm:text-lg font-subheading-oo">
              {isFromMenu ? "Back to Menu" : "Back to Gift Card"}
            </p>
          </button>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-subheading-oo font-bold text-gray-800 mb-4">
            Oops! Payment Failed
          </h1>
          <div className="space-y-4 text-xl md:text-2xl font-subheading-oo">
            <p>Don&apos;t worry! No charges were made.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center z-50 min-h-screen mx-2 bg-gray-50">
      <div className="bg-white p-8 my-5 rounded-md shadow-lg w-full max-w-2xl relative overflow-y-auto font-body-oo">
        <button
          onClick={() =>
            meCustomerData
              ? router.push("/menu/my-account?tab=giftcards")
              : onBack()
          }
          className="flex items-center text-gray-500 hover:text-black cursor-pointer mb-6"
        >
          <IoMdArrowBack size={16} />
          <p className="ml-2 text-base font-subheading-oo">
            {isFromMenu ? "Back to Menu" : "Back to Gift Card"}
          </p>
        </button>

        {localGiftCardData && (
          <div className="text-sm">
            {/* Restaurant Details */}
            <div className="text-center mb-4">
              <h3 className="text-xl md:text-2xl font-subheading-oo font-semibold">
                {restaurantInfo?.name ?? "Gift Card Purchased!"}
              </h3>
              {restaurantInfo?.address && (
                <p className="text-sm text-gray-700">
                  {restaurantInfo.address}
                </p>
              )}
              {restaurantInfo?.phone && (
                <p className="text-sm text-gray-700">
                  Phone: +1 {formattedNumber(restaurantInfo.phone)}
                </p>
              )}

              <hr className="my-4" />

              {/* Order Time */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Order Time:</p>
                <p className="text-gray-500">
                  {formatDateTime(localGiftCardData.createdAt)}
                </p>
              </div>

              {/* Gift Card Code */}
              <div className="flex flex-row justify-between items-center">
                <p className="text-gray-500">Gift Card Code:</p>
                <p className="text-gray-800 font-bold tracking-widest">
                  {localGiftCardData.code}
                </p>
              </div>

              {/* Scheduled Send Time */}
              {localGiftCardData.scheduledSendAt && (
                <div className="flex justify-between">
                  <h4 className="text-gray-500">Scheduled Delivery</h4>
                  <p className="text-gray-700">
                    {formatDate(localGiftCardData.scheduledSendAt)}
                  </p>
                </div>
              )}

              {!localGiftCardData.sendToSelf &&
                localGiftCardData.recipientInfo && (
                  <div className="flex justify-between">
                    <h4 className="text-gray-500 ">Recipient Name</h4>
                    <p className="text-gray-700 ">
                      {localGiftCardData.recipientInfo.firstName}{" "}
                      {localGiftCardData.recipientInfo.lastName}
                    </p>
                  </div>
                )}

              {!localGiftCardData.sendToSelf &&
                localGiftCardData.recipientInfo && (
                  <div className="flex justify-between">
                    <h4 className="text-gray-500 mb-2">Recipient Email</h4>
                    <p className="text-gray-700 ">
                      {localGiftCardData.recipientInfo.email}
                    </p>
                  </div>
                )}
            </div>

            {/* Payment Section */}
            <div className="border-t border-b py-4 my-4 space-y-2">
              <div className="flex justify-between">
                <span>Gift Card Value</span>
                <span>${localGiftCardData.amount.toFixed(2)}</span>
              </div>

              {localGiftCardData.customerPaidAmount >
                localGiftCardData.amount && (
                <div className="flex justify-between">
                  <span>Fees</span>
                  <span>
                    $
                    {(
                      localGiftCardData.customerPaidAmount -
                      localGiftCardData.amount
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${localGiftCardData.customerPaidAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* From Section — only show if NOT sendToSelf */}
            {/* {!localGiftCardData.sendToSelf && localGiftCardData.senderInfo && (
              <div className="mb-4">
                <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wider">
                  From
                </h4>
                <p className="text-gray-700 capitalize">
                  {localGiftCardData.senderInfo.firstName} {localGiftCardData.senderInfo.lastName}
                </p>
                <p className="text-gray-500">{localGiftCardData.senderInfo.email}</p>
              </div>
            )} */}

            {/* To Section — only show if NOT sendToSelf */}

            {/* Note */}
            {localGiftCardData.note && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-500 uppercase text-xs tracking-wider font-bold mb-1">
                  Note
                </p>
                <p className="text-gray-700 italic">
                  &quot;{localGiftCardData.note}&quot;
                </p>
              </div>
            )}

            {/* Loyalty Points Earned */}
            {localGiftCardData.loyaltyPointsEarned &&
              localGiftCardData.loyaltyPointsEarned > 0 && (
                <div className="mt-4 bg-green-50 p-4 rounded-md font-body-oo">
                  <p>
                    You earned{" "}
                    <span className="font-semibold">
                      {localGiftCardData.loyaltyPointsEarned}
                    </span>{" "}
                    loyalty points for this purchase.
                  </p>
                </div>
              )}

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs font-subheading-oo">
                Thank you for your purchase!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCardPaymentStatus;