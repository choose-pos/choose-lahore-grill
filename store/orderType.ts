import { OrderType } from "@/generated/graphql";
import { create } from "zustand";

interface orderType {
  tempOrderType: OrderType;
  pendingOrderType: OrderType | null;
  setTempOrderType: (value: OrderType) => void;
  setPendingOrderType: (value: OrderType | null) => void;
}

export const OrderTypeData = create<orderType>((set) => ({
  tempOrderType: OrderType.Pickup,
  pendingOrderType: null,
  setTempOrderType: (data) => set({ tempOrderType: data }),
  setPendingOrderType: (data) => set({ pendingOrderType: data }),
}));
