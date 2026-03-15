import { Env } from "@/env";
import { PriceTypeEnum } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import { isContrastOkay } from "@/utils/isContrastOkay";
import { GroupedCartItem } from "@/utils/types";
import Image from "next/image";
import { useState } from "react";
import { FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn } from "@/utils/motion";

const CheckoutOrderSummary = () => {
  // Stores
  const {
    cartData,
    cartCountInfo,
    freeItemInCart,
    specialRemarks,
    freeItemImage,
  } = useCartStore();

  // States
  const [showOrderItems, setShowOrderItems] = useState(false);

  // Handler / Functions
  const calculateItemPrice = (item: GroupedCartItem): string => {
    const modifierPrice =
      item.modifierGroups?.reduce((modAcc, mod) => {
        let groupTotal = 0;

        switch (mod.pricingType) {
          case PriceTypeEnum.SamePrice:
            // Calculate total quantity of all selected modifiers
            const totalQuantity =
              mod.selectedModifiers?.reduce(
                (qtyAcc, selectedMod) => qtyAcc + selectedMod.qty,
                0
              ) ?? 0;
            // Multiply base price by total quantity
            groupTotal = (mod.price ?? 0) * totalQuantity;
            break;
          case PriceTypeEnum.IndividualPrice:
            groupTotal =
              mod.selectedModifiers?.reduce(
                (selectedAcc, selectedMod) =>
                  selectedAcc + selectedMod.mid.price * selectedMod.qty,
                0
              ) ?? 0;
            break;
          case PriceTypeEnum.FreeOfCharge:
          default:
            groupTotal = 0;
        }

        return modAcc + groupTotal;
      }, 0) ?? 0;

    const totalItemPrice = (item.itemPrice + modifierPrice) * item.qty;
    return totalItemPrice.toFixed(2);
  };

  return (
    <>
      <div className="w-full px-6">
        <p className="font-subheading-oo font-semibold text-xl">
          Order Summary ({cartCountInfo})
        </p>

        <p
          onClick={() => {
            setShowOrderItems(true);
          }}
          className="text-base text-primary underline font-subheading-oo font-semibold cursor-pointer mt-4 w-max"
          style={{
            color: isContrastOkay("#ffffff", Env.NEXT_PUBLIC_BACKGROUND_COLOR)
              ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
              : "#000000",
          }}
        >
          View items
        </p>
      </div>

      {/* View Items List */}
      <AnimatePresence>
        {showOrderItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOrderItems(false)}
            className="fixed inset-0 flex items-end sm:items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:p-4"
          >
            <motion.div
              variants={fadeIn("up", "tween", 0, 0.25)}
              initial="hidden"
              animate="show"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-4 sm:p-6 rounded-t-md sm:rounded-md shadow-xl w-full sm:w-11/12 max-w-lg flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-subheading-oo font-semibold">
                  Order Items ({cartCountInfo})
                </h2>
                <button
                  className="text-gray-400 hover:text-gray-700 transition-colors"
                  onClick={() => setShowOrderItems(false)}
                >
                  <FiX size={22} />
                </button>
              </div>

              {/* Items list */}
              <div className="flex flex-col overflow-y-auto divide-y divide-gray-100 scrollbar-hide">
                {/* Free item */}
                {freeItemInCart && (
                  <div className="py-3 flex items-center gap-3">
                    {freeItemImage && (
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={freeItemImage}
                          alt={freeItemInCart.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <h3 className="font-subheading-oo font-semibold text-base leading-snug">
                        {freeItemInCart.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-500 font-semibold text-sm font-subheading-oo">
                          FREE
                        </span>
                        <span className="text-gray-400 text-sm font-subheading-oo line-through">
                          ${freeItemInCart.price}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cart items */}
                {cartData.map((item) => (
                  <div key={item._id} className="py-3 flex items-center gap-3">
                    {item.itemImage && (
                      <div className="w-20 h-20 relative flex-shrink-0">
                        <Image
                          src={item.itemImage}
                          alt={item.itemName}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-subheading-oo font-semibold text-base leading-snug">
                          {item.itemName}{" "}
                          <span className="text-gray-400">x {item.qty}</span>
                        </h3>
                        <p className="font-subheading-oo font-semibold text-base flex-shrink-0">
                          ${calculateItemPrice(item)}
                        </p>
                      </div>

                      {/* Modifiers */}
                      {(item.modifierGroups?.length ?? 0) > 0 && (
                        <p className="text-sm text-gray-400 font-body-oo mt-0.5 leading-snug">
                          {item.modifierGroups
                            ?.flatMap(
                              (mg) =>
                                mg.selectedModifiers?.map(
                                  (m) => `${m.mid.name} x ${m.qty}`,
                                ) ?? [],
                            )
                            .join(", ")}
                        </p>
                      )}

                      {/* Remarks */}
                      {item.remarks && (
                        <p className="text-sm italic font-subheading-oo font-semibold mt-0.5 capitalize">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return null;
};

export default CheckoutOrderSummary;
