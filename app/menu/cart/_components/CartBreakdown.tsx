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
import { useState } from "react";
import { FiInfo } from "react-icons/fi";

interface ICartBreakdownProps {
  amounts: TAmounts | null;
  loyaltyRule: { value: number; name: string; signUpValue: number } | null;
}

const CartBreakdown = ({ amounts, loyaltyRule }: ICartBreakdownProps) => {
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
    <div className="px-6 font-online-ordering">
      {meCustomerData !== null && amounts.netAmt > 0 && loyaltyRule !== null ? (
        <p className="text-sm text-gray-600 mb-2">
          {`You'll earn`}{" "}
          <span className="font-semibold">
            {Math.round(amounts.netAmt) * 10} {loyaltyRule?.name}
          </span>{" "}
          {`on this order.`}
        </p>
      ) : null}

      <div className="flex justify-between mb-2">
        <span className="text-base md:text-lg font-online-ordering">
          Subtotal
        </span>
        <span className="text-base md:text-lg font-semibold font-online-ordering">
          ${amounts.subTotalAmt.toFixed(2)}
        </span>
      </div>

      {amounts.discAmt > 0 ? (
        <>
          <div className="flex justify-between mb-2 text-green-600">
            <span className="text-base md:text-lg font-online-ordering">
              Discount
            </span>
            <span className="text-base md:text-lg font-semibold font-online-ordering">
              -${amounts.discAmt.toFixed(2)}
            </span>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between mb-2">
            <span className="text-base md:text-lg font-online-ordering">
              Net Total
            </span>
            <span className="text-base md:text-lg font-semibold font-online-ordering">
              ${amounts.netAmt.toFixed(2)}
            </span>
          </div>
        </>
      ) : null}

      <div className="flex justify-between mb-2">
        <div className="flex justify-start items-center">
          <span className="text-base md:text-lg font-online-ordering mr-2">
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
                    <span className="font-normal text-gray-600 font-online-ordering">
                      Tax:
                    </span>
                    <span className="font-medium font-online-ordering">
                      ${amounts.taxAmt.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex space-x-1 items-center">
                    <span className="font-normal text-gray-600 font-online-ordering">
                      Platform fees:
                    </span>
                    <span className="font-medium font-online-ordering">
                      ${amounts.platformFeeAmt.toFixed(2)}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-base md:text-lg font-semibold font-online-ordering">
          ${(amounts.taxAmt + amounts.platformFeeAmt).toFixed(2)}
        </span>
      </div>

      {(restaurantData?.restaurantConfigs?.allowTips ?? false) ? (
        <div className="flex justify-between mb-2">
          <span className="text-base md:text-lg font-online-ordering">
            {[10, 15, 20].includes(cartDetails?.amounts?.tipPercent ?? 0)
              ? `Tip (${cartDetails?.amounts?.tipPercent ?? 0}%)`
              : "Tip"}
          </span>
          <span className="text-base md:text-lg font-semibold font-online-ordering">
            ${amounts.tipAmt.toFixed(2)}
          </span>
        </div>
      ) : null}

      {(amounts.deliveryFeeAmt ?? 0) > 0 ? (
        <div className="flex justify-between mb-2">
          <span className="text-base md:text-lg font-online-ordering">
            Delivery Fee
          </span>
          <span className="text-base md:text-lg font-semibold font-online-ordering">
            ${amounts.deliveryFeeAmt?.toFixed(2)}
          </span>
        </div>
      ) : null}

      <hr className="my-2" />

      <div className="flex justify-between mb-2">
        <span className="text-base md:text-lg font-online-ordering font-semibold">
          Total
        </span>
        <span className="text-base md:text-lg font-semibold font-online-ordering">
          ${totalAmount.toFixed(2)}
        </span>
      </div>

      <div className="text-left text-green-700 py-1.5 text-sm w-full font-online-ordering font-semibold mt-1">
        <p>
          You saved upto 25% by ordering directly instead of third party app
        </p>
      </div>
    </div>
  );
};

export default CartBreakdown;
