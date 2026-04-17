"use client";
import LoadingDots from "@/components/common/LoadingDots";
import {
  FetchVisiblePromoCodesQuery,
  PromoDiscountType,
} from "@/generated/graphql";
import ToastStore from "@/store/toast";
import { fetchWithAuth, sdk } from "@/utils/graphqlClient";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { fadeIn } from "@/utils/motion";
import { motion } from "framer-motion";
import { Gift, Tag } from "lucide-react";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

type VisibleOffers = FetchVisiblePromoCodesQuery["fetchVisiblePromoCodes"];
type PromoCode = VisibleOffers["promoCodes"][number];
type GiftCardInfo = VisibleOffers["giftCards"][number];
type CardInfo = PromoCode | GiftCardInfo;

interface PromoCodesModalProps {
  promoCodes: PromoCode[];
  giftCards?: GiftCardInfo[];
  onClose: () => void;
  onApplied: () => void | Promise<void>;
  onRemoveExisting?: () => Promise<void>;
  onSwapFailed?: () => void | Promise<void>;
  appliedCode?: string;
}

const formatDiscount = (promo: PromoCode): string => {
  switch (promo.promoCodeDiscountType) {
    case PromoDiscountType.Percentage:
      return `${promo.discountValue}% off${promo.uptoAmount ? ` (up to $${promo.uptoAmount})` : ""}`;
    case PromoDiscountType.FixedAmount:
      return `$${promo.discountValue} off`;
    case PromoDiscountType.Free:
      return "Free order";
    case PromoDiscountType.FreeDelivery:
      return "Free delivery";
    case PromoDiscountType.Item:
      return promo.discountItem
        ? `Free ${promo.discountItem.name}`
        : "Free item";
    default:
      return "";
  }
};

