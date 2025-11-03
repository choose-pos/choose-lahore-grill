"use client";

import {
  Modifier,
  ModifierGroup,
  OrderById,
} from "@/components/account/TabBar";
import LoadingDots from "@/components/common/LoadingDots";
import {
  DiscountType,
  OrderDiscountType,
  OrderType,
} from "@/generated/graphql";
import { cookieKeys } from "@/constants";
import { Env } from "@/env";
import { useCartStore } from "@/store/cart";
import RestaurantStore from "@/store/restaurant";
import { convertToRestoTimezone } from "@/utils/formattedTime";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { calculateTotalModifiersPrice, formattedNumber, getCookie} from "@/utils/UtilFncs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { IoMdArrowBack } from "react-icons/io";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { getCartId } from "@/app/actions/cookies";

const PaymentStatusPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderById | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { setCartCountInfo, setCartData } = useCartStore();
  const [loyaltyRule, setLoyaltyRule] = useState<{
    value: number;
    name: string;
    signUpValue: number;
  } | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackRemark, setFeedbackRemark] = useState<string>("");
  const { setToastData } = ToastStore();

  const { setRestaurantData, restaurantData } = RestaurantStore();

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

    const fetchFunc = async () => {
      try {
        // Retrieve the Order
        setIsLoading(true);

        const data = await fetchWithAuth(() =>
          sdk.fetchOrderById({
            id: orderId ?? "",
          })
        );
        setSelectedOrder(data.fetchCustomerOrderById);
        setCartCountInfo(0);
        setCartData([]);
        if (!data.fetchCustomerOrderById) {
          setError("Payment is failed, please try again later.");
        }
      } catch (error) {
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunc();
  }, [orderId, setCartCountInfo, setCartData]);

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
      setToastData({
        message: "Sorry we couldnt find your order",
        type: "error",
      });
    }

    if (rating === 0) {
      setToastData({
        message: "Please Provide a rating before submitting.",
        type: "error",
      });
      return;
    }

    try {
      const cartId = await getCartId();
      const visitorHash = getOrCreateUserHash();
      const restaurantId = getCookie(cookieKeys.restaurantCookie);

      const response = await fetchWithAuth(() =>
        sdk.submitChooseOrderingFeedback({
          input: {
            orderId: orderId ?? "",
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
      } else {
        setToastData({
          message: "Failed to submit feedback. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setToastData({
        message: "Failed to submit feedback. Please try again.",
        type: "error",
      });
    }
  };


  return (
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
                Phone: +1 {formattedNumber(selectedOrder.restaurantInfo.phone)}
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

              {(selectedOrder.tipAmount !== null ||
                selectedOrder.tipAmount !== undefined) && (
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
              )}

              {selectedOrder.taxAmount &&
              (selectedOrder.platformFees !== null ||
                selectedOrder.platformFees !== undefined) ? (
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
                    {selectedOrder.appliedDiscount.promoData?.code} for $
                    {selectedOrder.appliedDiscount.promoData?.discountValue} off
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
                  </p>
                  {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                    ?.discountValue &&
                    (selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                      .discountType === DiscountType.FixedAmount ||
                      selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount
                        .discountType === DiscountType.Percentage) && (
                      <p>
                        Discount: $
                        {selectedOrder.appliedDiscount.loyaltyData?.redeemDiscount.discountValue.toFixed(
                          2
                        )}{" "}
                        off
                      </p>
                    )}
                </div>
              )}
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

            <div className="mt-6 text-center text-gray-500 text-xs">
              <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs mb-6">
                Thank you for your order!
              </p>

              {/* Feedback Section */}
              <div className="border-t pt-6">
                <h4 className="font-bold mb-4 text-lg font-online-ordering">
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
                <p className="text-sm text-gray-600 mb-4 min-h-[20px] font-online-ordering">
                  {getRatingMessage(hoveredRating || rating)}
                </p>

                {/* Remarks Input */}
                <div className="text-left">
                  <label
                    htmlFor="feedback-remark"
                    className="mb-2 block font-semibold font-online-ordering text-base"
                  >
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback-remark"
                    value={feedbackRemark}
                    onChange={(e) => setFeedbackRemark(e.target.value)}
                    maxLength={150}
                    placeholder="Share your experience with us..."
                    className="w-full p-2 border rounded-[20px] font-online-ordering focus:outline-none focus:ring-0 border-black resize-none h-24 overflow-y-auto"
                  />
                  <p className="text-sm mt-1 text-right font-online-ordering">
                    {feedbackRemark.length}/150 characters
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={rating === 0}
                    className={`inline-block mt-4 px-8 py-2 text-lg sm:text-xl font-medium font-online-ordering rounded-full transition-all duration-200 ${
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
          </div>
        ) : (
          <p className="text-red-500">Failed to load order details.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
