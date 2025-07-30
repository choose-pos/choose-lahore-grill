import { LoyaltyRedeemType, OrderDiscountType } from "@/generated/graphql";
import LoyaltyStore from "@/store/loyalty";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { RestaurantRedeemOffers } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import React, { useState } from "react";
import { FiCheckCircle, FiGift, FiPercent, FiX } from "react-icons/fi";

interface OffersScreenProps {
  offers: RestaurantRedeemOffers;
  onClose: () => void;
  customerBalance: number;
}

const RedeemOffer: React.FC<OffersScreenProps> = ({
  offers,
  onClose,
  customerBalance,
}) => {
  const { setRedeemState, setOfferSelected } = LoyaltyStore();
  const { setToastData } = ToastStore();
  const [activeTab, setActiveTab] = useState<"items" | "discounts">("items");
  const [selectedOffer, setSelectedOffer] = useState<{
    id: string;
    discountType?: "FixedAmount" | "Percentage";
    type: LoyaltyRedeemType;
    name: string;
    pointsRequired: number;
    uptoAmount?: number | null;
    discountValue?: number;
  } | null>(null);

  const handleSelectOffer = (
    offerId: string,
    offerType: LoyaltyRedeemType,
    name: string,
    pointsRequired: number,
    discountType?: "FixedAmount" | "Percentage",
    uptoAmount?: number | null,
    discountValue?: number
  ) => {
    setSelectedOffer({
      id: offerId,
      type: offerType,
      name,
      pointsRequired,
      uptoAmount,
      discountType,
      discountValue,
    });
  };

  const handleSave = async () => {
    if (selectedOffer) {
      try {
        const res = await fetchWithAuth(() =>
          sdk.validateLoyaltyRedemptionOnCart({
            input: {
              loyaltyPointsRedeemed: selectedOffer.pointsRequired,
              redeemType: selectedOffer.type,
            },
          })
        );
        setRedeemState({
          discountType: OrderDiscountType.Loyalty,
          loyaltyInput: {
            loyaltyPointsRedeemed: selectedOffer.pointsRequired,
            redeemType: selectedOffer.type,
          },
          promoCode: null,
        });
        setOfferSelected({
          type: selectedOffer.type,
          pointsRequired: selectedOffer.pointsRequired,
          discountType: selectedOffer.discountType,
          discountValue: selectedOffer.discountValue,
          uptoAmount: selectedOffer.uptoAmount,
          name: selectedOffer.name,
        });
      } catch (error) {
        setToastData({
          message: extractErrorMessage(error),
          type: "error",
        });
      }
    }
    onClose();
  };

  const isOfferDisabled = (pointsRequired: number) =>
    pointsRequired > customerBalance;

  const hasItemRedemptions =
    offers?.itemRedemptions && offers.itemRedemptions.length > 0;
  const hasPointsRedemptions =
    offers?.pointsRedemptions && offers.pointsRedemptions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity duration-300">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-2xl transform transition-all duration-300 ease-in-out max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-primary">
          <h2 className="text-xl sm:text-2xl font-online-ordering">
            Redeem Rewards
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
          >
            <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 font-online-ordering">
          <button
            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === "items"
                ? "text-primary border-b-2 border-primary-600 bg-bgColor"
                : "text-primary-700 hover:bgColor"
            }`}
            onClick={() => setActiveTab("items")}
          >
            <FiGift className="inline-block mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
            Free Food
          </button>
          <button
            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium focus:outline-none transition-colors duration-200 ${
              activeTab === "discounts"
                ? "text-primary border-b-2 border-primary-600 bg-bgColor"
                : "text-primary-700 hover:bgColor"
            }`}
            onClick={() => setActiveTab("discounts")}
          >
            <FiPercent className="inline-block mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
            Exclusive Discount
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 font-online-ordering">
          {activeTab === "items" && (
            <div className="space-y-3 sm:space-y-4">
              {hasItemRedemptions ? (
                offers.itemRedemptions.map((itemRedemption) => {
                  const isDisabled = isOfferDisabled(
                    itemRedemption.pointsThreshold
                  );
                  const isSelected = selectedOffer?.id === itemRedemption._id;
                  return (
                    <div
                      key={itemRedemption._id}
                      className={`cursor-pointer rounded-lg border ${
                        isSelected
                          ? "border-primary-600 bg-bgColor "
                          : isDisabled
                          ? "border-gray-200 bg-gray-100 opacity-50"
                          : "border-gray-200 hover:border-primary-500"
                      } transition-all duration-200 transform hover:scale-[1.02]`}
                      onClick={() =>
                        !isDisabled &&
                        handleSelectOffer(
                          itemRedemption._id,
                          LoyaltyRedeemType.Item,
                          itemRedemption.item.name,
                          itemRedemption.pointsThreshold
                        )
                      }
                    >
                      <div className="p-3 sm:p-4 flex justify-between items-center">
                        <div>
                          <h3
                            className={`text-base sm:text-lg font-medium ${
                              isSelected ? "text-primary" : "text-gray-900"
                            }`}
                          >
                            {itemRedemption.item.name}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm mt-1 ${
                              isSelected ? "text-primary" : "text-gray-500"
                            }`}
                          >
                            {itemRedemption.pointsThreshold.toLocaleString()}{" "}
                            points required
                          </p>
                        </div>
                        {isSelected && (
                          <FiCheckCircle className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500 text-sm sm:text-base">
                    No free food offers available for now.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "discounts" && (
            <div className="space-y-3 sm:space-y-4">
              {hasPointsRedemptions ? (
                offers.pointsRedemptions.map((redemption) => {
                  const isDisabled = isOfferDisabled(
                    redemption.pointsThreshold
                  );
                  const isSelected = selectedOffer?.id === redemption._id;
                  return (
                    <div
                      key={redemption._id}
                      className={`cursor-pointer rounded-lg border ${
                        isSelected
                          ? "border-primary-600 bg-bgColor"
                          : isDisabled
                          ? "border-gray-200 bg-gray-100 opacity-50"
                          : "border-gray-200 hover:border-primary-500"
                      } transition-all duration-200 transform hover:scale-[1.02]`}
                      onClick={() =>
                        !isDisabled &&
                        handleSelectOffer(
                          redemption._id,
                          LoyaltyRedeemType.Discount,
                          redemption.discountType === "FixedAmount"
                            ? `$${redemption.discountValue} Off`
                            : `${redemption.discountValue}% Discount`,
                          redemption.pointsThreshold,
                          redemption.discountType,
                          redemption.uptoAmount,
                          redemption.discountValue
                        )
                      }
                    >
                      <div className="p-3 sm:p-4 flex justify-between items-center">
                        <div>
                          <h3
                            className={`text-base sm:text-lg font-medium ${
                              isSelected ? "text-primary" : "text-gray-900"
                            } break-words`}
                          >
                            {redemption.discountType === "FixedAmount"
                              ? `$${redemption.discountValue.toFixed(2)} Off${
                                  redemption.uptoAmount
                                    ? ` upto $${redemption.uptoAmount.toFixed(
                                        2
                                      )}`
                                    : ""
                                }`
                              : `${redemption.discountValue}% Discount${
                                  redemption.uptoAmount
                                    ? ` upto $${redemption.uptoAmount.toFixed(
                                        2
                                      )}`
                                    : ""
                                }`}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm mt-1 ${
                              isSelected ? "text-primary" : "text-gray-500"
                            }`}
                          >
                            {redemption.pointsThreshold.toLocaleString()} points
                            required
                          </p>
                        </div>
                        {isSelected && (
                          <FiCheckCircle className="text-primary h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-500 text-sm sm:text-base">
                    No discount offers available for now.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg font-online-ordering">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm font-medium text-gray-700">
              Your balance:{" "}
              <span className="text-primary">
                {customerBalance.toLocaleString()} points
              </span>
            </div>
            <div className="flex space-x-3 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 rounded-full font-online-ordering"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedOffer}
                className={`flex-1 sm:flex-none font-online-ordering px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 rounded-full ${
                  selectedOffer
                    ? "bg-primary hover:bg-primary-700 text-white"
                    : "bg-primary cursor-not-allowed text-white"
                }`}
              >
                Redeem Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemOffer;
