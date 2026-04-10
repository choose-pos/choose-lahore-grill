import CodeDataStore from "@/store/codeData";
import ToastStore from "@/store/toast";
import { useCartStore } from "@/store/cart";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

type Tab = "promo" | "giftcard";

interface PromoOrGiftCardProps {
  onClose: () => void;
}

const PromoOrGiftCard: React.FC<PromoOrGiftCardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>("promo");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToastData } = ToastStore();
  const { setCodeData } = CodeDataStore();
  const { cartDetails } = useCartStore();

  const hasPromoOrLoyalty =
    !!cartDetails?.discountCode ||
    !!cartDetails?.loyaltyRedeemPoints ||
    !!cartDetails?.discountString;

  const hasGiftCard = !!cartDetails?.giftCardCode;

  const handlePromoSubmit = async () => {
    if (code === "") return;

    if (hasGiftCard) {
      setToastData({
        type: "warning",
        message:
          "A gift card is already applied. Remove it before adding a promo code.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchWithAuth(() =>
        sdk.ValidatePromoCode({ code })
      );
      if (res.validatePromoCode) {
        setCodeData({
          code,
          type: "PROMO",
          amount: res.validatePromoCode.discountValue ?? 0,
        });
        onClose();
        setToastData({
          type: "success",
          message: "Promo code applied successfully!",
        });
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
      setCode("");
    }
  };

  const handleGiftCardSubmit = async () => {
    if (code === "") return;

    if (hasPromoOrLoyalty) {
      setToastData({
        type: "warning",
        message:
          "A promo code or loyalty discount is already applied. Remove it before adding a gift card.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchWithAuth(() =>
        sdk.ValidateGiftCardCode({ code })
      );
      if (res.validateGiftCardCode.valid) {
        onClose();
        setToastData({
          type: "success",
          message: "Gift card applied successfully!",
        });
      } else {
        setToastData({
          type: "error",
          message: res.validateGiftCardCode.message ?? "Invalid gift card",
        });
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
      setCode("");
    }
  };

  const handleSubmit = () => {
    if (activeTab === "promo") {
      handlePromoSubmit();
    } else {
      handleGiftCardSubmit();
    }
  };

  const isGiftCardDisabled = hasPromoOrLoyalty;
  const isPromoDisabled = hasGiftCard;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Apply Discount</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => {
              setActiveTab("promo");
              setCode("");
            }}
            disabled={isPromoDisabled}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "promo"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } ${isPromoDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Promo Code
          </button>
          <button
            onClick={() => {
              setActiveTab("giftcard");
              setCode("");
            }}
            disabled={isGiftCardDisabled}
            className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "giftcard"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            } ${isGiftCardDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Gift Card
          </button>
        </div>

        {/* Mutual exclusivity messages */}
        {isPromoDisabled && activeTab === "promo" && (
          <p className="text-sm text-amber-600 mb-3">
            A gift card is applied. Remove it to use a promo code.
          </p>
        )}
        {isGiftCardDisabled && activeTab === "giftcard" && (
          <p className="text-sm text-amber-600 mb-3">
            A promo or loyalty discount is applied. Remove it to use a gift
            card.
          </p>
        )}

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={
            activeTab === "promo"
              ? "Enter promo code"
              : "Enter gift card code"
          }
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          disabled={
            (activeTab === "promo" && isPromoDisabled) ||
            (activeTab === "giftcard" && isGiftCardDisabled)
          }
        />
        <button
          onClick={handleSubmit}
          disabled={
            isLoading ||
            code === "" ||
            (activeTab === "promo" && isPromoDisabled) ||
            (activeTab === "giftcard" && isGiftCardDisabled)
          }
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin mr-2" />
              Loading...
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </div>
  );
};

export default PromoOrGiftCard;
