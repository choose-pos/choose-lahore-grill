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
  const getNestedContribution = (
    selectedMod: NonNullable<
      NonNullable<
        GroupedCartItem["modifierGroups"]
      >[number]["selectedModifiers"]
    >[number],
  ): number => {
    return (selectedMod.selectedNestedGroups ?? []).reduce((acc, nmgSel) => {
      switch (nmgSel.nmgId.pricingType) {
        case PriceTypeEnum.SamePrice:
          return (
            acc +
            (nmgSel.nmgId.price ?? 0) *
              nmgSel.selectedNestedModifiers.reduce((t, nm) => t + nm.qty, 0)
          );
        case PriceTypeEnum.IndividualPrice:
          return (
            acc +
            nmgSel.selectedNestedModifiers.reduce(
              (t, nm) => t + nm.nmid.price * nm.qty,
              0,
            )
          );
        default:
          return acc;
      }
    }, 0);
  };

  const calculateItemPrice = (item: GroupedCartItem): string => {
    const modifierPrice =
      item.modifierGroups?.reduce((modAcc, mod) => {
        let groupTotal = 0;

        switch (mod.pricingType) {
          case PriceTypeEnum.SamePrice:
            groupTotal =
              mod.selectedModifiers?.reduce((acc, selectedMod) => {
                return (
                  acc +
                  ((mod.price ?? 0) + getNestedContribution(selectedMod)) *
                    selectedMod.qty
                );
              }, 0) ?? 0;
            break;
          case PriceTypeEnum.IndividualPrice:
            groupTotal =
              mod.selectedModifiers?.reduce((acc, selectedMod) => {
                return (
                  acc +
                  (selectedMod.mid.price + getNestedContribution(selectedMod)) *
                    selectedMod.qty
                );
              }, 0) ?? 0;
            break;
          case PriceTypeEnum.FreeOfCharge:
            groupTotal =
              mod.selectedModifiers?.reduce((acc, selectedMod) => {
                return (
                  acc + getNestedContribution(selectedMod) * selectedMod.qty
                );
              }, 0) ?? 0;
            break;
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
              <div className="flex flex-col scrollbar-hide overflow-y-auto divide-y divide-gray-100">
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
                      {(item.modifierGroups?.length ?? 0) > 0 &&
                        (() => {
                          const PORTION_RE = /^---(.+?)---(.*)/i;
                          const normalizePortionLabel = (raw: string) => {
                            const s = raw.trim().toLowerCase();
                            if (s === "whole") return "whole";
                            if (s === "1st half") return "1half";
                            if (s === "2nd half") return "2half";
                            return s.replace(/\s+/g, "");
                          };
                          const portionMap: Record<string, string[]> = {};
                          const normalParts: string[] = [];
                          (item.modifierGroups ?? []).forEach((mg) => {
                            (mg.selectedModifiers ?? []).forEach((m) => {
                              const nestedNames = (
                                m.selectedNestedGroups ?? []
                              ).flatMap((nmgSel) =>
                                nmgSel.selectedNestedModifiers.map((nm) =>
                                  nm.qty > 1
                                    ? `${nm.nmid.name} x${nm.qty}`
                                    : nm.nmid.name,
                                ),
                              );
                              const portionMatch = m.mid.name.match(PORTION_RE);
                              if (portionMatch) {
                                const label = normalizePortionLabel(
                                  portionMatch[1],
                                );
                                const inlineName = portionMatch[2].trim();
                                const toppings = inlineName
                                  ? [
                                      inlineName +
                                        (m.qty > 1 ? ` x${m.qty}` : ""),
                                    ]
                                  : nestedNames;
                                portionMap[label] = [
                                  ...(portionMap[label] ?? []),
                                  ...toppings,
                                ];
                              } else {
                                const base =
                                  m.qty > 1
                                    ? `${m.mid.name} x ${m.qty}`
                                    : m.mid.name;
                                normalParts.push(
                                  nestedNames.length > 0
                                    ? `${base} (${nestedNames.join(", ")})`
                                    : base,
                                );
                              }
                            });
                          });
                          const portionOrder = ["whole", "1half", "2half"];
                          const portionDisplayLabel: Record<string, string> = {
                            whole: "Whole",
                            "1half": "1st Half",
                            "2half": "2nd Half",
                          };
                          const filteredPortions = portionOrder.filter(
                            (k) => portionMap[k]?.length,
                          );
                          if (
                            normalParts.length === 0 &&
                            filteredPortions.length === 0
                          )
                            return null;
                          return (
                            <div className="text-sm text-gray-400 font-body-oo mt-0.5 leading-snug">
                              {normalParts.length > 0 && (
                                <p>{normalParts.join(", ")}</p>
                              )}
                              {filteredPortions.length > 0 && (
                                <div
                                  className={
                                    normalParts.length > 0 ? "mt-1" : undefined
                                  }
                                >
                                  {filteredPortions.map((k) => (
                                    <p key={k}>
                                      <strong className="text-black">
                                        {portionDisplayLabel[k] ?? k}:
                                      </strong>{" "}
                                      {portionMap[k].join(", ")}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })()}

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