const PromoCodesModal = ({
  promoCodes,
  giftCards = [],
  onClose,
  onApplied,
  onRemoveExisting,
  onSwapFailed,
  appliedCode,
}: PromoCodesModalProps) => {
  const { setToastData } = ToastStore();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApplyPromo = async (code: CardInfo) => {
    setApplyingId(code._id);
    try {
      if (onRemoveExisting) {
        await onRemoveExisting();
      }
      const res = await fetchWithAuth(() =>
        sdk.ApplyDiscountCode({ code: code.code }),
      );
      if (res.applyDiscountCode.success) {
        setToastData({ message: "Promo code applied!", type: "success" });
        await onApplied();
        onClose();
      } else {
        // Apply failed (non-exception path)
        setToastData({
          message: res.applyDiscountCode.message ?? "Invalid code",
          type: "error",
        });
        if (onSwapFailed) await onSwapFailed();
      }
    } catch (err) {
      setToastData({ message: extractErrorMessage(err), type: "error" });
      if (onSwapFailed) await onSwapFailed();
    } finally {
      setApplyingId(null);
    }
  };

  const hasPromoCodes = promoCodes.length > 0;
  const hasGiftCards = giftCards.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-end sm:items-center justify-center z-50 bg-black/40 "
    >
      <motion.div
        variants={fadeIn("up", "tween", 0, 0.25)}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="bg-white w-full sm:max-w-md rounded-t-md max-h-[80vh] flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <h2 className="text-base font-subheading-oo font-semibold text-gray-900">
            Available Offers
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 py-4">
          {/* Promo Codes Section */}
          {hasPromoCodes && (
            <>
              {hasGiftCards && (
                <p className="text-xs font-subheading-oo font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Promo Codes
                </p>
              )}
              <ul className="space-y-3">
                {promoCodes.map((promo) => {
                  const isApplied =
                    appliedCode?.toLowerCase() === promo.code.toLowerCase();
                  return (
                    <li key={promo._id}>
                      <button
                        onClick={() => !isApplied && handleApplyPromo(promo)}
                        disabled={isApplied || applyingId !== null}
                        className={`w-full text-left border border-dashed rounded-md px-4 py-3 transition-colors ${
                          isApplied
                            ? "border-green-500 bg-green-50 opacity-80 cursor-not-allowed"
                            : "border-gray-300 hover:bg-gray-50 disabled:opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Tag
                              className={`w-4 h-4 flex-shrink-0 ${isApplied ? "text-green-600" : "text-gray-500"}`}
                            />
                            <span className="font-subheading-oo font-bold text-sm text-gray-900 tracking-wide">
                              {promo.code}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-subheading-oo font-bold whitespace-nowrap ${isApplied ? "text-green-600" : "text-gray-500"}`}
                          >
                            {isApplied
                              ? "Applied"
                              : applyingId === promo._id
                                ? "Applying..."
                                : "Tap to apply"}
                          </span>
                        </div>
                        <p className="text-xs font-subheading-oo font-bold text-gray-800 mt-1 ml-6">
                          {formatDiscount(promo)}
                        </p>
                        {promo.description && (
                          <div className="ml-6 mt-1">
                            <p className="text-xs font-body-oo  text-gray-600">
                              {expandedIds.has(promo._id)
                                ? promo.description
                                : promo.description.length > 60
                                  ? `${promo.description.substring(0, 60)}...`
                                  : promo.description}
                            </p>
                            {promo.description.length > 60 && (
                              <span
                                onClick={(e) => toggleExpand(promo._id, e)}
                                className="text-xs font-body-oo font-semibold text-black cursor-pointer"
                              >
                                {expandedIds.has(promo._id)
                                  ? "Show less"
                                  : "Show more"}
                              </span>
                            )}
                          </div>
                        )}
                        {promo.minCartValue ? (
                          <p className="text-xs font-body-oo text-gray-400 mt-0.5 ml-6">
                            Min. order: ${promo.minCartValue}
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {/* Gift Cards Section */}
          {hasGiftCards && (
            <>
              {hasPromoCodes && (
                <div className="my-4 border-t border-gray-100" />
              )}
              {hasPromoCodes && (
                <p className="text-xs font-subheading-oo font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Gift Cards
                </p>
              )}
              <ul className="space-y-3">
                {giftCards.map((gc) => {
                  const isApplied =
                    appliedCode?.toLowerCase() === gc.code.toLowerCase();
                  const isExpired =
                    gc.expiryDate && new Date(gc.expiryDate) < new Date();

                  return (
                    <li key={gc._id}>
                      <button
                        onClick={() =>
                          !isApplied && !isExpired && handleApplyPromo(gc)
                        }
                        disabled={isApplied || isExpired || applyingId !== null}
                        className={`w-full text-left border border-dashed rounded-md px-4 py-3 transition-colors ${
                          isApplied
                            ? "border-green-500 bg-green-50 opacity-80 cursor-not-allowed"
                            : isExpired
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                              : "border-gray-300 hover:bg-gray-50 disabled:opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Gift
                              className={`w-4 h-4 flex-shrink-0 ${isApplied ? "text-green-600" : isExpired ? "text-gray-400" : "text-gray-500"}`}
                            />
                            <span className="font-subheading-oo font-bold text-sm text-gray-900 tracking-wide">
                              {gc.code}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-subheading-oo font-bold whitespace-nowrap ${
                              isApplied
                                ? "text-green-600"
                                : isExpired
                                  ? "text-red-400"
                                  : "text-gray-500"
                            }`}
                          >
                            {isApplied
                              ? "Applied"
                              : isExpired
                                ? "Expired"
                                : applyingId === gc._id
                                  ? "Applying..."
                                  : "Tap to apply"}
                          </span>
                        </div>
                        <div className="mt-1 ml-6 flex items-center gap-2">
                          <p className="text-xs font-subheading-oo font-bold text-gray-800">
                            Balance: ${gc.remainingAmount.toFixed(2)}
                          </p>
                          {/* {gc.remainingAmount < gc.amount && (
                            <p className="text-xs font-body-oo text-gray-400 line-through">
                              ${gc.amount.toFixed(2)}
                            </p>
                          )} */}
                        </div>
                        {/* {gc.expiryDate && !isExpired && (
                          <p className="text-xs font-body-oo text-gray-400 mt-0.5 ml-6">
                            Expires:{" "}
                            {new Date(gc.expiryDate).toLocaleDateString()}
                          </p>
                        )} */}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PromoCodesModal;
