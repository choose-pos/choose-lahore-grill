"use client";
import CustomerVerification from "@/components/checkout/CustomerVerification";
import { Env } from "@/env";
import { LoyaltyRedeemType } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import meCustomerStore from "@/store/meCustomer";
import RestaurantStore from "@/store/restaurant";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { refreshCart } from "@/utils/refreshCart";
import {
  CustomerRestaurant,
  FetchCartDetails,
  RestaurantRedeemOffers,
  TAmounts,
} from "@/utils/types";
import { extractFreeDiscountItemDetails } from "@/utils/UtilFncs";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CartBreakdown from "../../cart/_components/CartBreakdown";
import CartHeader from "../../cart/_components/CartHeader";
import CartOrderType from "../../cart/_components/CartOrderType";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import CheckoutStripeForm from "./StripeForm";

interface ICheckoutPageProps {
  restaurantInfo: CustomerRestaurant;
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  loyaltyOffers: RestaurantRedeemOffers | null;
  platformFee: number;
  deliveryFee: number | null;
  stripeId: string;
}

const CheckoutPage = ({
  loyaltyRule,
  restaurantInfo,
  deliveryFee,
  platformFee,
  stripeId,
}: ICheckoutPageProps) => {
  // Configs
  const { replace, push } = useRouter();
  const stripePromise = loadStripe(Env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: stripeId,
  });
  const stripeFormRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

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
  const { meCustomerData, setMeCustomerData } = meCustomerStore();

  // States
  const [stateChange, setStateChange] = useState<boolean>(false);
  const [amounts, setAmounts] = useState<TAmounts | null>(null);
  const [discountData, setDiscountData] = useState<{
    discountCode?: string | null;
    loyaltyPointsRedeemed?: number | null;
    loyaltyType?: LoyaltyRedeemType | null;
  } | null>(null);
  const [placeOrderError, setPlaceOrderError] = useState<string>();
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

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
      try {
        const [cartCountReq, cartStoreReq, cartItemsReq, cartTotalReq] =
          await Promise.all([
            sdk.fetchCartCount(),
            sdk.fetchCartDetails(),
            refreshCart(),
            sdk.CalculateFinalAmount(),
          ]);

        let cartCount = cartCountReq.fetchCartCount;
        const cartStore = cartStoreReq.fetchCartDetails;
        const cartItems = cartItemsReq.groupedCart;
        const cartTotal = cartTotalReq.calculateFinalAmount;

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

          setDiscountData({
            discountCode: cartStore.discountCode,
            loyaltyPointsRedeemed: cartStore.loyaltyRedeemPoints,
            loyaltyType: cartStore.loyaltyType,
          });

          // If cart count is 0, redirect to menu page
          if (cartCount === 0) {
            setSpecialRemarks("");
            replace("/menu");
          }
        }
      } catch (error) {
        console.log(error);
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
    finalAmts.discAmt =
      freeItemInCart !== null ? 0 : (cartAmts.discountAmount ?? 0);
    finalAmts.netAmt = parseFloat(
      (finalAmts.subTotalAmt - finalAmts.discAmt).toFixed(2)
    );
    finalAmts.taxAmt = parseFloat(
      ((taxPercent / 100) * finalAmts.netAmt).toFixed(2)
    );
    finalAmts.tipAmt = parseFloat(
      (((cartAmts.tipPercent ?? 0) / 100) * finalAmts.subTotalAmt).toFixed(2)
    );
    finalAmts.platformFeeAmt = parseFloat(
      ((platformFee / 100) * finalAmts.netAmt).toFixed(2)
    );
    finalAmts.deliveryFeeAmt = deliveryFee;

    setAmounts(finalAmts);
  }, [restaurantData, cartDetails, deliveryFee, platformFee, freeItemInCart]);

  return (
    <div className="w-full h-full min-h-screen bg-white flex flex-col justify-between items-center mb-1">
      <div className="flex-1 w-full h-full relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-6">
        {/* Left Side */}
        <div className="col-span-1 lg:col-span-6 w-full h-full">
          <CartHeader text={"Back to Cart"} route={"/menu/cart"} />
          {!meCustomerData ? (
            <>
              <div className="px-6">
                <CustomerVerification
                  isOtpVerified={isOtpVerified}
                  setIsOtpVerified={setIsOtpVerified}
                  setPlaceOrderError={setPlaceOrderError}
                  amounts={amounts}
                  loyaltyRule={loyaltyRule}
                />
              </div>
              <hr className="mx-6 my-4 lg:my-6" />
            </>
          ) : null}

          <div className="px-6">
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
                      Env.NEXT_PUBLIC_PRIMARY_COLOR
                    )
                      ? Env.NEXT_PUBLIC_PRIMARY_COLOR
                      : "#000000",
                  },
                },
              }}
            >
              <CheckoutStripeForm
                ref={stripeFormRef}
                discountData={discountData}
                placeOrderLoading={placeOrderLoading}
                setPlaceOrderLoading={setPlaceOrderLoading}
                placeOrderErrorMessage={placeOrderError}
                setPlaceOrderErrorMessage={setPlaceOrderError}
                refreshData={() => setStateChange((prev) => !prev)}
                setIsOtpVerified={setIsOtpVerified}
              />
            </Elements>
          </div>

          <br />
        </div>

        {/* Spacer */}
        <div className="lg:block hidden col-span-1"></div>

        {/* Right Side */}
        <div className="col-span-1 lg:col-span-5 w-full lg:rounded-xl lg:border">
          <br className="hidden lg:block" />

          <CartOrderType />
          <hr className="mx-6 my-4 lg:my-6" />

          <CheckoutOrderSummary />
          <hr className="mx-6 my-4 lg:my-6" />

          <p
            ref={errorRef}
            className={`mt-2 mb-4 p-3 mx-6 bg-red-100 text-red-700 rounded ${
              (placeOrderError ?? "").length > 0 ? "block" : "hidden"
            }`}
          >
            {placeOrderError}
          </p>

          <CartBreakdown amounts={amounts} loyaltyRule={loyaltyRule} />
          <div className="mb-12 lg:hidden" />
          <div className="px-6 w-full my-2 hidden lg:block">
            <button
              onClick={() => {
                if (stripeFormRef.current) {
                  stripeFormRef.current.click();
                  errorRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }
              }}
              disabled={
                placeOrderLoading || (!meCustomerData && !isOtpVerified)
              }
              className="w-full bg-primary mt-2 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all duration-200 font-online-ordering disabled:opacity-50"
              style={{
                color: isContrastOkay(
                  Env.NEXT_PUBLIC_PRIMARY_COLOR,
                  Env.NEXT_PUBLIC_BACKGROUND_COLOR
                )
                  ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  : Env.NEXT_PUBLIC_TEXT_COLOR,
              }}
            >
              {placeOrderLoading ? "Processing..." : "Place Order"}
            </button>
          </div>
          <br />
        </div>

        {/* Floating Button */}
        <div className="block lg:hidden sticky w-full bottom-0 right-0 left-0 px-6 py-4 bg-white border-t">
          <button
            onClick={() => {
              if (stripeFormRef.current) {
                stripeFormRef.current.click();
              }
            }}
            disabled={placeOrderLoading || (!meCustomerData && !isOtpVerified)}
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
            {placeOrderLoading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
