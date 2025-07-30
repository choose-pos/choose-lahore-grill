import CodeDataStore from "@/store/codeData";
import ToastStore from "@/store/toast";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

interface PromoOrGiftCardProps {
  onClose: () => void;
}

const PromoOrGiftCard: React.FC<PromoOrGiftCardProps> = ({ onClose }) => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToastData } = ToastStore();
  const { setCodeData } = CodeDataStore();

  const handleCouponSubmit = async () => {
    if (couponCode === "") return;

    setIsLoading(true);
    try {
      // const res = await sdk.ValidateGiftCard({code: couponCode});
      // if(res.validateGiftCard){
      //     setCodeData({
      //         code: couponCode,
      //         type: "GIFTCARD",
      //         amount: res.validateGiftCard.amount
      //     })
      //     console.log(res.validateGiftCard);
      //     onClose();
      //     setToastData({
      //         type: "success",
      //         message: "Coupon Code applied successfuly"
      //     })
      // }
    } catch (error) {
      console.log(error);
      setToastData({
        type: "error",
        message: "Invalid code. Please check and try again.",
      });
    } finally {
      setIsLoading(false);
      setCouponCode("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gift Card</h2>
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
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Promo Code or Gift Card"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <button
          onClick={handleCouponSubmit}
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center"
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

export default PromoOrGiftCard;
