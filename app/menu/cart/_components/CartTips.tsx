import { Env } from "@/env";
import { useCartStore } from "@/store/cart";
import ToastStore from "@/store/toast";
import { sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { useEffect, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const CartTips = ({ refreshData }: { refreshData: () => void }) => {
  // Stores
  const { setToastData } = ToastStore();
  const { cartDetails } = useCartStore();

  // States
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [tipAmt, setTipAmt] = useState<number>();
  const [tipAmtInput, setTipAmtInput] = useState<number>();
  const [tipPercent, setTipPercent] = useState<number>();
  const [tipPercentInput, setTipPercentInput] = useState<number>();
  const [showCustomTipModal, setShowCustomTipModal] = useState(false);

  // UseEffects
  useEffect(() => {
    const subTotalAmt = cartDetails?.amounts?.subTotalAmount ?? 0;
    const tipP = cartDetails?.amounts?.tipPercent ?? 0;

    // Calculate tip amount based on subtotal and tip percentage
    const tipA = parseFloat(
      (tipP > 0 && subTotalAmt > 0 ? (tipP / 100) * subTotalAmt : 0).toFixed(2)
    );

    setSelectedTip(tipP);

    setTipPercent(tipP);
    setTipPercentInput(tipP);

    setTipAmt(tipA);
    setTipAmtInput(tipA);
  }, [cartDetails]);

  // Handlers
  const handleTipSelection = async (percentage: number) => {
    try {
      const res = await sdk.updateCartTip({ tipPercent: percentage });

      if (res.updateCartTip) {
        refreshData();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const handleConfirmCustomTip = async () => {
    if (tipAmtInput !== undefined && tipPercentInput !== undefined) {
      if (tipAmtInput === tipAmt && tipPercentInput === tipPercent) {
        // If values not changed, don't update
        setShowCustomTipModal(false);
        return;
      }

      try {
        const res = await sdk.updateCartTip({
          tipPercent: tipPercentInput,
        });

        if (res.updateCartTip) {
          refreshData();
          setShowCustomTipModal(false);
        }
      } catch (error) {
        setToastData({
          type: "error",
          message: extractErrorMessage(error),
        });
      }
    }
  };

  if (
    !cartDetails?.amounts.subTotalAmount ||
    cartDetails?.amounts.subTotalAmount === 0
  ) {
    return null;
  }

  return (
    <>
      <div className="w-full px-6">
        <p className="font-online-ordering font-semibold text-xl">
          {cartDetails?.delivery ? "Delivery Tip" : "Tip"}
        </p>
        <div className="font-online-ordering grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 w-full">
          {[10, 15, 20].map((tip) => (
            <button
              key={tip}
              onClick={() => handleTipSelection(tip)}
              className={`text-center justify-center flex items-center space-x-1 px-2 sm:px-4 py-2 rounded-full border-2 text-sm sm:text-base whitespace-nowrap overflow-hidden ${
                selectedTip === tip ? "border-black" : "bg-bgGray"
              }`}
            >
              <span>{tip}%</span>
              <span>
                ($
                {(
                  (cartDetails?.amounts.subTotalAmount ?? 0) *
                  (tip / 100)
                ).toFixed(2)}
                )
              </span>
              {selectedTip === tip && (
                <IoCloseCircleOutline
                  size={18}
                  className="ml-1 hover:opacity-80 font-bold text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTipSelection(0);
                  }}
                />
              )}
            </button>
          ))}
          <button
            onClick={() => {
              setShowCustomTipModal(true);
            }}
            className={`text-center justify-center flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full border-2 text-sm sm:text-base whitespace-nowrap overflow-hidden ${
              ![10, 15, 20].includes(selectedTip ?? 0)
                ? "border-black text-black "
                : "bg-bgGray"
            }`}
          >
            {![10, 15, 20].includes(selectedTip ?? 0) ? (
              <span>Custom</span>
            ) : (
              <span>Custom Tip</span>
            )}
            {![10, 15, 20].includes(selectedTip ?? 0) && (
              <span className="flex items-center space-x-2">
                <span>(${(tipAmt ?? 0).toFixed(2)})</span>
                {(tipAmt ?? 0) > 0 ? (
                  <IoCloseCircleOutline
                    size={18}
                    className="hover:opacity-80 text-black"
                    onClick={async (e) => {
                      e.stopPropagation();
                      handleTipSelection(0);
                    }}
                  />
                ) : null}
              </span>
            )}
          </button>
        </div>

        {/* <div className="mt-4">
          <p className="text-base sm:text-lg font-semibold font-online-ordering">
            Tip Amount: ${(tipAmt ?? 0).toFixed(2)}
          </p>
        </div> */}
      </div>

      {showCustomTipModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl sm:text-2xl mb-4 font-online-ordering">
              Enter Custom Tip
            </h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-full sm:flex-1">
                <label
                  htmlFor="customPercentage"
                  className="block text-xs sm:text-sm font-medium text-gray-700 font-online-ordering"
                >
                  Tip Percentage (%)
                </label>
                <input
                  type="text"
                  id="customPercentage"
                  value={tipPercentInput ?? 0}
                  onChange={(e) => {
                    let input = e.target.value.replace(/\D/g, "");
                    if (input.length > 3) {
                      input = input.slice(0, 3);
                    }

                    const subTotalAmt =
                      cartDetails?.amounts?.subTotalAmount ?? 0;

                    const tipP = Number(input);
                    const tipA =
                      tipP > 0 && subTotalAmt > 0
                        ? (tipP / 100) * subTotalAmt
                        : 0;

                    setTipPercentInput(Number(input));
                    setTipAmtInput(parseFloat(tipA.toFixed(2)));
                  }}
                  className="mt-1 block p-2 w-full rounded-md text-xs sm:text-sm border-gray-700 ring-2"
                />
              </div>

              <div className="w-full sm:flex-1">
                <label
                  htmlFor="customAmount"
                  className="block text-xs sm:text-sm font-medium text-gray-700 font-online-ordering"
                >
                  Custom Tip Amount ($)
                </label>
                <input
                  type="text"
                  id="customAmount"
                  value={tipAmtInput ?? 0}
                  onChange={(e) => {
                    let input = e.target.value.replace(/\D/g, "");
                    if (input.length > 3) {
                      input = input.slice(0, 3);
                    }

                    const subTotalAmt =
                      cartDetails?.amounts?.subTotalAmount ?? 0;

                    const tipA = Number(input);
                    const tipP = (tipA / subTotalAmt) * 100;

                    setTipPercentInput(parseFloat(tipP.toFixed(2)));
                    setTipAmtInput(Number(input));
                  }}
                  className="mt-1 block p-2 w-full rounded-md text-xs sm:text-sm border-gray-700 ring-2"
                />
              </div>
            </div>
            <div className="mt-4 sm:mt-6 flex justify-start md:justify-end space-x-2">
              <button
                onClick={() => {
                  setTipAmtInput(tipAmt ?? 0);
                  setTipPercentInput(tipPercent ?? 0);
                  setShowCustomTipModal(false);
                }}
                className="py-1 px-3 sm:py-2 sm:px-4 bg-gray-300 rounded-full text-xs sm:text-base font-online-ordering"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCustomTip}
                className="py-1 px-3 sm:py-2 sm:px-4 bg-primary text-white rounded-full text-xs sm:text-base font-online-ordering"
                style={{
                  color: isContrastOkay(
                    Env.NEXT_PUBLIC_PRIMARY_COLOR,
                    Env.NEXT_PUBLIC_BACKGROUND_COLOR
                  )
                    ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
                    : Env.NEXT_PUBLIC_TEXT_COLOR,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTips;
