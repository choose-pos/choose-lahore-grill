"use client";
import ItemEditScreen from "@/components/cart/ItemEditScreen";
import { Env } from "@/env";
import {
  CreateOrderWihoutPaymentInput,
  LoyaltyRedeemType,
  OrderDiscountType,
} from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import CustomerDataStore from "@/store/customerData";
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
import { extractErrorMessage, extractFreeDiscountItemDetails } from "@/utils/UtilFncs";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CartBreakdown from "./CartBreakdown";
import CartHeader from "./CartHeader";
import CartItems from "./CartItems";
import CartOffers from "./CartOffers";
import CartOrderType from "./CartOrderType";
import CartRemarks from "./CartRemarks";
import CartTips from "./CartTips";
import { useModalStore } from "@/store/global";

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
  const {
    cartCountInfo,
    cartDetails,
    freeItemInCart,
    setCartCountInfo,
    setCartData,
    setCartDetails,
    setFreeItemInCart,
    setFreeItemImage,
    setSpecialRemarks,
    setTotalAmount,
  } = useCartStore();
  const { setMeCustomerData } = meCustomerStore();
  const { setShowMenu } = useModalStore();

  // States
  const [stateChange, setStateChange] = useState<boolean>(false);
  const [amounts, setAmounts] = useState<TAmounts | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GroupedCartItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { customerData } = CustomerDataStore();
  const { setToastData } = ToastStore();
  const { specialRemarks } = useCartStore();
  const [isCartLoading, setIsCartLoading] = useState<boolean>(true);

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
            loyaltyRedeemPoints: cartStore.loyaltyRedeemPoints ?? 0,
            loyaltyType: cartStore.loyaltyType ?? LoyaltyRedeemType.Discount,
            discountItemImage: cartStore.discountItemImage ?? null,
          };
          setCartDetails(groupedCart);

          // Check if we have a free item
          const freeItemObj = extractFreeDiscountItemDetails(
            groupedCart.discountString ?? ""
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
    };

    finalAmts.subTotalAmt = cartAmts.subTotalAmount ?? 0;
     finalAmts.discAmt = cartAmts.discountAmount ?? 0;
    finalAmts.netAmt = parseFloat(
      (finalAmts.subTotalAmt - finalAmts.discAmt).toFixed(2)
    );
    finalAmts.taxAmt = parseFloat(
      ((taxPercent / 100) * finalAmts.netAmt).toFixed(2)
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

    // Calculate fee
    let calculatedPlatformFee = (feePercent / 100) * finalAmts.netAmt;

    // Cap to max amount if specified
    if (maxFeeAmount != null && calculatedPlatformFee > maxFeeAmount) {
      calculatedPlatformFee = maxFeeAmount;
    }
    finalAmts.platformFeeAmt = parseFloat(calculatedPlatformFee.toFixed(2));
    finalAmts.deliveryFeeAmt = deliveryFee;

    setAmounts(finalAmts);
  }, [restaurantData, cartDetails, deliveryFee, processingConfig, freeItemInCart]);

  const handleProceedToCheckout = async () => {
    if (!amounts) return;
    setActionLoading(true);
    // Calculate total amount
    const total =
      amounts.subTotalAmt -
      amounts.discAmt +
      amounts.taxAmt +
      amounts.tipAmt +
      amounts.platformFeeAmt +
      (amounts.deliveryFeeAmt ?? 0);

    if (total === 0) {
      try {
        const input: CreateOrderWihoutPaymentInput = {
          discount: cartDetails?.discountCode
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
          guestCustomerDetails:
            !customerData && customerData ? customerData : null,
          specialRemark: specialRemarks || null,
        };

        const response = await fetchWithAuth(() =>
          sdk.createOrderWithoutPayment({
            createOrder: input,
          })
        );

        if (response.createOrderWithoutPayment?.success) {
          replace(
            `/menu/redirect/free-order?orderId=${response.createOrderWithoutPayment.orderId}`
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

  const total =
    (amounts?.subTotalAmt ?? 0) -
    (amounts?.discAmt ?? 0) +
    (amounts?.taxAmt ?? 0) +
    (amounts?.tipAmt ?? 0) +
    (amounts?.platformFeeAmt ?? 0) +
    (amounts?.deliveryFeeAmt ?? 0);

  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-col justify-between items-center">
      <div className="flex-1 w-full h-full relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6">
        {/* Left Side */}
        <div className="col-span-1 lg:col-span-6 w-full lg:h-fit lg:sticky lg:top-0">
          <CartHeader text={"Back to Menu"} route="/menu" />
          <p className="mb-2 block font-semibold font-online-ordering text-xl px-6">
            Cart items ({cartCountInfo})
          </p>
          <CartItems
            refreshData={() => setStateChange((prev) => !prev)}
            editingItem={editingItem}
            setEditingItem={setEditingItem}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
          <hr className="mx-6 mt-2 lg:mt-12" />
          <CartRemarks />
        </div>

        {/* Spacer */}
        <div className="lg:block hidden col-span-1"></div>

        {/* Right Side */}
        <div className="col-span-1 lg:col-span-5 w-full h-auto border border-b-0">
          <br />

          <CartOrderType />
          <hr className="mx-6 my-4 lg:my-6" />
          {(restaurantData?.restaurantConfigs?.allowTips ?? false) ? (
            <>
              <CartTips refreshData={() => setStateChange((prev) => !prev)} />
              {!cartDetails?.amounts.subTotalAmount ||
              cartDetails?.amounts.subTotalAmount === 0 ? null : (
                <hr className="mx-6 my-4 lg:my-6" />
              )}
            </>
          ) : null}
          <CartOffers
            loyaltyRule={loyaltyRule}
            loyaltyOffers={loyaltyOffers}
            amounts={amounts}
            refreshData={() => setStateChange((prev) => !prev)}
          />
          <hr className="mx-6 my-4 lg:my-6" />
          <CartBreakdown amounts={amounts} loyaltyRule={loyaltyRule} />
          <div className="mb-12 lg:hidden" />
          <div className="px-6 w-full my-2 hidden lg:block">
            <button
              // onClick={() => {
              //   push("/menu/checkout");
              // }}
              disabled={actionLoading || isCartLoading}
              onClick={handleProceedToCheckout}
              className="w-full bg-primary py-2 rounded-full font-medium hover:bg-opacity-90 transition-all duration-200 font-online-ordering disabled:opacity-50"
              style={{
                color: isContrastOkay(
                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  Env.NEXT_PUBLIC_BACKGROUND_COLOR
                )
                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  : Env.NEXT_PUBLIC_TEXT_COLOR,
              }}
            >
              {isCartLoading
                ? "Loading cart..."
                : actionLoading
                ? "Processing..."
                : total === 0
                  ? "Place Order"
                  : "Continue to Payment"}
            </button>
          </div>
          <br />
        </div>
      </div>

      {/* Floating Button */}

      <div className="block lg:hidden sticky w-full bottom-0 right-0 left-0 px-6 py-4 bg-white border-t">
        <button
          // onClick={() => {
          //   push("/menu/checkout");
          // }}
          disabled={actionLoading || isCartLoading}
          onClick={handleProceedToCheckout}
          className="w-full bg-primary py-2 rounded-full font-medium hover:bg-opacity-90 transition-all duration-200 font-online-ordering disabled:opacity-50"
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR
            )
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : Env.NEXT_PUBLIC_TEXT_COLOR,
          }}
        >
          {isCartLoading
            ? "Loading cart..."
            : actionLoading
            ? "Processing..."
            : total === 0
              ? "Place Order"
              : "Continue to Payment"}
        </button>
      </div>

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
    </div>
  );
};

export default CartPage;
