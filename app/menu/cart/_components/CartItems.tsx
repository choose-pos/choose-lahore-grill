"use client";

import { PriceTypeEnum } from "@/generated/graphql";
import { useCartStore } from "@/store/cart";
import ToastStore from "@/store/toast";
import { sdk } from "@/utils/graphqlClient";
import { GroupedCartItem } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import Image from "next/image";
import { useState } from "react";
import { FiEdit2, FiMinus, FiPlus } from "react-icons/fi";
import deleteIcon from "../../../../assets/deleteIcon.png";

interface ICartItemLoading {
  loading: boolean;
  action: "increase" | "decrease" | null;
}

const CartItems = ({
  refreshData,
  editingItem,
  setEditingItem,
  isEditing,
  setIsEditing,
}: {
  refreshData: () => void;

  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;

  editingItem: GroupedCartItem | null;
  setEditingItem: (item: GroupedCartItem | null) => void;
}) => {
  // Stores
  const { setToastData } = ToastStore();
  const {
    cartCountInfo,
    cartData,
    cartDetails,
    freeItemInCart,
    freeItemImage,
  } = useCartStore();

  // States
  const [loadingItems, setLoadingItems] = useState<
    Record<string, ICartItemLoading>
  >({});

  // Handlers
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

  const handleRemoveFreeItem = async () => {
    try {
      const res = await sdk.updateCartDetails({
        input: { amounts: { discountAmount: 0 }, discountString: null },
      });

      if (res.updateCartDetails) {
        // Trigger refetch of cart data
        refreshData();
      }
    } catch (error) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const res = await sdk.DeleteCartItem({ id: itemId });
      if (res.deleteCartItem) {
        refreshData();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    }
  };

  const handleDecreaseQuantity = async (itemId: string) => {
    setLoadingItems((prev) => ({
      ...prev,
      [itemId]: { loading: true, action: "decrease" },
    }));

    try {
      const item = cartData.find((item) => item._id === itemId);
      if (!item) return;

      if (item.qty <= 1) {
        await handleRemoveItem(itemId);
        return;
      }

      const res = await sdk.DecreaseItemQty({ id: itemId });

      if (res.decreaseItemQty) {
        refreshData();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setLoadingItems((prev) => ({
        ...prev,
        [itemId]: { loading: false, action: "decrease" },
      }));
    }
  };

  const handleIncreaseQuantity = async (itemId: string) => {
    setLoadingItems((prev) => ({
      ...prev,
      [itemId]: { loading: true, action: "increase" },
    }));

    try {
      const res = await sdk.IncreaseItemQty({ id: itemId });

      if (res.increaseItemQty) {
        refreshData();
      }
    } catch (error) {
      setToastData({
        type: "error",
        message: extractErrorMessage(error),
      });
    } finally {
      setLoadingItems((prev) => ({
        ...prev,
        [itemId]: { loading: false, action: "increase" },
      }));
    }
  };

  const handleEditItem = async (itemId: string, id: string) => {
    const itemToEdit = cartData.find((item) => item._id === id);
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setIsEditing(true);
    }
    try {
      await sdk.getCustomerItem({ id: itemId });
    } catch (error) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
      console.error("Failed to fetch item details", error);
    }
  };

  return (
    <div className="pr-2">
      <div className="w-full flex flex-col overflow-y-scroll h-auto px-6 max-h-[40vh] ios-scroll-fix ">
        {freeItemInCart ? (
          <div className="mb-6 bg-white border-b border-gray-200 pb-6 pt-2">
            <div className="w-full flex justify-between items-start space-x-2">
              <div className="flex items-start gap-4">
                {freeItemImage ? (
                  <div className="w-14 h-14 relative self-start flex-shrink-0">
                    <Image
                      src={freeItemImage}
                      alt={freeItemInCart.name}
                      fill
                      className={`object-cover object-center w-full h-full rounded-lg`}
                    />
                  </div>
                ) : null}
                <h3 className="font-semibold font-subheading-oo text-base md:text-lg lg:text-xl">
                  {freeItemInCart.name}
                </h3>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <button onClick={handleRemoveFreeItem} className="">
                  <Image
                    src={deleteIcon}
                    alt="remove free item"
                    className="w-5 h-5 hover:text-red object-contain cursor-pointer"
                  />
                </button>
                <div className="flex justify-center items-center space-x-2">
                  <p className="lg:text-lg md:text-base text-base font-normal font-subheading-oo text-green-500">
                    FREE
                  </p>
                  <p className="lg:text-lg md:text-base text-base font-normal font-subheading-oo line-through">
                    ${freeItemInCart.price}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {cartData.map((item) => (
          <div
            key={item._id}
            className="mb-4 border-b border-gray-200 last:mb-0 last:border-b-0 bg-white pb-4 pt-2"
          >
            <div className="flex items-center gap-4">
              {/* Content wrapper */}
              {
                item.itemImage ? (
                  <div className="w-16 h-16 relative self-start flex-shrink-0">
                    <Image
                      src={item.itemImage}
                      alt={item.itemName}
                      fill
                      className={`object-cover object-center w-full h-full rounded-md`}
                    />
                  </div>
                ) : null
                // (
                //   <div
                //     className="relative w-14 h-14 aspect-square flex-shrink-0 rounded-l-[20px] overflow-hidden item-image-placeholder border-r border-r-gray-100"
                //     data-text={Array(200).fill(`${item.itemName} `).join("")}
                //   />
                // )
              }
              <div className="flex-grow flex flex-col gap-2">
                {/* Top section with title and buttons */}
                <div className="flex justify-between items-start">
                  <div className="flex-grow pr-4">
                    <h3 className="font-semibold font-subheading-oo text-base md:text-lg">
                      {item.itemName}
                    </h3>
                  </div>

                  <div className="flex items-center sm:space-x-2 space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleEditItem(item.itemId, item._id)}
                      className="flex items-center text-textGrayColor text-sm font-medium hover:underline"
                    >
                      <FiEdit2 size={16} className="mr-[2px]" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className=""
                    >
                      <Image
                        src={deleteIcon}
                        alt="remove item"
                        className="w-5 h-5 hover:text-red object-contain"
                      />
                    </button>
                  </div>
                </div>

                {/* Modifier groups */}
                {item.modifierGroups &&
                  item.modifierGroups.length > 0 &&
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
                    item.modifierGroups.forEach((mg) => {
                      (mg.selectedModifiers ?? [])
                        .filter((m) => m.mid.name)
                        .forEach((m) => {
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
                              ? [inlineName + (m.qty > 1 ? ` x${m.qty}` : "")]
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
                      <div className="font-body-oo font-normal text-sm text-textGrayColor">
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
                  <p className="lg:mt-1 text-sm font-extralight capitalize font-body-oo italic">
                    {item.remarks}
                  </p>
                )}

                {/* Bottom section with price and quantity controls */}
                <div className="flex justify-between items-center ">
                  <div className="flex items-center bg-white p-1 w-fit">
                    <button
                      onClick={() => handleDecreaseQuantity(item._id)}
                      className="sm:p-0.5 p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
                      disabled={loadingItems[item._id]?.loading ?? false}
                    >
                      {(loadingItems[item._id]?.loading ?? false) &&
                      loadingItems[item._id]?.action === "decrease" ? (
                        <div className="w-4 h-4 border-2 border-t-black rounded-full animate-spin" />
                      ) : (
                        <FiMinus
                          className={`${
                            (loadingItems[item._id]?.loading ?? false)
                              ? "opacity-50"
                              : ""
                          }`}
                          size={16}
                        />
                      )}
                    </button>
                    <span className="text-gray-700 mx-1 min-w-[20px] text-base lg:text-lg text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleIncreaseQuantity(item._id)}
                      className="sm:p-0.5 p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
                      disabled={loadingItems[item._id]?.loading ?? false}
                    >
                      {(loadingItems[item._id]?.loading ?? false) &&
                      loadingItems[item._id]?.action === "increase" ? (
                        <div className="w-4 h-4 border-2 border-t-black rounded-full animate-spin" />
                      ) : (
                        <FiPlus
                          className={`${
                            (loadingItems[item._id]?.loading ?? false)
                              ? "opacity-50"
                              : ""
                          }`}
                          size={16}
                        />
                      )}
                    </button>
                  </div>

                  <p className="lg:text-xl md:text-lg text-base font-subheading-oo font-semibold">
                    ${calculateItemPrice(item)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* {isEditing && editingItem && (
        <div className="-z-50">
          <ItemEditScreen
            item={editingItem}
            onClose={() => setIsEditing(false)}
          />
        </div>
      )} */}
    </div>
  );
};

export default CartItems;
