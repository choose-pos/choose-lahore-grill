"use client";

import { getCartId } from "@/app/actions/cookies";
import {
  Modifier,
  ModifierGroup,
  OrderById,
} from "@/components/account/TabBar";
import LoadingDots from "@/components/common/LoadingDots";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import {
  DiscountType,
  OrderDiscountType,
  OrderType,
  PriceTypeEnum,
  PromoDiscountType,
} from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import {
  calculateTotalModifiersPrice,
  extractErrorMessage,
  formattedNumber,
  getCookie,
} from "@/utils/UtilFncs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";

const PaymentStatusPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderById | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const pi = searchParams.get("payment_intent");
  const piCs = searchParams.get("payment_intent_client_secret");
  const feedbackType = searchParams.get("feedbackType");
  const [message, setMessage] = useState(null);
  const { setCartCountInfo, setCartData } = useCartStore();
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [loyaltyRule, setLoyaltyRule] = useState<{
    value: number;
    name: string;
    signUpValue: number;
  } | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackRemark, setFeedbackRemark] = useState<string>("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [modalClosedWithoutSubmission, setModalClosedWithoutSubmission] =
    useState(false);
  const { setToastData } = ToastStore();

  const { setRestaurantData, restaurantData } = RestaurantStore();

  // Check if we should show only feedback form
  const isChooseFeedbackOnly = feedbackType?.toLowerCase() === "choose";

  // UseEffects
  useEffect(() => {
    // Fetching customer details if loggedin
    const fetchFunc = async () => {
      try {
        const restaurantDetailsResponse =
          await sdk.GetCustomerRestaurantDetails({});

        const data = await sdk.fetchLoyaltyCustomerRules({});

        const rules = data.fetchLoyaltyCustomerRules;

        if (rules.onOrderRewardActive && rules.signUpRewardActive) {
          setLoyaltyRule({
            value: rules.onOrderRewardValue,
            name: rules.programName,
            signUpValue: rules.signUpRewardValue,
          });
        } else if (rules.onOrderRewardActive) {
          setLoyaltyRule({
            value: rules.onOrderRewardValue,
            name: rules.programName,
            signUpValue: 0,
          });
        } else {
          setLoyaltyRule(null);
        }

        if (!restaurantDetailsResponse?.getCustomerRestaurantDetails) {
          console.log("Restaurant Not Found");
        }

        const Restaurant =
          restaurantDetailsResponse.getCustomerRestaurantDetails;

        setRestaurantData({
          name: Restaurant.name,
          _id: Restaurant._id,
          restaurantConfigs: {
            allowTips: Restaurant.restaurantConfigs?.allowTips,
            onlineOrdering: Restaurant.restaurantConfigs?.onlineOrdering,
            pickup: Restaurant.restaurantConfigs?.pickup,
            scheduleOrders: Restaurant.restaurantConfigs?.scheduleOrders,
          },
          deliveryConfig: {
            provideDelivery: Restaurant.deliveryConfig?.provideDelivery,
            deliveryZone: {
              minimumOrderValue:
                Restaurant.deliveryConfig?.deliveryZone?.[0]?.minimumOrderValue,
            },
          },
          timezone: {
            timezoneName: Restaurant.timezone?.timezoneName,
          },
          onlineOrderTimingConfig: {
            startAfterMinutes:
              Restaurant.onlineOrderTimingConfig?.startAfterMinutes,
            endBeforeMinutes:
              Restaurant.onlineOrderTimingConfig?.endBeforeMinutes,
          },
          address: Restaurant.address
            ? {
                addressLine1: Restaurant.address.addressLine1,
                addressLine2: Restaurant.address.addressLine2 ?? undefined,
                state: {
                  stateName: Restaurant.address.state.stateName,
                  stateId: Restaurant.address.state.stateId,
                },
                city: Restaurant.address.city,
                zipcode: Restaurant.address.zipcode,
                coordinate: Restaurant.address.coordinate
                  ? {
                      coordinates: Restaurant.address.coordinate.coordinates,
                    }
                  : undefined,
                place: Restaurant.address.place
                  ? {
                      placeId: Restaurant.address.place.placeId,
                      displayName: Restaurant.address.place.displayName,
                    }
                  : undefined,
              }
            : undefined,
          brandingLogo: Restaurant.brandingLogo ?? undefined,
          website: Restaurant.website ?? undefined,
          socialInfo: Restaurant.socialInfo
            ? {
                facebook: Restaurant.socialInfo.facebook ?? undefined,
                instagram: Restaurant.socialInfo.instagram ?? undefined,
              }
            : undefined,
          availability: Restaurant.availability || undefined,
          category: Restaurant.category ?? undefined,
          beverageCategory: Restaurant.beverageCategory ?? undefined,
          foodType: Restaurant.foodType ?? undefined,
          dineInCapacity: Restaurant.dineInCapacity ?? undefined,
          type: Restaurant.type ?? undefined,
          meatType: Restaurant.meatType ?? undefined,
          taxRates: Restaurant.taxRates?.map((tx) => ({
            _id: tx._id,
            name: tx.name,
            salesTax: tx.salesTax,
          })),
          fulfillmentConfig: {
            prepTime: Restaurant.fulfillmentConfig?.prepTime ?? undefined,
            deliveryTime:
              Restaurant.fulfillmentConfig?.deliveryTime ?? undefined,
            largeOrderTreshold:
              Restaurant.fulfillmentConfig?.largeOrderTreshold ?? undefined,
            largeOrderExtraTime:
              Restaurant.fulfillmentConfig?.largeOrderExtraTime ?? undefined,
          },
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchFunc();
  }, [setRestaurantData]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // If no payment intent params, just fetch the order directly
    if (!piCs || !pi) {
      if (!orderId) {
        setError("Order ID is missing.");
        setIsLoading(false);
        return;
      }

      const fetchOrderDirectly = async () => {
        try {
          setIsLoading(true);
          const data = await fetchWithAuth(() =>
            sdk.fetchOrderById({
              id: orderId,
            })
          );
          setSelectedOrder(data.fetchCustomerOrderById);

          if (!data.fetchCustomerOrderById) {
            setError("Order not found. Please check your order ID.");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          setError("Failed to fetch order details. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderDirectly();
      return;
    }

    const fetchFunc = async () => {
      try {
        // Retrieve the PaymentIntent
        setIsLoading(true);

        const piStatus = await sdk.GetPaymentStatus({
          paymentCs: piCs,
          paymentIntentId: pi,
        });

        if (piStatus.getPaymentStatus === "succeeded") {
          const data = await fetchWithAuth(() =>
            sdk.fetchOrderById({
              id: orderId ?? "",
            })
          );
          setSelectedOrder(data.fetchCustomerOrderById);
          setCartCountInfo(0);
          setCartData([]);
        } else if (piStatus.getPaymentStatus === "canceled") {
          setError("Payment is cancelled, please try again later.");
          setPaymentFailed(true);
        } else if (piStatus.getPaymentStatus === "processing") {
          setError(
            "Payment is processing, please check you email for confirmation."
          );
        } else {
          setError("Payment is failed, please try again later.");
        }
      } catch (error) {
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunc();
  }, [orderId, pi, piCs, setCartCountInfo, setCartData]);

  // Check if mobile and show modal after 2 seconds
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Check if feedback already submitted for this order
    if (orderId) {
      const submittedOrders = JSON.parse(
        sessionStorage.getItem("feedbackSubmittedOrders") || "[]"
      );
      if (submittedOrders.includes(orderId)) {
        setFeedbackSubmitted(true);
      } else if (selectedOrder && !isLoading && !isChooseFeedbackOnly) {
        // Show modal after 2 seconds on mobile if feedback not submitted
        const timer = setTimeout(() => {
          if (isMobile && !feedbackSubmitted) {
            setShowFeedbackModal(true);
          }
        }, 2000);

        return () => {
          clearTimeout(timer);
          window.removeEventListener("resize", checkMobile);
        };
      }
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [
    orderId,
    selectedOrder,
    isLoading,
    isMobile,
    feedbackSubmitted,
    isChooseFeedbackOnly,
  ]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center font-online-ordering">
        <span className="mb-2">Please wait...</span>
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <FaExclamationCircle className="mx-auto text-3xl mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (paymentFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-online-ordering">
        <div className="rounded-lg p-8 text-center flex flex-col items-center justify-center relative">
          <Link href={"/menu"}>
            <div className="absolute top-4 left-4 flex items-center text-gray-500 hover:text-black cursor-pointer">
              <IoMdArrowBack size={16} />
              <p className="ml-2 text-base sm:text-lg font-online-ordering">
                Back to Menu
              </p>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Oops! Payment Failed
          </h1>

          <div className="space-y-4 text-xl md:text-2xl">
            <div className="flex items-center justify-center space-x-3">
              <span>
                Don&apos;t worry! <br /> no charges were made.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calcDiscountAmt = (): number => {
    if (!selectedOrder) {
      return 0;
    }

    if (selectedOrder.discountAmount && selectedOrder.discountAmount !== 0) {
      return selectedOrder.discountAmount;
    }

    return 0;
  };

  const getRatingMessage = (rating: number): string => {
    const messages = [
      "We'd love to hear your feedback",
      "We're sorry you had a poor experience",
      "We can do better! Tell us how",
      "Good! We appreciate your feedback",
      "Great! We're glad you enjoyed",
      "Excellent! Thank you for your support!",
    ];
    return messages[rating];
  };

  const handleSubmitFeedback = async () => {
    if (!orderId) {
      alert("Order ID is missing");
      return;
    }

    if (rating === 0) {
      alert("Please provide a rating");
      return;
    }

    try {
      const restaurantId = getCookie(cookieKeys.restaurantCookie);
      const cartId = await getCartId();
      const visitorHash = getOrCreateUserHash();
      const response = await fetchWithAuth(() =>
        sdk.submitChooseOrderingFeedback({
          input: {
            orderId: orderId,
            rating: rating,
            remarks: feedbackRemark || undefined,
            meta: { visitorHash, cartId, restaurantId },
          },
        })
      );

      if (response.submitChooseOrderingFeedback?._id) {
        // Save to session storage on success
        const submittedOrders = JSON.parse(
          sessionStorage.getItem("feedbackSubmittedOrders") || "[]"
        );
        if (!submittedOrders.includes(orderId)) {
          submittedOrders.push(orderId);
          sessionStorage.setItem(
            "feedbackSubmittedOrders",
            JSON.stringify(submittedOrders)
          );
        }

        setFeedbackSubmitted(true);
        setShowFeedbackModal(false);
      } else {
        setToastData({
          message: extractErrorMessage(response),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    }
  };

  // If feedbackType is "choose", show only the feedback form
  if (isChooseFeedbackOnly) {
    if (!selectedOrder) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center font-primary">
          <p className="text-red-500">Order not found.</p>
        </div>
      );
    }

    // Success state for Choose feedback
    if (feedbackSubmitted) {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 font-primary bg-gray-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-secondary font-bold mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your
              input!
            </p>
            <Link
              href="/menu"
              className={`flex gap-1 items-center justify-center text-sm sm:text-base font-medium font-primary `}
            >
              <ArrowLeft className="text-sm w-4 h-4 " />
              Back to Menu
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 font-primary">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center mb-6">
              <Link href="/menu">
                <div className="flex items-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
                  <IoMdArrowBack size={20} />
                  <span className="ml-2 text-base">Back To Menu</span>
                </div>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-2">
              Share Your Feedback
            </h1>
            <p className="text-gray-600 mb-8">
              Help us improve your experience
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 p-4 rounded-xl mb-8">
              <h3 className="font-semibold mb-2 text-gray-900">
                Order Details
              </h3>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">
                  Order ID: {selectedOrder.orderId}
                </p>
                <p className="text-gray-600">
                  Items: {selectedOrder.items.length} item(s)
                </p>
              </div>
            </div>

            {/* Overall Rating - Required */}
            <div className="mb-8">
              <label className="block font-semibold mb-4 text-lg text-gray-900">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col items-center bg-gray-50 rounded-xl py-8">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className={`w-12 h-12 md:w-14 md:h-14 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 stroke-yellow-400"
                            : "fill-none stroke-gray-300"
                        }`}
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4 min-h-[20px]">
                  {getRatingMessage(hoveredRating || rating)}
                </p>
              </div>
            </div>

            {/* Overall Remarks */}
            <div className="mb-8">
              <label
                htmlFor="overall-remarks"
                className="block font-semibold mb-3 text-gray-900"
              >
                Tell us more about your experience
              </label>
              <textarea
                id="overall-remarks"
                value={feedbackRemark}
                onChange={(e) => setFeedbackRemark(e.target.value)}
                maxLength={500}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent resize-none h-32"
              />
              <p className="text-sm text-gray-500 mt-2 text-right">
                {feedbackRemark.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                className={`inline-block px-8 py-2 text-lg sm:text-xl font-medium font-primary rounded-full transition-all duration-200 ${
                  rating === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR
                      )
                    ? `bg-primaryColor text-background hover:opacity-90`
                    : `bg-primaryColor text-textColor hover:opacity-90`
                }`}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Feedback Modal - Fixed positioning */}
      {showFeedbackModal && isMobile && !feedbackSubmitted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setModalClosedWithoutSubmission(true);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="mt-2">
              <h4 className="font-bold mb-4 text-lg font-primary text-center">
                How was your ordering experience?
              </h4>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 stroke-yellow-400"
                          : "fill-none stroke-gray-300"
                      }`}
                      strokeWidth="1.5"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Rating Message */}
              <p className="text-sm text-gray-600 mb-4 min-h-[20px] font-primary text-center">
                {getRatingMessage(hoveredRating || rating)}
              </p>

              {/* Remarks Input */}
              <div className="text-left">
                <label
                  htmlFor="feedback-remark-modal"
                  className="mb-2 block font-semibold font-primary text-base"
                >
                  Your Feedback
                </label>
                <textarea
                  id="feedback-remark-modal"
                  value={feedbackRemark}
                  onChange={(e) => setFeedbackRemark(e.target.value)}
                  maxLength={150}
                  placeholder="Share your experience with us..."
                  className="w-full p-2 border rounded-[20px] font-primary focus:outline-none focus:ring-0 border-black resize-none h-24 overflow-y-auto"
                />
                <p className="text-sm mt-1 text-right font-primary">
                  {feedbackRemark.length}/150 characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0}
                className={`mt-4 w-full px-6 py-2 rounded-full font-primary font-semibold transition-colors ${
                  rating === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center z-50 min-h-screen mx-2">
        <div className="bg-white p-8 my-5 rounded-lg shadow-lg w-full max-w-2xl relative overflow-y-scroll">
          <Link href={"/menu"}>
            <div className="flex items-center text-gray-500 hover:text-black cursor-pointer mb-6 ">
              <IoMdArrowBack size={16} />
            <p className="ml-2 text-base sm:text-lg font-online-ordering">
                Back to Menu
              </p>
            </div>
          </Link>
          {isLoading ? (
            <div className="w-full flex justify-center items-center h-64">
              <FaSpinner className="animate-spin text-3xl text-gray-600" />
            </div>
          ) : selectedOrder ? (
          <div className="font-online-ordering text-sm">
              <div className="text-center mb-4">
                <h3 className="text-xl md:text-2xl font-bold">
                  {selectedOrder.restaurantInfo.name}
                </h3>
                <p className="text-sm text-gray-700">
                  {selectedOrder.restaurantInfo.address.addressLine1}
                </p>
                <p className="text-sm text-gray-700">
                  Phone: +1{" "}
                  {formattedNumber(selectedOrder.restaurantInfo.phone)}
                </p>

                <hr className="my-4" />

                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500">Order ID:</p>
                  <p className="text-gray-500">{selectedOrder.orderId}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500">Order Time:</p>
                  <p className="text-gray-500">
                    {convertToRestoTimezone(
                    restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "",
                      new Date(selectedOrder.createdAt)
                    )}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500">
                    {selectedOrder.orderType === OrderType.Pickup
                      ? "Pickup Time"
                      : "Delivery Time"}
                    :
                  </p>
                  <p className="text-gray-500">
                    {convertToRestoTimezone(
                    restaurantData?.timezone?.timezoneName?.split(" ")[0] ?? "",
                      selectedOrder.orderType === OrderType.Pickup &&
                        selectedOrder.pickUpDateAndTime
                        ? new Date(selectedOrder.pickUpDateAndTime)
                        : new Date(selectedOrder.deliveryDateAndTime ?? "")
                    )}
                  </p>
                </div>
                {selectedOrder.paymentMethod ? (
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-gray-500">Payment Method:</p>
                    <p className="text-gray-500 capitalize">
                      {selectedOrder.paymentMethod ?? "N/A"}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-b py-2 mb-4">
                <div className="grid grid-cols-12 font-bold">
                  <span className="col-span-9">Item</span>
                  {/* <span className="col-span-3 text-center">Qty</span> */}
                  <span className="col-span-3 text-right">Total</span>
                </div>
              </div>

              <ul className="space-y-4">
                {selectedOrder.appliedDiscount?.loyaltyData?.redeemItem ? (
                  <li>
                    <div className="grid grid-cols-12">
                      <span className="col-span-9">
                        {
                          selectedOrder.appliedDiscount?.loyaltyData?.redeemItem
                            ?.itemName
                        }{" "}
                        x 1
                      </span>
                      {/* <span className="col-span-3 text-center">{1}</span> */}
                      <span className="col-span-3 text-right">
                        $
                        {selectedOrder.appliedDiscount?.loyaltyData?.redeemItem?.itemPrice?.toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </li>
                ) : null}

                {selectedOrder.appliedDiscount?.promoData?.discountItemName ? (
                  <li>
                    <div className="grid grid-cols-12">
                      <span className="col-span-9">
                        {
                          selectedOrder.appliedDiscount?.promoData
                            ?.discountItemName
                        }{" "}
                        x 1
                      </span>
                      {/* <span className="col-span-3 text-center">{1}</span> */}
                      <span className="col-span-3 text-right">
                        $
                        {selectedOrder.appliedDiscount?.promoData?.discountValue?.toFixed(
                          2
                        ) || "0.00"}
                      </span>
                    </div>
                  </li>
                ) : null}

                {selectedOrder.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <div className="grid grid-cols-12">
                      <span className="col-span-9">
                        {item.itemName} x {item.qty}
                      </span>

                      {/* <span className="col-span-3 text-center">{item.qty}</span> */}
                      <span className="col-span-3 text-right">
                        $
                        {(
                          (item.itemPrice +
                            calculateTotalModifiersPrice(item.modifierGroups)) *
                          item.qty
                        ).toFixed(2)}
                      </span>
                    </div>
                    {item.modifierGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="ml-2 text-gray-600">
                        {group.selectedModifiers.map((modifier, modIndex) => (
                          <div key={modIndex} className="grid grid-cols-12">
                            <span className="col-span-6">
                              {modifier.modifierName} x {modifier.qty}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                    {item.itemRemarks && (
                      <p className="text-gray-600  text-[12px] max-w-[160px] sm:max-w-[200px]">
                        Remarks: {item.itemRemarks}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Gross Amount</span>
                  <span>${selectedOrder.subTotalAmount?.toFixed(2)}</span>
                </div>
                {selectedOrder.discountAmount &&
                selectedOrder.discountAmount !== 0 ? (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}

                {calcDiscountAmt() > 0 ? (
                  <div className="flex justify-between">
                    <span>Net Amount</span>
                    <span>
                      $
                      {(
                        (selectedOrder.subTotalAmount ?? 0) - calcDiscountAmt()
                      ).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {selectedOrder.taxAmount && selectedOrder.platformFees ? (
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>
                      $
                      {(
                        parseFloat((selectedOrder.taxAmount ?? 0).toFixed(2)) +
                        parseFloat((selectedOrder.platformFees ?? 0).toFixed(2))
                      ).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {selectedOrder.tipAmount !== null ||
                selectedOrder.tipAmount !== undefined ? (
                  <div className="flex justify-between">
                    {/* <span>{`Tip (${
                    selectedOrder.thirdPartyTip ? "3rd Party" : "In House"
                  })`}</span> */}
                    <span>{`Tip`}</span>
                    <span>
                      $
                      {selectedOrder.tipAmount !== null &&
                      selectedOrder.tipAmount !== undefined
                        ? selectedOrder.tipAmount.toFixed(2)
                        : Number(0).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {(selectedOrder.deliveryAmount ?? 0) !== 0 ? (
                  <div className="flex justify-between">
                    <span>Delivery Fees</span>
                    <span>
                      ${(selectedOrder?.deliveryAmount ?? 0).toFixed(2)}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${selectedOrder?.finalAmount?.toFixed(2)}</span>
                </div>

                {(selectedOrder?.refundAmount ?? 0) > 0 ? (
                  <div className="flex justify-between font-bold text-lg">
                    <span>Refund</span>
                    <span>${selectedOrder?.refundAmount?.toFixed(2)}</span>
                  </div>
                ) : null}
              </div>

              {selectedOrder.appliedDiscount &&
                selectedOrder.appliedDiscount.discountType ===
                  OrderDiscountType.Promo && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <p>
                      You used code{" "}
                      {selectedOrder.appliedDiscount.promoData?.code} for{" "}
                      {selectedOrder.appliedDiscount.promoData?.discountValue &&
                      selectedOrder.appliedDiscount.promoData.discountType ===
                        PromoDiscountType.Free
                        ? `${selectedOrder.appliedDiscount?.promoData?.discountValue} off`
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountValue &&
                          selectedOrder.appliedDiscount.promoData
                            .discountType === PromoDiscountType.FreeDelivery
                        ? "free delivery"
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountValue &&
                          selectedOrder.appliedDiscount.promoData
                            .discountType === PromoDiscountType.FixedAmount
                      ? `Discount: $${selectedOrder.appliedDiscount.promoData.discountValue.toFixed(
                            2
                          )} off`
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountValue &&
                          selectedOrder.appliedDiscount.promoData
                            .discountType === PromoDiscountType.Percentage
                      ? `$${selectedOrder.appliedDiscount.discountAmount?.toFixed(
                            2
                          )} off`
                        : selectedOrder.appliedDiscount.promoData
                            ?.discountItemName &&
                          `Item: ${selectedOrder.appliedDiscount.promoData.discountItemName}`}
                    </p>
                  </div>
                )}

              {selectedOrder.appliedDiscount &&
                selectedOrder.appliedDiscount.discountType ===
                  OrderDiscountType.Loyalty && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-md">
                    <p>
                      You used your{" "}
                      {
                        selectedOrder.appliedDiscount.loyaltyData
                          ?.loyaltyPointsRedeemed
                      }{" "}
                      points for{" "}
                    {selectedOrder.appliedDiscount.loyaltyData?.redeemItem && (
                        <>
                          Item:{" "}
                          {
                          selectedOrder.appliedDiscount.loyaltyData?.redeemItem
                            .itemName
                          }{" "}
                          (Value: $
                          {selectedOrder.appliedDiscount.loyaltyData?.redeemItem.itemPrice.toFixed(
                            2
                          )}
                          )
                        </>
                      )}
                      {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                        ?.discountValue &&
                      (selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                        .discountType === DiscountType.FixedAmount ||
                          selectedOrder.appliedDiscount.loyaltyData
                            ?.redeemDiscount.discountType ===
                            DiscountType.Percentage) && (
                          <>
                            Discount: $
                            {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount.discountValue.toFixed(
                              2
                            )}{" "}
                            off
                          </>
                        )}
                    </p>
                  </div>
                )}
              {(selectedOrder?.guestData ?? null) === null &&
              loyaltyRule !== null &&
              Math.round(selectedOrder?.grossAmount ?? 0) * 10 > 0 ? (
                <div className="mt-4 bg-green-50 p-4 rounded-md">
                  <p>
                    You earned{" "}
                    {Math.round(selectedOrder?.grossAmount ?? 0) * 10}{" "}
                    {loyaltyRule.name ?? "Points"} for this order
                  </p>
                </div>
              ) : null}

              {selectedOrder?.guestData && loyaltyRule !== null ? (
                <div className="mt-4 bg-gray-100 p-4 rounded-md">
                  <p>
                    You could have earned{" "}
                    {Math.round(selectedOrder?.grossAmount ?? 0) * 10}{" "}
                    {loyaltyRule.name ?? "Points"}, if you had signed up.
                  </p>
                </div>
              ) : null}

              {selectedOrder.specialRemark && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                  <h4 className="font-bold mb-2">Restaurant Remarks</h4>
                  <p>{selectedOrder.specialRemark}</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs mb-6">
                  Thank you for your order!
                </p>

                {/* Feedback Section - Show only if not submitted or on desktop */}
                {!feedbackSubmitted &&
                  (!isMobile || modalClosedWithoutSubmission) && (
                    <div className="border-t pt-6">
                      <h4 className="font-bold mb-4 text-lg font-primary">
                        How was your ordering experience?
                      </h4>

                      {/* Star Rating */}
                      <div className="flex justify-center gap-2 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className={`w-10 h-10 transition-colors ${
                                star <= (hoveredRating || rating)
                                  ? "fill-yellow-400 stroke-yellow-400"
                                  : "fill-none stroke-gray-300"
                              }`}
                              strokeWidth="1.5"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                      {/* Rating Message */}
                      <p className="text-sm text-gray-600 mb-4 min-h-[20px] font-primary">
                        {getRatingMessage(hoveredRating || rating)}
                      </p>

                      {/* Remarks Input */}
                      <div className="text-left">
                        <label
                          htmlFor="feedback-remark"
                          className="mb-2 block font-semibold font-primary text-base"
                        >
                          Your Feedback
                        </label>
                        <textarea
                          id="feedback-remark"
                          value={feedbackRemark}
                          onChange={(e) => setFeedbackRemark(e.target.value)}
                          maxLength={150}
                          placeholder="Share your experience with us..."
                          className="w-full p-2 border rounded-[20px] font-primary focus:outline-none focus:ring-0 border-black resize-none h-24 overflow-y-auto"
                        />
                        <p className="text-sm mt-1 text-right font-primary">
                          {feedbackRemark.length}/150 characters
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={handleSubmitFeedback}
                          disabled={rating === 0}
                          className={`inline-block mt-4 px-8 py-2 text-lg sm:text-xl font-medium font-primary rounded-full transition-all duration-200 ${
                            rating === 0
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : isContrastOkay(
                                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                                  Env.NEXT_PUBLIC_BACKGROUND_COLOR
                                )
                              ? `bg-primaryColor text-background hover:opacity-90`
                              : `bg-primaryColor text-textColor hover:opacity-90`
                          }`}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  )}

                {/* Thank you message after feedback submitted */}
                {feedbackSubmitted && (
                  <div className="border-t pt-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {/* Display stars */}
                        <div className="flex gap-1">
                          {[...Array(rating)].map((_, index) => (
                            <svg
                              key={index}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className="w-z h-8 fill-yellow-400 stroke-yellow-400"
                              strokeWidth="1.5"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="font-semibold text-center">
                        Thank you for your feedback! We appreciate your input.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load order details.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentStatusPage;
