"use client";

import { sdk } from "./graphqlClient";
import { GroupedCartItem } from "./types";

type RefreshCartResult = {
  groupedCart: GroupedCartItem[];
  message: string | null;
  error: unknown | null;
};

export const refreshCart = async (): Promise<RefreshCartResult> => {
  try {
    const res = await sdk.FetchCartItems({});
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
      const message = res.fetchCartItems.message || null;
      return { groupedCart, message, error: null };
    } else {
      return { groupedCart: [], message: null, error: null };
    }
  } catch (error) {
    console.error("Error refreshing cart:", error);
    return { groupedCart: [], message: null, error };
  }
};
