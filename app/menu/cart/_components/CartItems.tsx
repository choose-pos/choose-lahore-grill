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
    try {
      const customerItemDetails = await sdk.getCustomerItem({ id: itemId });

      if (customerItemDetails?.getCustomerItem) {
        const itemToEdit = cartData.find((item) => item._id === id);

        if (itemToEdit) {
          setEditingItem(itemToEdit);
          setIsEditing(true);
        }
      }
    } catch (error) {
      setToastData({ message: extractErrorMessage(error), type: "error" });
      console.error("Failed to fetch item details", error);
    }
  };

  return (
    <div className="pr-2">
      <div className="w-full flex flex-col overflow-y-scroll h-auto px-6 max-h-[40vh] ios-scroll-fix ">
        {freeItemInCart ? (
          <div className="mb-6 rounded-[20px] bg-white border p-4">
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
                <h3 className="font-semibold font-online-ordering text-base md:text-lg lg:text-xl">
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
                  <p className="lg:text-lg md:text-base text-base font-semibold font-online-ordering text-green-500">
                    FREE
                  </p>
                  <p className="lg:text-lg md:text-base text-base font-semibold font-online-ordering line-through">
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
            className="last:mb-2 mb-6 rounded-[20px] border bg-white p-4"
          >
            <div className="flex items-center gap-4">
              {/* Content wrapper */}
              {item.itemImage ? (
                <div className="w-14 h-14 relative self-start flex-shrink-0">
                  <Image
                    src={item.itemImage}
                    alt={item.itemName}
                    fill
                    className={`object-cover object-center w-full h-full rounded-lg`}
                  />
                </div>
              ) : null}
              <div className="flex-grow flex flex-col gap-2">
                {/* Top section with title and buttons */}
                <div className="flex justify-between items-start">
                  <div className="flex-grow pr-4">
                    <h3 className="font-medium font-online-ordering text-base md:text-lg">
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
                {item.modifierGroups && item.modifierGroups.length > 0 && (
                  <div className="font-online-ordering text-sm text-textGrayColor flex flex-wrap">
                    {item.modifierGroups.map((mg, index) => {
                      return (
                        <span key={mg._id} className="inline-block">
                          {mg.selectedModifiers
                            ?.map((m) => m.mid.name + " x " + m.qty)
                            .join(", ")}
                          {index ===
                          (item.modifierGroups ?? []).length - 1 ? null : (
                            <span className="pr-1">,</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Remarks */}
                {item.remarks && (
                  <p className="lg:mt-1 text-sm font-extralight capitalize font-online-ordering italic">
                    {item.remarks}
                  </p>
                )}

                {/* Bottom section with price and quantity controls */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center bg-white p-1 w-fit">
                    <button
                      onClick={() => handleDecreaseQuantity(item._id)}
                      className="sm:p-1 p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
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
                      className="sm:p-1 p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
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

                  <p className="lg:text-xl md:text-lg text-base font-semibold font-online-ordering">
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
