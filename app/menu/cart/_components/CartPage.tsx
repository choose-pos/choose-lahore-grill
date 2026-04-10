"use client";
import CustomerVerification from "@/components/checkout/CustomerVerification";
import ItemEditScreen from "@/components/cart/ItemEditScreen";
import { Env } from "@/env";
import {
  CreateOrderWihoutPaymentInput,
  LoyaltyRedeemType,
  OrderDiscountType,
} from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import CustomerDataStore from "@/store/customerData";
import { useModalStore } from "@/store/global";
import meCustomerStore from "@/store/meCustomer";
import RestaurantStore from "@/store/restaurant";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { refreshCart } from "@/utils/refreshCart";
import {
  CustomerRestaurant,
  FetchCartDetails,
  GroupedCartItem,
  RestaurantRedeemOffers,
  TAmounts,
} from "@/utils/types";
import {
  extractErrorMessage,
  extractFreeDiscountItemDetails,
} from "@/utils/UtilFncs";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn } from "@/utils/motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartBreakdown from "./CartBreakdown";
import CartHeader from "./CartHeader";
import CartItems from "./CartItems";
import CartOffers from "./CartOffers";
import CartRemarks from "./CartRemarks";
import CartTips from "./CartTips";

interface ICartPageProps {
  restaurantInfo: CustomerRestaurant;
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  loyaltyOffers: RestaurantRedeemOffers | null;
  processingConfig?: {
    feePercent?: number | null;
    maxFeeAmount?: number | null;
  };
  deliveryFee: number | null;
  checkDeliveryAvailable: boolean;
  mismatch: boolean | null;
}

