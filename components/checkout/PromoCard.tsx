import { Env } from "@/env";
import PromoCodeStore from "@/store/promocode";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { extractErrorMessage } from "@/utils/UtilFncs";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

interface PromoOrGiftCardProps {
  onClose: () => void;
}

const PromoCard: React.FC<PromoOrGiftCardProps> = ({ onClose }) => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToastData } = ToastStore();
  const { setPromo } = PromoCodeStore();

  const handleCouponSubmit = async () => {
    if (couponCode === "") return;

    setIsLoading(true);
    try {
      const res = await fetchWithAuth(() =>
        sdk.ValidatePromoCode({ code: couponCode })
      );
      if (res.validatePromoCode) {
        setPromo({
          code: couponCode,
          type: "PROMO",
          discountItem: {
            name: res.validatePromoCode.discountItem?.name,
            image: res.validatePromoCode.discountItem?.image,
            price: res.validatePromoCode.discountItem?.price,
          },
          discountValue: res.validatePromoCode.discountValue,
          uptoAmount: res.validatePromoCode.uptoAmount,
          promoCodeDiscountType: res.validatePromoCode.promoCodeDiscountType,
        });
        onClose();
        setToastData({
          type: "success",
          message: "Promo applied successfuly!",
        });
      }
    } catch (error) {
      console.log(error);
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
      setCouponCode("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 font-online-ordering">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold font-online-ordering">
            Promo Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <input
          type="text"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase());
          }}
          placeholder="Promo Code"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <button
          onClick={handleCouponSubmit}
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 px-4 rounded-full transition duration-200 flex items-center justify-center"
          style={{
            color: isContrastOkay(
              Env.NEXT_PUBLIC_PRIMARY_COLOR,
              Env.NEXT_PUBLIC_BACKGROUND_COLOR
            )
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : Env.NEXT_PUBLIC_TEXT_COLOR,
          }}
        >
          {isLoading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin mr-2" />
              Loading...
            </>
          ) : (
            "Done"
          )}
        </button>
      </div>
    </div>
  );
};

export default PromoCard;
