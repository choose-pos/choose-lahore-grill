import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCartStore } from "@/store/cart";
import meCustomerStore from "@/store/meCustomer";
import RestaurantStore from "@/store/restaurant";
import { TAmounts } from "@/utils/types";
import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";

interface ICartBreakdownProps {
  amounts: TAmounts | null;
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
  totalRef?: React.Ref<HTMLDivElement>;
}

const CartBreakdown = ({
  amounts,
  loyaltyRule,
  totalRef,
}: ICartBreakdownProps) => {
  // Stores
  const { restaurantData } = RestaurantStore();
  const { cartDetails, totalAmount } = useCartStore();
  const { meCustomerData } = meCustomerStore();

  // States
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!amounts) {
    return null;
  }

  return (
    <div className="px-6 font-body-oo font-normal">
      {meCustomerData !== null && amounts.netAmt > 0 && loyaltyRule !== null ? (
        <p className="text-sm text-gray-600 mb-2">
          {`You'll earn`}{" "}
          <span className="font-semibold">
            {Math.round(amounts.netAmt) * 10} {loyaltyRule?.name}
          </span>{" "}
          {`on this order.`}
        </p>
      ) : null}

      <div className="flex justify-between mb-3">
        <span className="text-base md:text-lg font-body-oo font-medium">
          Subtotal
        </span>
        <span className="text-base md:text-lg font-medium font-subheading-oo">
          ${amounts.subTotalAmt.toFixed(2)}
        </span>
      </div>

      {amounts.discAmt > 0 && !cartDetails?.giftCardCode ? (
        <>
          <div className="flex justify-between mb-3 text-green-600">
            <span className="text-base md:text-lg font-body-oo font-medium">
              Discount
            </span>
            <span className="text-base md:text-lg font-medium font-subheading-oo">
              -${amounts.discAmt.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between mb-3 text-gray-800">
            <span className="text-base md:text-lg font-body-oo font-medium">
              Net Total
            </span>
            <span className="text-base md:text-lg font-medium font-subheading-oo">
              ${amounts.netAmt.toFixed(2)}
            </span>
          </div>
        </>
      ) : null}

      <div className="flex justify-between mb-3">
        <div className="flex justify-start items-center">
          <span className="text-base md:text-lg font-body-oo font-medium mr-2">
            Taxes & Fees
          </span>
          <TooltipProvider delayDuration={0}>
            <Tooltip open={tooltipOpen}>
              <TooltipTrigger>
                <FiInfo
                  size={18}
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  onMouseEnter={() => setTooltipOpen(true)}
                  onMouseLeave={() => setTooltipOpen(false)}
                  onTouchStart={() => setTooltipOpen((prev) => !prev)}
                />
              </TooltipTrigger>
              <TooltipContent className="bg-gray-200 text-gray-700 p-3 rounded shadow-lg w-40 text-sm z-50">
                <div className="space-y-2">
                  <div className="flex space-x-1 items-center">
                    <span className="font-normal text-gray-600 font-body-oo">
                      Tax:
                    </span>
                    <span className="font-medium font-subheading-oo">
                      ${amounts.taxAmt.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex space-x-1 items-center">
                    <span className="font-normal text-gray-600 font-body-oo">
                      Platform fees:
                    </span>
                    <span className="font-medium font-subheading-oo">
                      ${amounts.platformFeeAmt.toFixed(2)}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-base md:text-lg font-medium font-subheading-oo">
          ${(amounts.taxAmt + amounts.platformFeeAmt).toFixed(2)}
        </span>
      </div>

      {(restaurantData?.restaurantConfigs?.allowTips ?? false) ? (
        <div className="flex justify-between mb-3">
          <span className="text-base md:text-lg font-body-oo font-medium">
            {[10, 15, 20].includes(cartDetails?.amounts?.tipPercent ?? 0)
              ? `Tip (${cartDetails?.amounts?.tipPercent ?? 0}%)`
              : "Tip"}
          </span>
          <span className="text-base md:text-lg font-medium font-subheading-oo">
            ${amounts.tipAmt.toFixed(2)}
          </span>
        </div>
      ) : null}

      {(amounts.deliveryFeeAmt ?? 0) > 0 ? (
        <div className="flex justify-between mb-3">
          <span className="text-base md:text-lg font-body-oo font-medium">
            Delivery Fee
          </span>
          <span className="text-base md:text-lg font-medium font-subheading-oo">
            ${amounts.deliveryFeeAmt?.toFixed(2)}
          </span>
        </div>
      ) : null}

      <hr className="my-4 lg:my-6 border-gray-200" />

      <div ref={totalRef} className="flex justify-between items-center pb-2">
        <span className="text-lg md:text-xl font-body-oo font-semibold text-gray-900">
          Total
        </span>
        <span className="text-lg md:text-xl font-semibold font-subheading-oo text-gray-900">
          ${totalAmount.toFixed(2)}
        </span>
      </div>
      {/* Gift Card - shown AFTER total */}
      {cartDetails?.giftCardCode && cartDetails?.giftCardDiscountAmount ? (
        <>
          <div className="flex justify-between mt-3 text-green-600">
            <span className="text-base md:text-lg font-body-oo font-medium">
              Gift Card Applied
            </span>
            <span className="text-base md:text-lg font-medium font-subheading-oo">
              -$
              {Math.min(
                cartDetails.giftCardDiscountAmount,
                totalAmount,
              ).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <span className="text-lg md:text-xl font-body-oo font-semibold text-gray-900">
              Amount to Pay
            </span>
            <span className="text-lg md:text-xl font-semibold font-subheading-oo text-gray-900">
              $
              {Math.max(
                0,
                totalAmount -
                  Math.min(cartDetails.giftCardDiscountAmount, totalAmount),
              ).toFixed(2)}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CartBreakdown