const CartPage = ({
  loyaltyRule,
  restaurantInfo,
  deliveryFee,
  processingConfig,
  loyaltyOffers,
  checkDeliveryAvailable,
  mismatch,
}: ICartPageProps) => {
  // Configs
  const { replace, push } = useRouter();

  // Stores
  const { restaurantData, setRestaurantData } = RestaurantStore();
  const { setShowMenu } = useModalStore();
  const {
    cartCountInfo,
    cartData,
    cartDetails,
    freeItemInCart,
    setCartCountInfo,
    setCartData,
    setCartDetails,
    setFreeItemInCart,
    setSpecialRemarks,
    setTotalAmount,
    setFreeItemImage,
  } = useCartStore();
  const { meCustomerData, setMeCustomerData } = meCustomerStore();

  // States
  const [stateChange, setStateChange] = useState<boolean>(false);
  const [amounts, setAmounts] = useState<TAmounts | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GroupedCartItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCartLoading, setIsCartLoading] = useState<boolean>(true);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [placeOrderError, setPlaceOrderError] = useState<string>();
  const { customerData } = CustomerDataStore();
  const { setToastData } = ToastStore();
  const { specialRemarks } = useCartStore();
  const totalRef = useRef<HTMLDivElement>(null);
  const [isTotalVisible, setIsTotalVisible] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [promoRemovedMsg, setPromoRemovedMsg] = useState<string | null>(null);

  useEffect(() => {
    const el = totalRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsTotalVisible(entry.isIntersecting),
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amounts]);

  useEffect(() => {
    if (!checkDeliveryAvailable) {
      replace(`/menu?delivery=${true}`);
    }
  }, [checkDeliveryAvailable]);

  useEffect(() => {
    if (mismatch) {
      setShowMenu(false);
    }
  }, [mismatch]);

  // UseEffects
  useEffect(() => {
    // Fetching customer details if loggedin
    const fetchInitialCustomer = async () => {
      try {
        const customerData = await fetchWithAuth(() => sdk.meCustomer());
        if (customerData.meCustomer) {
          setMeCustomerData(customerData.meCustomer);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchInitialCustomer();
  }, [setMeCustomerData]);

  useEffect(() => {
    // Setting restaurant data
    setRestaurantData(restaurantInfo);
  }, [restaurantInfo, setRestaurantData]);

  useEffect(() => {
    // If user changes or removes promo code, reset their otp verified status
    // so they are prompted to verify guest details again
    setIsOtpVerified(false);
  }, [cartDetails?.discountCode, cartDetails?.discountString]);

  useEffect(() => {
    // Fetching cart details and setting in store
    const fetchCartDets = async () => {
      setIsCartLoading(true);
      try {
        const [
          cartCountReq,
          cartStoreReq,
          cartItemsReq,
          cartTotalReq,
          checkDeliveryAvailable,
        ] = await Promise.all([
          sdk.fetchCartCount(),
          sdk.fetchCartDetails(),
          refreshCart(),
          sdk.CalculateFinalAmount(),
          sdk.checkDeliveryAvailable(),
        ]);

        if (!checkDeliveryAvailable.checkDeliveryAvailable) {
          replace(`/menu?delivery=${true}`);
        }
        let cartCount = cartCountReq.fetchCartCount;
        let cartStore = cartStoreReq.fetchCartDetails;
        const cartItems = cartItemsReq.groupedCart;
        let cartTotal = cartTotalReq.calculateFinalAmount;

        if (cartItemsReq.message) {
          setToastData({
            message: cartItemsReq.message,
            type: "error",
          });

          const [
            updatedCartCountReq,
            updatedCartStoreReq,
            updatedCartTotalReq,
          ] = await Promise.all([
            sdk.fetchCartCount(),
            sdk.fetchCartDetails(),
            sdk.CalculateFinalAmount(),
          ]);

          // Update the variables with fresh data
          cartCount = updatedCartCountReq.fetchCartCount;
          cartStore = updatedCartStoreReq.fetchCartDetails;
          cartTotal = updatedCartTotalReq.calculateFinalAmount;

          const res = await sdk.fetchCartCount();
          cartCount = res.fetchCartCount;
        }

        if (cartStore) {
          const groupedCart: FetchCartDetails = {
            customerDetails: {
              firstName: cartStore.customerDetails.firstName,
            },
            orderType: cartStore.orderType,
            delivery: cartStore.delivery,
            amounts: {
              subTotalAmount: cartStore.amounts.subTotalAmount,
              discountAmount: cartStore.amounts.discountAmount,
              discountPercent: cartStore.amounts.discountPercent,
              discountUpto: cartStore.amounts.discountUpto,
              tipPercent: cartStore.amounts.tipPercent,
            },
            pickUpDateAndTime: cartStore.pickUpDateAndTime,
            deliveryDateAndTime: cartStore.deliveryDateAndTime,
            discountString: cartStore.discountString,
            discountCode: cartStore.discountCode ?? "",
            giftCardCode: cartStore.giftCardCode ?? null,
            giftCardDiscountAmount: cartStore.giftCardDiscountAmount ?? null,
            loyaltyRedeemPoints: cartStore.loyaltyRedeemPoints ?? 0,
            loyaltyType: cartStore.loyaltyType ?? LoyaltyRedeemType.Discount,
            discountItemImage: cartStore.discountItemImage ?? null,
          };
          setCartDetails(groupedCart);

          // Check if we have a free item
          const freeItemObj = extractFreeDiscountItemDetails(
            groupedCart.discountString ?? "",
          );

          setFreeItemInCart(freeItemObj);

          setFreeItemImage(groupedCart.discountItemImage ?? null);

          if (freeItemObj) {
            // Set cart count including free item if it exists
            cartCount += 1;
          }

          setCartCountInfo(cartCount);
          setCartData(cartItems);
          setTotalAmount(cartTotal);

          // If cart count is 0, redirect to menu page
          if (cartCount === 0 && !freeItemObj) {
            setSpecialRemarks("");
            replace("/menu");
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsCartLoading(false);
      }
    };

    fetchCartDets();

    // Only for replace
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setCartCountInfo,
    setCartData,
    setCartDetails,
    setFreeItemInCart,
    setSpecialRemarks,
    setTotalAmount,
    stateChange,
  ]);

  useEffect(() => {
    // Calculating amounts
    const cartAmts = cartDetails?.amounts;

    if (!cartAmts) {
      return;
    }

    const taxRates = restaurantData?.taxRates ?? [];
    const taxPercent = taxRates.length > 0 ? taxRates[0].salesTax : 0;

    const finalAmts: TAmounts = {
      subTotalAmt: 0,
      discAmt: 0,
      netAmt: 0,
      taxAmt: 0,
      tipAmt: 0,
      platformFeeAmt: 0,
      deliveryFeeAmt: null,
      giftCardAmt: 0,
    };

    finalAmts.subTotalAmt = cartAmts.subTotalAmount ?? 0;

    // Check if gift card is applied - if so, discount should be 0
    const hasGiftCard = !!(
      cartDetails?.giftCardCode && cartDetails?.giftCardDiscountAmount
    );

    finalAmts.discAmt = hasGiftCard ? 0 : (cartAmts.discountAmount ?? 0);
    finalAmts.netAmt = parseFloat(
      (finalAmts.subTotalAmt - finalAmts.discAmt).toFixed(2),
    );
    finalAmts.taxAmt = parseFloat(
      ((taxPercent / 100) * finalAmts.netAmt).toFixed(2),
    );
    const tipP = (cartAmts.tipPercent ?? 0) / 100;

    finalAmts.tipAmt = parseFloat((tipP * finalAmts.subTotalAmt).toFixed(2));
    // Calculate processing fee with restaurant-specific or global config (same logic as backend)
    let feePercent = 0;
    let maxFeeAmount: number | null = null;

    // Check if restaurant has custom processing config
    if (
      processingConfig?.feePercent != null &&
      processingConfig.feePercent > 0
    ) {
      // Use restaurant-specific config
      feePercent = processingConfig.feePercent;
      maxFeeAmount = processingConfig.maxFeeAmount ?? null;
    }

    if (hasGiftCard) {
      // Calculate total without platform fees first
      const totalWithoutPlatformFee =
        finalAmts.netAmt +
        finalAmts.taxAmt +
        finalAmts.tipAmt +
        (finalAmts.deliveryFeeAmt ?? 0);

      // Git card amount capped at totalWithoutPlatformFee
      finalAmts.giftCardAmt = parseFloat(
        Math.min(
          cartDetails.giftCardDiscountAmount ?? 0,
          totalWithoutPlatformFee,
        ).toFixed(2),
      );

      // Remaining after gift card (before platform fee)
      const remainingAmount = parseFloat(
        (totalWithoutPlatformFee - finalAmts.giftCardAmt).toFixed(2),
      );

      if (remainingAmount > 0) {
        // Platform fee on SUBTOTAL (item total), not on remaining
        let calculatedPlatformFee = (feePercent / 100) * finalAmts.subTotalAmt;
        if (maxFeeAmount != null && calculatedPlatformFee > maxFeeAmount) {
          calculatedPlatformFee = maxFeeAmount;
        }
        const stripeCharge = parseFloat(
          (remainingAmount + calculatedPlatformFee).toFixed(2),
        );
        // Waive platform fee if fee >= stripe charge (all money goes to restaurant)
        if (calculatedPlatformFee >= stripeCharge) {
          finalAmts.platformFeeAmt = 0;
        } else {
          finalAmts.platformFeeAmt = parseFloat(
            calculatedPlatformFee.toFixed(2),
          );
        }
      } else {
        // Full coverage — no platform fee
        finalAmts.platformFeeAmt = 0;
      }
    } else {
      // No gift card — calculate platform fees on net amount (original logic unchanged)
      let calculatedPlatformFee = (feePercent / 100) * finalAmts.netAmt;
      if (maxFeeAmount != null && calculatedPlatformFee > maxFeeAmount) {
        calculatedPlatformFee = maxFeeAmount;
      }
      finalAmts.platformFeeAmt = parseFloat(calculatedPlatformFee.toFixed(2));
      finalAmts.giftCardAmt = 0;
    }

    finalAmts.deliveryFeeAmt = deliveryFee;

    setAmounts(finalAmts);

    // Total before gift card is subtracted
    const calculatedTotal =
      finalAmts.netAmt +
      finalAmts.taxAmt +
      finalAmts.tipAmt +
      finalAmts.platformFeeAmt +
      (finalAmts.deliveryFeeAmt ?? 0);
    setTotalAmount(calculatedTotal);
  }, [
    restaurantData,
    cartDetails,
    deliveryFee,
    processingConfig,
    freeItemInCart,
    setTotalAmount,
  ]);

  const handleProceedToCheckout = async () => {
    if (!amounts) return;
    setActionLoading(true);

    // Total before gift card deduction
    const total =
      amounts.subTotalAmt -
      amounts.discAmt +
      amounts.taxAmt +
      amounts.tipAmt +
      amounts.platformFeeAmt +
      (amounts.deliveryFeeAmt ?? 0);

    // Amount the user actually needs to pay after gift card deduction
    const amountToPay = parseFloat(
      Math.max(0, total - (amounts?.giftCardAmt ?? 0)).toFixed(2),
    );

    if (amountToPay === 0) {
      try {
        const input: CreateOrderWihoutPaymentInput = {
          discount: cartDetails?.giftCardCode
            ? {
                discountType: OrderDiscountType.Giftcard,
                giftCardCode: cartDetails.giftCardCode,
                giftCardAmount: cartDetails.giftCardDiscountAmount ?? undefined,
              }
            : cartDetails?.discountCode
              ? {
                  discountType: OrderDiscountType.Promo,
                  promoCode: cartDetails.discountCode,
                }
              : cartDetails?.loyaltyRedeemPoints
                ? {
                    discountType: OrderDiscountType.Loyalty,
                    loyaltyInput: {
                      loyaltyPointsRedeemed: cartDetails.loyaltyRedeemPoints,
                      redeemType:
                        cartDetails.loyaltyType || LoyaltyRedeemType.Discount,
                    },
                  }
                : null,
          guestCustomerDetails: customerData ?? null,
          specialRemark: specialRemarks || null,
        };

        const response = await fetchWithAuth(() =>
          sdk.createOrderWithoutPayment({
            createOrder: input,
          }),
        );

        if (response.createOrderWithoutPayment?.success) {
          replace(
            `/menu/redirect/free-order?orderId=${response.createOrderWithoutPayment.orderId}`,
          );
        }
      } catch (error) {
        setToastData({
          type: "error",
          message: extractErrorMessage(error),
        });
      } finally {
        setActionLoading(false);
      }
    } else {
      push("/menu/checkout");
    }
  };

  const handleCloseGuestModal = async () => {
    setShowGuestModal(false);

    try {
      // Reset OTP verification so user must verify again
      setIsOtpVerified(false);

      // Refresh cart data to reflect removal
      setStateChange((prev) => !prev);
    } catch (error) {
      console.log("Error removing offer on modal close:", error);
    }
  };

  const total =
    (amounts?.subTotalAmt ?? 0) -
    (amounts?.discAmt ?? 0) +
    (amounts?.taxAmt ?? 0) +
    (amounts?.tipAmt ?? 0) +
    (amounts?.platformFeeAmt ?? 0) +
    (amounts?.deliveryFeeAmt ?? 0);

  // The amount the user actually needs to pay after gift card deduction
  const amountToPay = parseFloat(
    Math.max(0, total - (amounts?.giftCardAmt ?? 0)).toFixed(2),
  );

  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-col justify-between items-center">
      <div className="flex-1 w-full h-full relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
        {/* Left Side */}
        <div className="col-span-1 lg:col-span-6 w-full lg:h-fit lg:sticky lg:top-0 lg:z-10 bg-white">
          <CartHeader text={"Back to Menu"} route="/menu" />
          <p className="mb-5 block  font-subheading-oo font-semibold text-xl px-6">
            Cart items ({cartCountInfo})
          </p>
          <CartItems
            refreshData={() => setStateChange((prev) => !prev)}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
          <div className="px-6 mt-2">
            <button
              onClick={() => push("/menu")}
              className="w-full py-2.5 border border-gray-300 rounded-md text-gray-700 font-subheading-oo font-semibold text-sm hover:bg-gray-50 transition-all duration-200"
            >
              + Add more items
            </button>
          </div>
          <hr className="mx-6 my-6 lg:my-4 pb-2 border-gray-200" />
          <CartRemarks />
        </div>

        {/* Spacer */}
        <div className="lg:block hidden col-span-1"></div>

        {/* Right Side */}
        <div className="col-span-1 lg:col-span-5 w-full h-auto lg:mt-6">
          {(restaurantData?.restaurantConfigs?.allowTips ?? false) ? (
            <>
              <CartTips
                refreshData={() => setStateChange((prev) => !prev)}
                disabled={
                  (cartData.length === 0 && freeItemInCart !== null) ||
                  (amounts !== null && amounts.netAmt <= 0)
                }
              />
              {!cartDetails?.amounts.subTotalAmount ||
              cartDetails?.amounts.subTotalAmount === 0 ? null : (
                <hr className="mx-6 my-5 border-gray-200" />
              )}
            </>
          ) : null}
          <CartOffers
            loyaltyRule={loyaltyRule}
            loyaltyOffers={loyaltyOffers}
            amounts={amounts}
            refreshData={() => setStateChange((prev) => !prev)}
          />
          <hr className="mx-6 my-5 border-gray-200" />
          <CartBreakdown
            amounts={amounts}
            loyaltyRule={loyaltyRule}
            totalRef={totalRef}
          />
          {/* <div className="mb-12 lg:hidden" /> */}
          <div
            className={`px-6 w-full my-2 ${isTotalVisible ? "block" : "hidden lg:block"}`}
          >
            <p className="text-sm text-green-700 font-medium font-subheading-oo mb-3">
              You&apos;re saving up to $
              {((amounts?.subTotalAmt ?? 0) * 0.25).toFixed(2)} by ordering
              directly instead of third-party delivery apps
            </p>
            <button
              disabled={
                actionLoading ||
                isCartLoading
              }
              onClick={() => {
                if (amountToPay === 0 && !meCustomerData && !isOtpVerified) {
                  setShowGuestModal(true);
                } else {
                  handleProceedToCheckout();
                }
              }}
              className="w-full bg-primary py-2 rounded-md hover:bg-opacity-90 transition-all duration-200 font-subheading-oo font-semibold disabled:opacity-50"
              style={{
                color: isContrastOkay(
                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                )
                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  : Env.NEXT_PUBLIC_TEXT_COLOR,
              }}
            >
              {isCartLoading
                ? "Loading cart..."
                : actionLoading
                  ? "Processing..."
                  : (amountToPay === 0 && !meCustomerData && !isOtpVerified)
                    ? "Place Order"
                    : amountToPay === 0
                      ? "Place Order"
                      : "Continue to Payment"}
            </button>
          </div>
          <br />
        </div>
      </div>

      {/* Floating Button - hidden when actual total is in view */}
      {!isTotalVisible && (
        <div className="block lg:hidden sticky w-full bottom-0 right-0 left-0 px-6 py-4 bg-white border-t z-20">
          <div className="flex justify-between items-center mb-1 font-subheading-oo font-semibold">
            <span className="text-base ">Order Total</span>
            <span className="text-base ">${amountToPay.toFixed(2)}</span>
          </div>
          <p className="text-xs text-green-700 font-subheading-oo font-semibold mb-3">
            You&apos;re saving up to $
            {((amounts?.subTotalAmt ?? 0) * 0.25).toFixed(2)} by ordering
            directly instead of third-party delivery apps
          </p>
          <button
            disabled={
              actionLoading ||
              isCartLoading
            }
            onClick={() => {
              if (amountToPay === 0 && !meCustomerData && !isOtpVerified) {
                setShowGuestModal(true);
              } else {
                handleProceedToCheckout();
              }
            }}
            className="w-full bg-primary py-2 rounded-md hover:bg-opacity-90 transition-all duration-200 font-subheading-oo font-semibold disabled:opacity-50"
            style={{
              color: isContrastOkay(
                Env.NEXT_PUBLIC_PRIMARY_COLOR,
                Env.NEXT_PUBLIC_BACKGROUND_COLOR,
              )
                ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                : Env.NEXT_PUBLIC_TEXT_COLOR,
            }}
          >
            {isCartLoading
              ? "Loading cart..."
              : actionLoading
                ? "Processing..."
                : (amountToPay === 0 && !meCustomerData && !isOtpVerified)
                  ? "Place Order"
                  : amountToPay === 0
                    ? "Place Order"
                    : "Continue to Payment"}
          </button>
        </div>
      )}

      {/* Edit Item Modal */}
      <AnimatePresence>
        {isEditing && editingItem && (
          <ItemEditScreen
            item={editingItem}
            onClose={() => setIsEditing(false)}
            refreshData={() => setStateChange((prev) => !prev)}
          />
        )}
      </AnimatePresence>

      {/* Guest Modal */}
      <AnimatePresence>
        {showGuestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4"
            onClick={handleCloseGuestModal}
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
                    onClick={handleCloseGuestModal}
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
                  isOtpVerified={isOtpVerified}
                  setIsOtpVerified={setIsOtpVerified}
                  setPlaceOrderError={setPlaceOrderError}
                  amounts={amounts}
                  loyaltyRule={loyaltyRule}
                  refreshData={() => setStateChange((prev) => !prev)}
                  onPromoCodeRemoved={(msg) => {
                    setShowGuestModal(false);
                    setTimeout(() => {
                      setPromoRemovedMsg(msg);
                      setIsOtpVerified(false);
                    }, 500);
                  }}
                  onProceedBtn={async () => {
                    await handleProceedToCheckout();
                  }}
                  proceedLoading={actionLoading}
                  proceedBtnText={amountToPay === 0 ? "Place Order" : "Continue to Payment"}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promo Removed Notice Modal */}
      <AnimatePresence>
        {promoRemovedMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setPromoRemovedMsg(null)}
          >
            <motion.div
              variants={fadeIn("up", "tween", 0, 0.25)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="bg-white w-full sm:max-w-md rounded-md shadow-xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b shrink-0">
                <h3 className="text-xl font-semibold text-gray-900 font-subheading-oo">
                  Offer Not Applicable
                </h3>
                <button
                  onClick={() => setPromoRemovedMsg(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                  aria-label="Close modal"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 font-body-oo text-base leading-relaxed">
                  {promoRemovedMsg}
                </p>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setPromoRemovedMsg(null)}
                    className="bg-primary text-white font-subheading-oo font-semibold py-2 px-6 rounded-md hover:bg-opacity-90 transition-all cursor-pointer"
                    style={{
                      color: isContrastOkay(
                        Env.NEXT_PUBLIC_PRIMARY_COLOR,
                        Env.NEXT_PUBLIC_BACKGROUND_COLOR,
                      )
                        ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                        : Env.NEXT_PUBLIC_TEXT_COLOR,
                    }}
                  >
                    Okay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;