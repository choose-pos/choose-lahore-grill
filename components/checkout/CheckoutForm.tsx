import { Env } from "@/env";
import { CreateOrderInput } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import CustomerDataStore from "@/store/customerData";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { refreshCart } from "@/utils/refreshCart";
import { extractErrorMessage } from "@/utils/UtilFncs";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import React, { FormEvent, useState } from "react";

interface CheckoutFormProps {
  OrderData: CreateOrderInput;
  signIn: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  OrderData,
  signIn,
}) => {
  const { setToastData } = ToastStore();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { customerData } = CustomerDataStore();
  const { setCartData, setCartCountInfo, cartData, cartDetails } =
    useCartStore();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    if (cartData.length === 0) {
    } else {
      if (!stripe || !elements) {
        return;
      }

      if (!signIn && !customerData?.otp) {
        return;
      }

      if (!signIn && (customerData?.otp ?? "").length !== 6) {
        return;
      }

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(
          extractErrorMessage(submitError.message) ||
            "Error validating payment details"
        );
        return;
      }

      try {
        // Create the PaymentIntent and obtain clientSecret from your server endpoint
        const response = await sdk.CreateCheckoutPaymentIntent({});

        if (!response.createCheckoutPaymentIntent) {
          setToastData({
            type: "error",
            message:
              "Something went wrong while processing your payment, please try again after sometime.",
          });
          return;
        }

        const clientSecret = response.createCheckoutPaymentIntent.cs;
        const intententId = response.createCheckoutPaymentIntent.id;
        const userHash = getOrCreateUserHash();

        const formattedOrderDatawitId: CreateOrderInput = {
          ...OrderData,
          paymentIntentId: intententId,
          visitorHash: userHash,
        };
        try {
          await fetchWithAuth(() => sdk.meCustomer());
        } catch (error) {
          console.log(error);
        }

        const resp = await fetchWithAuth(() =>
          sdk.CreateOrder({
            createOrder: formattedOrderDatawitId,
          })
        );

        if (resp.createOrder.message) {
          setToastData({
            message: resp.createOrder.message,
            type: "success",
          });
        }

        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${Env.NEXT_PUBLIC_DOMAIN}/menu/redirect/payment-status?orderId=${resp.createOrder.orderId}`,
          },
        });

        if (error) {
          setErrorMessage(
            extractErrorMessage(error.message) ||
              "An error occurred while processing your payment"
          );
           try {
            const j = sdk.handleOrderCreationFailure({
              orderId: resp.createOrder.orderId ?? "",
              error: error.message
                ? extractErrorMessage(error.message)
                : "An error occurred while processing your payment",
            });
          } catch (e) {
            console.warn(e, "Failed to handle Order Creation failure");
          }
          return;
        }
      } catch (err) {
        const { groupedCart } = await refreshCart();
        if (groupedCart.length > 0) {
          setCartData(groupedCart);
          const totalQty = groupedCart.reduce((acc, item) => acc + item.qty, 0);
          setCartCountInfo(totalQty);
        }

        if (extractErrorMessage(err) == "TypeError: Failed to fetch")
          setErrorMessage("Something went wrong, please try again later.");
        else {
          setErrorMessage(extractErrorMessage(err));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {cartData.length > 0 && <PaymentElement />}
      <button
        type="submit"
        disabled={
          isLoading ||
          !stripe ||
          !elements ||
          (!signIn ? (customerData?.otp ?? "").length !== 6 : false)
        }
        className="px-4 py-2  bg-primary text-white rounded-full disabled:opacity-50 mt-5 w-full max-w-lg font-online-ordering"
        style={{
          color: isContrastOkay(
            Env.NEXT_PUBLIC_PRIMARY_COLOR,
            Env.NEXT_PUBLIC_BACKGROUND_COLOR
          )
            ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
            : Env.NEXT_PUBLIC_TEXT_COLOR,
        }}
      >
        {isLoading
          ? "Processing..."
          : cartData.length > 0
            ? "Pay"
            : "Place Order"}
      </button>
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded max-w-[500px] overflow-hidden">
          {extractErrorMessage(errorMessage)}
        </div>
      )}
    </form>
  );
};

export default CheckoutForm;
