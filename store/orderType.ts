import { OrderType } from '@/generated/graphql';
import { create } from 'zustand';


interface orderType {
  tempOrderType: OrderType;
  setTempOrderType: (value: OrderType) => void;
}


export const OrderTypeData = create<orderType>((set) => ({
  tempOrderType: OrderType.Pickup,
  setTempOrderType: (data) => set({ tempOrderType: data }),
}));
