import { Env } from "@/env";
import { UpSellReturnItem } from "@/generated/graphql";
import { sendAnalyticsEvent } from "@/hooks/useAnalytics";
import { useCartStore } from "@/store/cart";
import ToastStore from "@/store/toast";
import { getOrCreateUserHash } from "@/utils/analytics";
import { sdk } from "@/utils/graphqlClient";
import { refreshCartDetails } from "@/utils/refreshCartDetails";
import { GroupedCartItem } from "@/utils/types";
import { extractErrorMessage } from "@/utils/UtilFncs";
import { Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ItemOptionsProps {
  upsellItem: UpSellReturnItem[];
}

interface SelectedItemsState {
  [key: string]: boolean;
}

interface CartItemIdsState {
  [key: string]: string;
}

interface LoadingItemsState {
  [key: string]: boolean;
}

interface QuantityState {
  [key: string]: number;
}

interface OriginalQuantityState {
  [key: string]: number;
}

const ItemOptions: React.FC<ItemOptionsProps> = ({ upsellItem }) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItemsState>({});
  const [cartItemIds, setCartItemIds] = useState<CartItemIdsState>({});
  const [loadingItems, setLoadingItems] = useState<LoadingItemsState>({});
  const [quantities, setQuantities] = useState<QuantityState>({});
  const [addedItems, setAddedItems] = useState<SelectedItemsState>({});
  const [originalQuantities, setOriginalQuantities] =
    useState<OriginalQuantityState>({});
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");

  useEffect(() => {
    if (!itemId) {
      setSelectedItems({});
      setCartItemIds({});
      setLoadingItems({});
      setQuantities({});
      setAddedItems({});
      setOriginalQuantities({});
    }
  }, [itemId]);

  const { setCartCountInfo, setCartData, setCartDetails } = useCartStore();
  const { setToastData } = ToastStore();
  const isMobile = window.innerWidth <= 640;

  const refreshCart = async () => {
    try {
      const res = await sdk.FetchCartItems();
      if (res.fetchCartItems) {
        const items = res.fetchCartItems.cartData;
        const groupedCart: GroupedCartItem[] = items.map((item) => ({
          _id: item._id,
          itemName: item.itemId.name,
          itemId: item.itemId._id,
          itemImage: item.itemId.image,
          itemPrice: item.itemId.price,
          qty: item.qty,
          remarks: item.remarks || "",
          modifierGroups:
            item.modifierGroups?.map((modg) => ({
              name: modg.mgId.name,
              price: modg.mgId.price,
              _id: modg.mgId._id,
              pricingType: modg.mgId.pricingType,
              selectedModifiers: modg.selectedModifiers?.map((mod) => ({
                qty: mod.qty,
                mid: {
                  name: mod.mid.name,
                  _id: mod.mid._id,
                  price: mod.mid.price,
                },
              })),
            })) || [],
        }));
        setCartData(groupedCart);
        const totalQty = groupedCart.reduce((acc, item) => acc + item.qty, 0);
        setCartCountInfo(totalQty);

        if (res.fetchCartItems.message) {
          setToastData({
            message: res.fetchCartItems.message,
            type: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
      setToastData({ message: extractErrorMessage(error), type: "error" });
    }
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change),
    }));
  };

  const handleAddToCart = async (itemId: string, name: string) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [itemId]: true }));

      const res = await sdk.AddToCart({
        items: {
          itemId: itemId,
          qty: quantities[itemId] || 1,
          modifierGroups: [],
          remarks: "",
        },
      });

      if (res.addToCart) {
        const cartItemId = res.addToCart;

        // Track event
        const userHash = getOrCreateUserHash(); // Generate or retrieve persistent user hash

        sendAnalyticsEvent({
          restaurant: Env.NEXT_PUBLIC_RESTAURANT_ID,
          pagePath: "/menu",
          pageQuery: null, // Include query only if present
          source: document.referrer || "direct", // Fallback to 'direct' if no referrer
          utm: null, // Extract UTM parameters from the query
          userHash, // Attach the user identifier
          eventType: "add_to_cart",
          metadata: {
            id: itemId,
            name: name,
            upsell: true,
          },
        });

        setCartItemIds((prev) => ({ ...prev, [itemId]: cartItemId }));
        setSelectedItems((prev) => ({ ...prev, [itemId]: true }));
        setAddedItems((prev) => ({ ...prev, [itemId]: true }));
        setOriginalQuantities((prev) => ({
          ...prev,
          [itemId]: quantities[itemId],
        }));
        await refreshCart();
        const res2 = await refreshCartDetails();
        if (res2?.CartDetails) {
          setCartDetails(res2.CartDetails);
        }
        // setToastData({
        //   type: "success",
        //   message: "Item added successfully!",
        // });

        setTimeout(() => {
          setAddedItems((prev) => ({ ...prev, [itemId]: false }));
        }, 2000);
      }
    } catch (error) {
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [itemId]: true }));
      const cartItemId = cartItemIds[itemId];
      if (!cartItemId) {
        throw new Error("Cart item ID not found");
      }

      const res = await sdk.DeleteCartItem({ id: cartItemId });
      if (res.deleteCartItem) {
        setCartItemIds((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
        setSelectedItems((prev) => ({ ...prev, [itemId]: false }));
        setQuantities((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
        setAddedItems((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
        setOriginalQuantities((prev) => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
        await refreshCart();
        const res2 = await refreshCartDetails();
        if (res2?.CartDetails) {
          setCartDetails(res2.CartDetails);
        }
        // setToastData({
        //   type: "success",
        //   message: "Item removed successfully!",
        // });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleUpdateCart = async (itemId: string) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [itemId]: true }));
      const cartItemId = cartItemIds[itemId];
      if (!cartItemId) {
        throw new Error("Cart item ID not found");
      }

      // First delete the existing item
      await sdk.DeleteCartItem({ id: cartItemId });

      // Then add the new item with updated quantity
      const res = await sdk.AddToCart({
        items: {
          itemId: itemId,
          qty: quantities[itemId] || 1,
          modifierGroups: [],
          remarks: "",
        },
      });

      if (res.addToCart) {
        const newCartItemId = res.addToCart;
        setCartItemIds((prev) => ({ ...prev, [itemId]: newCartItemId }));
        setOriginalQuantities((prev) => ({
          ...prev,
          [itemId]: quantities[itemId] || 1,
        }));
        await refreshCart();
        const res2 = await refreshCartDetails();
        if (res2?.CartDetails) {
          setCartDetails(res2.CartDetails);
        }
        // setToastData({
        //   type: "success",
        //   message: "Item updated successfully!",
        // });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setToastData({
        message: extractErrorMessage(error),
        type: "error",
      });
    } finally {
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const shouldShowUpdate = (itemId: string) => {
    return (
      selectedItems[itemId] && quantities[itemId] !== originalQuantities[itemId]
    );
  };

  return (
    <div className="w-full font-online-ordering sm:px-8 px-4 py-4 bg-white">
      <h3 className="text-xl sm:text-2xl font-semibold font-online-ordering pb-5">
        Goes well with
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:gap-4 gap-2">
        {upsellItem.map((item) => (
          <div
            key={item.itemId}
            className="flex items-center sm:gap-4 gap-2 border-[1px] rounded-[10px] border-gray-200 shadow-md"
          >
            {item.image && (
              <div className="relative w-[84px] h-full sm:w-24  flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  // className="object-cover rounded-l-[10px]"
                  className={`object-cover object-center w-full h-full rounded-l-[10px]`}
                />
              </div>
            )}
            <div className="bg-white h-auto min-h-[96px] sm:min-h-[105px] overflow-hidden transition-shadow flex-1 rounded-lg">
              <div className="flex h-full">
                <div className="flex flex-col flex-grow p-3 w-full">
                  <div className="flex-grow mb-2">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-bold text-lg line-clamp-1">
                        {item.name}
                      </h3>
                      <h2 className="text-xl font-online-ordering sm:px-4 px-2 font-semibold">
                        $
                        {(item.price * (quantities[item.itemId] || 1)).toFixed(
                          2
                        )}
                      </h2>
                    </div>
                    {item.desc && (
                      <p className="text-sm line-clamp-1 mt-1">{item.desc}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center sm:gap-2 gap-1 ">
                      <button
                        onClick={() => handleQuantityChange(item.itemId, -1)}
                        className="p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
                      >
                        <Minus size={isMobile ? 16 : 18} />
                      </button>
                      <span className="min-w-[20px] text-base lg:text-lg text-center">
                        {quantities[item.itemId] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.itemId, 1)}
                        className="p-[1px] hover:bg-gray-100 transition-colors duration-200 rounded-full border-[1px] border-black"
                      >
                        <Plus size={isMobile ? 16 : 18} />
                      </button>
                    </div>
                    {!selectedItems[item.itemId] ? (
                      <button
                        onClick={() => handleAddToCart(item.itemId, item.name)}
                        disabled={loadingItems[item.itemId]}
                        className="font-medium min-w-[100px] text-center transition-colors duration-200 border-primary border-[1px] px-4 py-1 rounded-full"
                      >
                        {loadingItems[item.itemId] ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : (
                          `Add`
                        )}
                      </button>
                    ) : shouldShowUpdate(item.itemId) ? (
                      <button
                        onClick={() => handleUpdateCart(item.itemId)}
                        disabled={loadingItems[item.itemId]}
                        className="font-medium min-w-[120px] text-center transition-colors duration-200 border-primary border-[1px] px-4 py-1 rounded-full"
                      >
                        {loadingItems[item.itemId] ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : (
                          `Update`
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(item.itemId)}
                        disabled={loadingItems[item.itemId]}
                        className="font-medium min-w-[120px] text-center transition-colors duration-200 border-primary border-[1px] px-4 py-1 rounded-full"
                      >
                        {loadingItems[item.itemId] ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : (
                          <p>{`Remove (${quantities[item.itemId] || 1})`}</p>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemOptions;
