// import { CartItem } from '@/utils/types';
import { CartItemInput } from "@/generated/graphql";
import { FetchCartDetails, GroupedCartItem } from "@/utils/types";
import { create } from "zustand";

interface CartStore {
  specialRemarks: string;
  setSpecialRemarks: (remarks: string) => void;

  freeItemInCart: { name: string; price: string } | null;
  setFreeItemInCart: (item: { name: string; price: string } | null) => void;

  freeItemImage: string | null;
  setFreeItemImage: (item: string | null) => void;

  totalAmount: number;
  setTotalAmount: (amount: number) => void;

  taxRates: { _id: string; name: string; salesTax: number }[] | undefined;
  setTaxRates: (
    rates: { _id: string; name: string; salesTax: number }[] | undefined
  ) => void;
  cartData: GroupedCartItem[];
  setCartData: (data: GroupedCartItem[]) => void;
  itemData: CartItemInput[];
  setItemData: (data: CartItemInput[]) => void;
  cartDetails: FetchCartDetails | null;
  setCartDetails: (data: FetchCartDetails) => void;
  cartCountInfo: number;
  setCartCountInfo: (data: number) => void;
  incrementCartCountInfo: (data: number) => void;
  fetchTrigger: number;
  setFetchTrigger: (data: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  specialRemarks: "",
  setSpecialRemarks: (remarks) => set({ specialRemarks: remarks }),

  freeItemImage: null,
  setFreeItemImage: (item) => set({ freeItemImage: item }),

  freeItemInCart: null,
  setFreeItemInCart: (item) => set({ freeItemInCart: item }),

  totalAmount: 0,
  setTotalAmount: (amount) => set({ totalAmount: amount }),

  cartData: [],
  taxRates: undefined,
  setTaxRates: (rates) => set({ taxRates: rates }), // Add this line
  setCartData: (data) => set({ cartData: data }),
  itemData: [],
  setItemData: (data) => set({ itemData: data }),
  cartDetails: null,
  setCartDetails: (data) => set({ cartDetails: data }),
  cartCountInfo: 0,
  setCartCountInfo: (data) => set({ cartCountInfo: data }),
  incrementCartCountInfo: (data) =>
    set((prev) => ({ cartCountInfo: prev.cartCountInfo + data })),

  fetchTrigger: 0,
  setFetchTrigger: (data) => set({ fetchTrigger: data }),
}));
