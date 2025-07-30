import { Env } from "@/env";
import {
  CreateOrderInput,
  LoyaltyRedeemType,
  OrderDiscountType,
} from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import CustomerDataStore from "@/store/customerData";
import meCustomerStore from "@/store/meCustomer";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { FormEvent, forwardRef } from "react";

interface ICheckoutStripeFormProps {
  setPlaceOrderLoading: (value: boolean) => void;
  placeOrderLoading: boolean;

  setPlaceOrderErrorMessage: (value?: string) => void;
  placeOrderErrorMessage?: string;

  discountData: {
    discountCode?: string | null;
    loyaltyPointsRedeemed?: number | null;
    loyaltyType?: LoyaltyRedeemType | null;
  } | null;

  refreshData: () => void;

  setIsOtpVerified: (value: boolean) => void;
}

const CheckoutStripeForm = forwardRef<
  HTMLButtonElement,
  ICheckoutStripeFormProps
>(
  (
    {
      placeOrderErrorMessage,
      setPlaceOrderErrorMessage,
      setPlaceOrderLoading,
      discountData,
      refreshData,
      setIsOtpVerified,
    },
    ref
  ) => {
    // Configs
    const {} = useRouter();
    const stripe = useStripe();
    const elements = useElements();

    // Stores
    const { setToastData } = ToastStore();
    const { cartData, specialRemarks } = useCartStore();
    const { meCustomerData } = meCustomerStore();
    const { customerData } = CustomerDataStore();

    // Handlers
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setPlaceOrderLoading(true);
      setPlaceOrderErrorMessage(undefined);

      if (!stripe || !elements) {
        setPlaceOrderLoading(false);
        return;
      }

      if (!meCustomerData && (customerData?.otp ?? "").length !== 6) {
        setPlaceOrderLoading(false);
        return;
      }

      const { error: submitError } = await elements.submit();

      if (submitError) {
        setPlaceOrderErrorMessage(
          extractErrorMessage(submitError.message) ||
            "Error validating payment details"
        );
        setPlaceOrderLoading(false);
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

        const formattedOrderDatawitId: CreateOrderInput = {
          paymentIntentId: intententId,
          discount:
            discountData !== null
              ? (discountData.discountCode ?? "").length > 0
                ? {
                    discountType: OrderDiscountType.Promo,
                    promoCode: discountData.discountCode,
                  }
                : (discountData.loyaltyPointsRedeemed ?? 0) > 0
                ? {
                    discountType: OrderDiscountType.Loyalty,
                    loyaltyInput: {
                      loyaltyPointsRedeemed:
                        discountData.loyaltyPointsRedeemed ?? 0,
                      redeemType:
                        discountData.loyaltyType ?? LoyaltyRedeemType.Discount,
                    },
                  }
                : null
              : null,
          guestCustomerDetails:
            meCustomerData === null && customerData !== null
              ? customerData
              : null,
          specialRemark: specialRemarks.length > 0 ? specialRemarks : null,
        };

        const resp = await fetchWithAuth(() =>
          sdk.CreateOrder({
            createOrder: formattedOrderDatawitId,
          })
        );

        if (resp.createOrder.message && resp.createOrder.success === false) {
          setToastData({
            message: resp.createOrder.message,
            type: "error",
          });
          setPlaceOrderErrorMessage(resp.createOrder.message);
          setIsOtpVerified(false);
          return;
        }

        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${Env.NEXT_PUBLIC_DOMAIN}/menu/redirect/payment-status?orderId=${resp.createOrder.orderId}`,
          },
        });

        if (error) {
          setPlaceOrderErrorMessage(
            extractErrorMessage(error.message) ||
              "An error occurred while processing your payment"
          );
          return;
        }

        if (resp.createOrder.message) {
          setToastData({
            message: resp.createOrder.message,
            type: "success",
          });
        }
      } catch (err) {
        refreshData();

        if (extractErrorMessage(err) == "TypeError: Failed to fetch")
          setPlaceOrderErrorMessage(
            "Something went wrong, please try again later."
          );
        else {
          setPlaceOrderErrorMessage(extractErrorMessage(err));
        }
      } finally {
        setPlaceOrderLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <h2 className="mb-4 font-online-ordering text-xl capitalize">
          Payment Details
        </h2>
        {cartData.length > 0 && <PaymentElement />}
        <button ref={ref} type="submit" className="hidden sr-only">
          Pay Now
        </button>
        <br />
      </form>
    );
  }
);

CheckoutStripeForm.displayName = "CheckoutStripeForm";

export default CheckoutStripeForm;
